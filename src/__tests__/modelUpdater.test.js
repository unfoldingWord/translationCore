/* eslint-env jest */
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import {
  checkForModelUpdates,
  createCancelToken,
  downloadModels,
  getReleaseApiUrl,
  parseSha256Digest,
} from '../../electronite/modelUpdater';

const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

const MODEL_A = Buffer.from('model A v2');
const MODEL_B = Buffer.from('model B, the same as installed');
const MODEL_C = Buffer.from('model C - new');

/**
 * Starts a local server standing in for GitHub: the release JSON at /release, assets at /assets/<name>
 * (redirected through /redirect/<name>, like GitHub's storage redirect).
 * @param {object} [behavior]
 * @param {object} [behavior.assetBodies] - override what an asset serves, by name
 * @param {boolean} [behavior.hang] - asset downloads send part of the file and then stall
 * @return {Promise<{baseUrl: string, releaseUrl: string, close: function, requests: string[]}>}
 */
async function startFakeGitHub({ assetBodies = {}, hang = false } = {}) {
  const files = {
    'a.gguf': MODEL_A, 'b.gguf': MODEL_B, 'c.gguf': MODEL_C,
  };
  const requests = [];
  let baseUrl;

  const server = http.createServer((req, res) => {
    requests.push(req.url);

    if (req.url === '/release') {
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
      res.end(JSON.stringify({
        tag_name: 'v0.9.0-beta', name: 'AI Models - Beta', assets,
      }));
      return;
    }

    const redirect = /^\/redirect\/(.+)$/.exec(req.url);

    if (redirect) {
      res.writeHead(302, { Location: `/assets/${redirect[1]}` });
      res.end();
      return;
    }

    const asset = /^\/assets\/(.+)$/.exec(req.url);

    if (asset && files[asset[1]]) {
      const body = assetBodies[asset[1]] || files[asset[1]];
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
    releaseUrl: `${baseUrl}/release`,
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

  test('getReleaseApiUrl() points at the release tag', () => {
    expect(getReleaseApiUrl({
      owner: 'o', repo: 'r', tag: 'v1.0',
    }))
      .toEqual('https://api.github.com/repos/o/r/releases/tags/v1.0');
  });

  test('parseSha256Digest() accepts only sha256 digests', () => {
    expect(parseSha256Digest(`sha256:${'A'.repeat(64)}`)).toEqual('a'.repeat(64));
    expect(parseSha256Digest('md5:abc')).toBeNull();
    expect(parseSha256Digest(null)).toBeNull();
  });

  test('checkForModelUpdates() reports missing and changed models, and caches the local hashes', async () => {
    github = await startFakeGitHub();
    modelsDir = makeModelsDir();

    const result = await checkForModelUpdates({ modelsDir, releaseUrl: github.releaseUrl });

    expect(result.release).toEqual({ tag: 'v0.9.0-beta', name: 'AI Models - Beta' });
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

    const result = await checkForModelUpdates({ modelsDir, releaseUrl: github.releaseUrl });

    expect(result.updates.map(m => m.name)).toContain('b.gguf');
  });

  test('checkForModelUpdates() rejects when the release can\'t be read', async () => {
    github = await startFakeGitHub();
    modelsDir = makeModelsDir();

    await expect(checkForModelUpdates({ modelsDir, releaseUrl: `${github.baseUrl}/missing` }))
      .rejects.toThrow('HTTP 404');
  });

  test('downloadModels() downloads, verifies and replaces models, and reports progress', async () => {
    github = await startFakeGitHub();
    modelsDir = makeModelsDir();
    const { updates } = await checkForModelUpdates({ modelsDir, releaseUrl: github.releaseUrl });
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
    const recheck = await checkForModelUpdates({ modelsDir, releaseUrl: github.releaseUrl });
    expect(recheck.updates).toEqual([]);
  });

  test('downloadModels() keeps the old model when the download doesn\'t match the digest', async () => {
    github = await startFakeGitHub({ assetBodies: { 'a.gguf': Buffer.from('model A vX') } }); // same size
    modelsDir = makeModelsDir();
    const { updates } = await checkForModelUpdates({ modelsDir, releaseUrl: github.releaseUrl });

    const result = await downloadModels(updates.filter(m => m.name === 'a.gguf'), { modelsDir });

    expect(result.downloaded).toEqual([]);
    expect(result.errors).toEqual([{ name: 'a.gguf', message: expect.stringContaining('SHA-256') }]);
    expect(fs.readFileSync(path.join(modelsDir, 'a.gguf'), 'utf8')).toEqual('model A v1');
    expect(fs.existsSync(path.join(modelsDir, 'a.gguf.download'))).toBe(false);
  });

  test('downloadModels() stops and cleans up when cancelled', async () => {
    github = await startFakeGitHub({ hang: true });
    modelsDir = makeModelsDir();
    const { updates } = await checkForModelUpdates({ modelsDir, releaseUrl: github.releaseUrl });
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
