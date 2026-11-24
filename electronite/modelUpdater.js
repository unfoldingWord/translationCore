/**
 * Checks the AI models in ~/translationCore/models against the `.gguf` files published in a GitHub release,
 * and downloads the ones that are missing or different (see AppMenu → "Check for model updates").
 *
 * A local model is out of date when its SHA-256 differs from the digest GitHub reports for the release asset
 * (or, if the release doesn't give a digest, when its size differs). Hashing a model takes a few seconds per GB,
 * so the hashes are cached in `.model-digests.json` in the models folder and reused while a file's size and
 * modification time haven't changed.
 *
 * Downloads go to `<name>.download` (which llama-server doesn't list), are checked against the release digest,
 * and only then replace the model, so a failed or cancelled download never leaves a broken model behind.
 */
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

// the release that holds the current models - bump the tag to publish new models to users
const MODELS_RELEASE = Object.freeze({
  owner: 'unfoldingWord',
  repo: 'checking-tool-wrapper',
  tag: 'v0.9.0-beta',
});
const DIGEST_CACHE_FILE = '.model-digests.json';
const DOWNLOAD_SUFFIX = '.download';
const USER_AGENT = 'translationCore';
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 30 * 1000; // with no data received
const PROGRESS_INTERVAL_MS = 250;

/**
 * @param {{owner: string, repo: string, tag: string}} release
 * @return {string} GitHub API URL for the release
 */
function getReleaseApiUrl(release = MODELS_RELEASE) {
  return `https://api.github.com/repos/${release.owner}/${release.repo}/releases/tags/${encodeURIComponent(release.tag)}`;
}

/**
 * Starts a GET request, following redirects (GitHub release downloads redirect to a storage host).
 * @param {string} url
 * @param {object} [options]
 * @param {object} [options.headers]
 * @param {object} [options.signal] - `{ cancelled: boolean, onCancel: function }` from createCancelToken()
 * @param {number} [redirects=0]
 * @return {Promise<http.IncomingMessage>} a response with status 200
 */
