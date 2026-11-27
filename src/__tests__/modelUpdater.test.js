/* eslint-env jest */
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import {
  EXTRA_MODELS,
  checkForModelUpdates,
  createCancelToken,
  downloadModels,
  findModelsRelease,
  getReleasesApiUrl,
  parseSha256Digest,
} from '../../electronite/modelUpdater';

const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

const MODEL_A = Buffer.from('model A v2');
const MODEL_B = Buffer.from('model B, the same as installed');
const MODEL_C = Buffer.from('model C - new');

/**
 * Starts a local server standing in for GitHub: the releases list at /releases (the models release among others), assets at /assets/<name>
 * (redirected through /redirect/<name>, like GitHub's storage redirect).
 * @param {object} [behavior]
 * @param {object} [behavior.assetBodies] - override what an asset serves, by name
 * @param {boolean} [behavior.hang] - asset downloads send part of the file and then stall
 * @return {Promise<{baseUrl: string, releasesUrl: string, extraFiles: object, close: function,
 *   requests: string[]}>} add to `extraFiles` to serve a file at /assets/<name> without listing it
 */
async function startFakeGitHub({ assetBodies = {}, hang = false } = {}) {
  const files = {
    'a.gguf': MODEL_A, 'b.gguf': MODEL_B, 'c.gguf': MODEL_C,
  };
  const extraFiles = {}; // served, but not listed in the release
  const requests = [];
  let baseUrl;

  const server = http.createServer((req, res) => {
    requests.push(req.url);

    if (req.url === '/releases-without-models') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify([{
        tag_name: 'v7.0.0', name: 'v7.0.0', published_at: '2026-11-20T00:00:00Z', assets: [],
      }]));
      return;
    }

    if (req.url === '/releases') {
      const assets = Object.entries(files).map(([name, data]) => ({
        name,
        size: data.length,
        digest: `sha256:${sha256(data)}`,
        browser_download_url: `${baseUrl}/redirect/${name}`,
        updated_at: '2026-11-19T15:46:04Z',
      }));

      assets.push({
        name: 'README.md', size: 1, digest: null, browser_download_url: `${baseUrl}/x`, updated_at: '',
      });
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify([
        { // newer, but not a models release
          tag_name: 'v7.0.0', name: 'v7.0.0', published_at: '2026-11-20T00:00:00Z', assets: [],
        },
        {
          tag_name: 'v0.9.0-beta', name: 'v0.9.0-llms - AI Models - Beta', published_at: '2026-11-19T16:14:03Z', assets,
        },
        { // an older models release
          tag_name: 'v0.8.0', name: 'v0.8.0-llms', published_at: '2026-10-01T00:00:00Z', assets: [],
        },
      ]));
      return;
    }

    const redirect = /^\/redirect\/(.+)$/.exec(req.url);

    if (redirect) {
      res.writeHead(302, { Location: `/assets/${redirect[1]}` });
      res.end();
      return;
    }

    const asset = /^\/assets\/(.+)$/.exec(req.url);

    const assetData = asset && (files[asset[1]] || extraFiles[asset[1]]);

    if (assetData) {
      const body = assetBodies[asset[1]] || assetData;
      res.writeHead(200, { 'Content-Length': body.length });

      if (hang) {
        res.write(body.slice(0, 2));
        return; // never finishes
      }
      res.end(body);
      return;
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  return {
    baseUrl,
    releasesUrl: `${baseUrl}/releases`,
    extraFiles,
    requests,
    close: () => new Promise((resolve) => {
      server.closeAllConnections && server.closeAllConnections();
      server.close(resolve);
    }),
  };
}

/**
 * @return {string} a models folder with an old a.gguf, the current b.gguf and no c.gguf
 */
function makeModelsDir() {
  const modelsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'model-updater-test-'));
  fs.writeFileSync(path.join(modelsDir, 'a.gguf'), Buffer.from('model A v1'));
  fs.writeFileSync(path.join(modelsDir, 'b.gguf'), MODEL_B);
  return modelsDir;
}