function openUrl(url, { headers = {}, signal } = {}, redirects = 0) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'http:' ? http : https;
    const req = client.get(parsed.href, { headers: { 'User-Agent': USER_AGENT, ...headers } }, (res) => {
      const { statusCode, headers: resHeaders } = res;

      if ([301, 302, 303, 307, 308].includes(statusCode) && resHeaders.location) {
        res.resume();

        if (redirects >= MAX_REDIRECTS) {
          reject(new Error(`Too many redirects getting ${url}`));
          return;
        }
        // only the first request goes to GitHub - don't send its headers on to the storage host
        resolve(openUrl(new URL(resHeaders.location, url).href, { signal }, redirects + 1));
        return;
      }

      if (statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${statusCode} getting ${url}`));
        return;
      }
      resolve(res);
    });

    req.setTimeout(REQUEST_TIMEOUT_MS, () => req.destroy(new Error(`Timed out getting ${url}`)));
    req.on('error', reject);

    if (signal) {
      signal.onCancel(() => req.destroy(new Error('cancelled')));
    }
  });
}

/**
 * @param {string} url
 * @param {object} [headers]
 * @return {Promise<object>} the parsed JSON body
 */
async function getJson(url, headers = {}) {
  const res = await openUrl(url, { headers: { Accept: 'application/vnd.github+json', ...headers } });
  const chunks = [];

  for await (const chunk of res) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

/**
 * @param {string} digest - e.g. 'sha256:abc...'
 * @return {string|null} the lower-case hex SHA-256, or null if it isn't a SHA-256 digest
 */
function parseSha256Digest(digest) {
  const match = /^sha256:([0-9a-f]{64})$/i.exec(digest || '');
  return match ? match[1].toLowerCase() : null;
}

/**
 * Lists the `.gguf` files in a GitHub release.
 * @param {object} [options]
 * @param {string} [options.releaseUrl] - GitHub API URL for the release (default: MODELS_RELEASE)
 * @return {Promise<{tag: string, name: string, models: Array<{name: string, size: number, sha256: string|null,
 *   url: string, updatedAt: string}>}>}
 */
async function getReleaseModels({ releaseUrl = getReleaseApiUrl() } = {}) {
  const release = await getJson(releaseUrl);
  const models = (release.assets || [])
    .filter(asset => /\.gguf$/i.test(asset.name))
    .map(asset => ({
      name: asset.name,
      size: asset.size,
      sha256: parseSha256Digest(asset.digest),
      url: asset.browser_download_url,
      updatedAt: asset.updated_at,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    tag: release.tag_name, name: release.name, models,
  };
}

/**
 * @param {string} modelsDir
 * @return {object} cached digests: { [fileName]: { size, mtimeMs, sha256 } }
 */
function readDigestCache(modelsDir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(modelsDir, DIGEST_CACHE_FILE), 'utf8')) || {};
  } catch (e) {
    return {};
  }
}

/**
 * @param {string} modelsDir
 * @param {object} cache
 */
function writeDigestCache(modelsDir, cache) {
  try {
    fs.writeFileSync(path.join(modelsDir, DIGEST_CACHE_FILE), JSON.stringify(cache, null, 2));
  } catch (e) {
    console.warn(`modelUpdater: couldn't save the model digests: ${e.message}`);
  }
}

/**
 * @param {string} filePath
 * @return {Promise<string>} hex SHA-256 of the file
 */
async function hashFile(filePath) {
  const hash = crypto.createHash('sha256');

  for await (const chunk of fs.createReadStream(filePath)) {
    hash.update(chunk);
  }
  return hash.digest('hex');
}

/**
 * Gets the SHA-256 of a model, from the cache if the file hasn't changed since it was hashed.
 * @param {string} modelsDir
 * @param {string} name - file name in modelsDir
 * @param {fs.Stats} stats
 * @param {object} cache - updated in place
 * @return {Promise<string>}
 */
async function getLocalSha256(modelsDir, name, stats, cache) {
  const cached = cache[name];

  if (cached && cached.size === stats.size && cached.mtimeMs === stats.mtimeMs && cached.sha256) {
    return cached.sha256;
  }

  const sha256 = await hashFile(path.join(modelsDir, name));

  cache[name] = {
    size: stats.size, mtimeMs: stats.mtimeMs, sha256,
  };
  return sha256;
}

/**
 * Compares the models in the release with the ones in the models folder.
 * @param {object} options
 * @param {string} options.modelsDir
 * @param {string} [options.releaseUrl]
 * @return {Promise<{release: {tag: string, name: string}, updates: Array<object>, upToDate: Array<object>}>}
 *   `updates` are the release models that are missing (`status: 'missing'`) or different (`status: 'changed'`),
 *   each with `local: { size, modified }` when installed. `upToDate` are the ones that match.
 */
async function checkForModelUpdates({ modelsDir, releaseUrl }) {
  const release = await getReleaseModels({ releaseUrl });
  const cache = readDigestCache(modelsDir);
  const updates = [];
  const upToDate = [];

  for (const model of release.models) {
    let stats = null;

    try {
      stats = fs.statSync(path.join(modelsDir, model.name));
    } catch (e) {
      // not installed
    }

    if (!stats || !stats.isFile()) {
      updates.push({
        ...model, status: 'missing', local: null,
      });
      continue;
    }

    const local = { size: stats.size, modified: stats.mtime.toISOString() };
    let same = stats.size === model.size;

    if (same && model.sha256) {
      // hash one large file at a time
      // eslint-disable-next-line no-await-in-loop
      same = (await getLocalSha256(modelsDir, model.name, stats, cache)) === model.sha256;
    }

    (same ? upToDate : updates).push({
      ...model, status: same ? 'current' : 'changed', local,
    });
  }

  writeDigestCache(modelsDir, cache);
  return {
    release: { tag: release.tag, name: release.name }, updates, upToDate,
  };
}

/**
 * @return {{cancelled: boolean, cancel: function, onCancel: function}} lets a caller cancel downloads
 */
function createCancelToken() {
  const listeners = new Set();
  const token = {
    cancelled: false,
    cancel() {
      token.cancelled = true;
      listeners.forEach(listener => listener());
      listeners.clear();
    },
    onCancel(listener) {
      if (token.cancelled) {
        listener();
      } else {
        listeners.add(listener);
      }
    },
  };
  return token;
}

/**
 * Downloads one model to `<name>.download`, checking its size and SHA-256 against the release.
 * @param {object} model - from getReleaseModels()
 * @param {string} tempPath
 * @param {object} signal - from createCancelToken()
 * @param {function} onBytes - called with the bytes received so far
 * @return {Promise<string>} the downloaded file's SHA-256
 */
async function downloadToTemp(model, tempPath, signal, onBytes) {
  const res = await openUrl(model.url, { signal });
  const hash = crypto.createHash('sha256');
  const out = fs.createWriteStream(tempPath);
  let received = 0;

  try {
    await new Promise((resolve, reject) => {
      signal.onCancel(() => {
        res.destroy();
        reject(new Error('cancelled'));
      });
      res.on('data', (chunk) => {
        hash.update(chunk);
        received += chunk.length;
        onBytes(received);
      });
      res.on('error', reject);
      res.on('aborted', () => reject(new Error(`Download of ${model.name} was interrupted`)));
      out.on('error', reject);
      out.on('finish', resolve);
      res.pipe(out);
    });
  } finally {
    out.destroy();
  }

  if (received !== model.size) {
    throw new Error(`Download of ${model.name} is incomplete (${received} of ${model.size} bytes)`);
  }

  const sha256 = hash.digest('hex');

  if (model.sha256 && sha256 !== model.sha256) {
    throw new Error(`Download of ${model.name} is corrupt (SHA-256 doesn't match the release)`);
  }
  return sha256;
}

/**
 * Downloads models from the release into the models folder, one at a time.
 * @param {Array<object>} models - from checkForModelUpdates() (needs name, size, sha256, url)
 * @param {object} options
 * @param {string} options.modelsDir
 * @param {object} [options.signal] - from createCancelToken()
 * @param {function} [options.onProgress] - called with { name, index, count, received, total }
 * @param {function} [options.beforeReplace] - awaited before a model already in the folder is replaced (e.g.
 *   to stop llama-server so the file isn't in use)
 * @return {Promise<{downloaded: string[], errors: Array<{name: string, message: string}>, cancelled: boolean}>}
 */
async function downloadModels(models, {
  modelsDir, signal = createCancelToken(), onProgress = () => {}, beforeReplace,
}) {
  fs.mkdirSync(modelsDir, { recursive: true });
  const cache = readDigestCache(modelsDir);
  const downloaded = [];
  const errors = [];

  for (let index = 0; index < models.length && !signal.cancelled; index++) {
    const model = models[index];
    const name = path.basename(model.name); // never write outside modelsDir
    const finalPath = path.join(modelsDir, name);
    const tempPath = finalPath + DOWNLOAD_SUFFIX;
    let lastProgress = 0;

    const report = (received, force = false) => {
      const now = Date.now();

      if (force || now - lastProgress >= PROGRESS_INTERVAL_MS) {
        lastProgress = now;
        onProgress({
          name, index, count: models.length, received, total: model.size,
        });
      }
    };

    try {
      report(0, true);
      // download one model at a time
      // eslint-disable-next-line no-await-in-loop
      const sha256 = await downloadToTemp(model, tempPath, signal, report);
      report(model.size, true);

      if (fs.existsSync(finalPath) && beforeReplace) {
        await beforeReplace(name); // eslint-disable-line no-await-in-loop
      }
      fs.renameSync(tempPath, finalPath);

      const stats = fs.statSync(finalPath);

      cache[name] = {
        size: stats.size, mtimeMs: stats.mtimeMs, sha256,
      };
      writeDigestCache(modelsDir, cache);
      downloaded.push(name);
    } catch (e) {
      try {
        fs.rmSync(tempPath, { force: true });
      } catch (rmError) {
        console.warn(`modelUpdater: couldn't remove ${tempPath}: ${rmError.message}`);
      }

      if (!signal.cancelled) {
        console.error(`modelUpdater: failed to download ${name}:`, e);
        errors.push({ name, message: e.message });
      }
    }
  }

  return {
    downloaded, errors, cancelled: signal.cancelled,
  };
}

module.exports = {
  MODELS_RELEASE,
  getReleaseApiUrl,
  getReleaseModels,
  checkForModelUpdates,
  createCancelToken,
  downloadModels,
  hashFile,
  parseSha256Digest,
};