describe('modelUpdater', () => {
  let github;
  let modelsDir;

  afterEach(async () => {
    github && await github.close();
    github = null;
    modelsDir && fs.rmSync(modelsDir, { recursive: true, force: true });
  });

  test('getReleasesApiUrl() points at the repo\'s releases', () => {
    expect(getReleasesApiUrl({ owner: 'o', repo: 'r' }))
      .toEqual('https://api.github.com/repos/o/r/releases?per_page=100');
  });

  test('findModelsRelease() picks the newest published release with a v*-llms title', () => {
    const release = (name, publishedAt, extra = {}) => ({
      name, tag_name: name, published_at: publishedAt, ...extra,
    });
    const releases = [
      release('v2.0.0', '2026-12-01T00:00:00Z'),
      release('v1.1.0-llms', '2026-11-01T00:00:00Z'),
      release('v1.2.0-llms - draft', '2026-11-15T00:00:00Z', { draft: true }),
      release('v1.0.0-llms - uw LLM Models', '2026-10-01T00:00:00Z'),
      release('my-llms', '2026-11-20T00:00:00Z'),
      release('v1.3.0-llmsx', '2026-11-20T00:00:00Z'),
    ];

    expect(findModelsRelease(releases).name).toEqual('v1.1.0-llms');
    expect(findModelsRelease(releases.slice(3)).name).toEqual('v1.0.0-llms - uw LLM Models');
    expect(findModelsRelease([release('v2.0.0', '2026-12-01T00:00:00Z')])).toBeNull();
    expect(findModelsRelease([])).toBeNull();
  });

  test('checkForModelUpdates() rejects when there is no models release', async () => {
    github = await startFakeGitHub();
    modelsDir = makeModelsDir();

    await expect(checkForModelUpdates({ modelsDir, releasesUrl: `${github.baseUrl}/releases-without-models` }))
      .rejects.toThrow('No release with a "v*-llms" title');
  });

  test('parseSha256Digest() accepts only sha256 digests', () => {
    expect(parseSha256Digest(`sha256:${'A'.repeat(64)}`)).toEqual('a'.repeat(64));
    expect(parseSha256Digest('md5:abc')).toBeNull();
    expect(parseSha256Digest(null)).toBeNull();
  });

  test('checkForModelUpdates() reports missing and changed models, and caches the local hashes', async () => {
    github = await startFakeGitHub();
    modelsDir = makeModelsDir();

    const result = await checkForModelUpdates({
      modelsDir, releasesUrl: github.releasesUrl, extraModels: [],
    });

    expect(result.release).toEqual({ tag: 'v0.9.0-beta', name: 'v0.9.0-llms - AI Models - Beta' });
    expect(result.updates.map(m => [m.name, m.status])).toEqual([['a.gguf', 'changed'], ['c.gguf', 'missing']]);
    expect(result.upToDate.map(m => m.name)).toEqual(['b.gguf']);
    expect(result.updates[0].local.size).toEqual(10);
    expect(result.updates[1].local).toBeNull();

    const cache = JSON.parse(fs.readFileSync(path.join(modelsDir, '.model-digests.json'), 'utf8'));
    expect(cache['b.gguf'].sha256).toEqual(sha256(MODEL_B));
  });

  test('checkForModelUpdates() uses the cached hash while the file is unchanged', async () => {
    github = await startFakeGitHub();
    modelsDir = makeModelsDir();
    const file = path.join(modelsDir, 'b.gguf');
    const stats = fs.statSync(file);

    // a wrong cached hash for an unchanged file is trusted, so b.gguf shows as changed
    fs.writeFileSync(path.join(modelsDir, '.model-digests.json'), JSON.stringify({
      'b.gguf': {
        size: stats.size, mtimeMs: stats.mtimeMs, sha256: 'f'.repeat(64),
      },
    }));

    const result = await checkForModelUpdates({
      modelsDir, releasesUrl: github.releasesUrl, extraModels: [],
    });

    expect(result.updates.map(m => m.name)).toContain('b.gguf');
  });

  test('checkForModelUpdates() rejects when the release can\'t be read', async () => {
    github = await startFakeGitHub();
    modelsDir = makeModelsDir();

    await expect(checkForModelUpdates({ modelsDir, releasesUrl: `${github.baseUrl}/missing` }))
      .rejects.toThrow('HTTP 404');
  });

  test('EXTRA_MODELS are complete and pinned to a commit', () => {
    expect(EXTRA_MODELS.map(m => m.name)).toContain('Qwen3-4B-Instruct-2507-Q4_K_M.gguf');

    for (const model of EXTRA_MODELS) {
      expect(model.name).toMatch(/\.gguf$/);
      expect(model.size).toBeGreaterThan(0);
      expect(model.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(model.url).toMatch(/^https:\/\/huggingface\.co\/.+\/resolve\/[0-9a-f]{40}\//);
      expect(model.url.endsWith(`/${model.name}`)).toBe(true);
    }
  });

  test('checkForModelUpdates() also offers the extra models, and downloads them', async () => {
    github = await startFakeGitHub();
    modelsDir = makeModelsDir();
    const extra = Buffer.from('extra model');
    const extraModels = [
      {
        name: 'extra.gguf',
        size: extra.length,
        sha256: sha256(extra),
        url: `${github.baseUrl}/redirect/extra.gguf`,
        updatedAt: '2025-08-06T15:39:11.000Z',
      },
      { // same name as a release model - the release's entry wins
        name: 'b.gguf', size: 1, sha256: 'f'.repeat(64), url: `${github.baseUrl}/x`, updatedAt: '',
      },
    ];
    github.extraFiles['extra.gguf'] = extra;

    const { updates, upToDate } = await checkForModelUpdates({
      modelsDir, releasesUrl: github.releasesUrl, extraModels,
    });

    expect(updates.map(m => [m.name, m.status])).toEqual([
      ['a.gguf', 'changed'], ['c.gguf', 'missing'], ['extra.gguf', 'missing'],
    ]);
    expect(upToDate.map(m => m.name)).toEqual(['b.gguf']);

    const result = await downloadModels(updates.filter(m => m.name === 'extra.gguf'), { modelsDir });

    expect(result.downloaded).toEqual(['extra.gguf']);
    expect(fs.readFileSync(path.join(modelsDir, 'extra.gguf'))).toEqual(extra);
  });

  test('downloadModels() downloads, verifies and replaces models, and reports progress', async () => {
    github = await startFakeGitHub();
    modelsDir = makeModelsDir();
    const { updates } = await checkForModelUpdates({
      modelsDir, releasesUrl: github.releasesUrl, extraModels: [],
    });
    const progress = [];
    const replaced = [];

    const result = await downloadModels(updates, {
      modelsDir,
      onProgress: p => progress.push(p),
      beforeReplace: (name) => replaced.push(name),
    });

    expect(result).toEqual({
      downloaded: ['a.gguf', 'c.gguf'], errors: [], cancelled: false,
    });
    expect(fs.readFileSync(path.join(modelsDir, 'a.gguf'))).toEqual(MODEL_A);
    expect(fs.readFileSync(path.join(modelsDir, 'c.gguf'))).toEqual(MODEL_C);
    expect(replaced).toEqual(['a.gguf']); // only called for a model that was already there
    expect(progress[progress.length - 1]).toEqual({
      name: 'c.gguf', index: 1, count: 2, received: MODEL_C.length, total: MODEL_C.length,
    });
    expect(fs.readdirSync(modelsDir).filter(f => f.endsWith('.download'))).toEqual([]);

    // now everything is current, using the hashes saved by the download
    const recheck = await checkForModelUpdates({
      modelsDir, releasesUrl: github.releasesUrl, extraModels: [],
    });
    expect(recheck.updates).toEqual([]);
  });

  test('downloadModels() keeps the old model when the download doesn\'t match the digest', async () => {
    github = await startFakeGitHub({ assetBodies: { 'a.gguf': Buffer.from('model A vX') } }); // same size
    modelsDir = makeModelsDir();
    const { updates } = await checkForModelUpdates({
      modelsDir, releasesUrl: github.releasesUrl, extraModels: [],
    });

    const result = await downloadModels(updates.filter(m => m.name === 'a.gguf'), { modelsDir });

    expect(result.downloaded).toEqual([]);
    expect(result.errors).toEqual([{ name: 'a.gguf', message: expect.stringContaining('SHA-256') }]);
    expect(fs.readFileSync(path.join(modelsDir, 'a.gguf'), 'utf8')).toEqual('model A v1');
    expect(fs.existsSync(path.join(modelsDir, 'a.gguf.download'))).toBe(false);
  });

  test('downloadModels() stops and cleans up when cancelled', async () => {
    github = await startFakeGitHub({ hang: true });
    modelsDir = makeModelsDir();
    const { updates } = await checkForModelUpdates({
      modelsDir, releasesUrl: github.releasesUrl, extraModels: [],
    });
    const signal = createCancelToken();

    const download = downloadModels(updates, {
      modelsDir,
      signal,
      onProgress: (p) => p.received > 0 && signal.cancel(),
    });
    setTimeout(() => signal.cancel(), 300); // progress is throttled, so it may not report the partial data

    const result = await download;

    expect(result).toEqual({
      downloaded: [], errors: [], cancelled: true,
    });
    expect(fs.readFileSync(path.join(modelsDir, 'a.gguf'), 'utf8')).toEqual('model A v1');
    expect(fs.readdirSync(modelsDir).filter(f => f.endsWith('.download'))).toEqual([]);
  });
});
