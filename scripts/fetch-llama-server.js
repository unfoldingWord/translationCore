#!/usr/bin/env node
/**
 * Downloads the pinned llama.cpp release builds and extracts only what llama-server needs into
 * vendor/llama-server/<platform>-<arch>/ so the build can copy them into the packaged app.
 *
 * Usage:
 *   node scripts/fetch-llama-server.js                 # targets for this host OS (see DEFAULT_TARGETS)
 *   node scripts/fetch-llama-server.js --all           # every target
 *   node scripts/fetch-llama-server.js --targets=linux-x64,win32-x64
 *   node scripts/fetch-llama-server.js --force         # re-extract even if up to date
 *   node scripts/fetch-llama-server.js --update-checksums   # after bumping llamaCppTag in package.json
 *
 * The release tag is `llamaCppTag` in package.json. Downloads are verified against
 * scripts/llama-server-checksums.json. Set GITHUB_TOKEN to avoid API rate limits with --update-checksums.
 */
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const REPO = 'ggml-org/llama.cpp';
const VENDOR_DIR = path.join(ROOT, 'vendor', 'llama-server');
const CACHE_DIR = path.join(VENDOR_DIR, '.cache');
const CHECKSUMS_PATH = path.join(__dirname, 'llama-server-checksums.json');
const STAMP_FILE = '.llama-server.json';
const USER_AGENT = 'translationCore-build-script';

/**
 * Build targets. `cpuVariants` lists the ggml CPU backend variants to keep (the rest are dropped). Each must
 * include a baseline variant so llama-server can load on any CPU of that architecture.
 * null means the build has a single CPU library (macOS) and nothing is filtered.
 */
const TARGETS = {
  'darwin-arm64': { asset: 'bin-macos-arm64.tar.gz', cpuVariants: null },
  'darwin-x64': { asset: 'bin-macos-x64.tar.gz', cpuVariants: null },
  'linux-x64': { asset: 'bin-ubuntu-vulkan-x64.tar.gz', cpuVariants: ['x64', 'haswell'] },
  // armv8.0 baseline only - matches the minimum CPU Electron supports on Linux arm64
  'linux-arm64': { asset: 'bin-ubuntu-vulkan-arm64.tar.gz', cpuVariants: ['armv8.0_1'] },
  'win32-x64': { asset: 'bin-win-vulkan-x64.zip', cpuVariants: ['x64', 'haswell'], msvcRuntime: true },
};

// targets fetched by default, matching what each OS builds in CI
const DEFAULT_TARGETS = {
  darwin: ['darwin-arm64', 'darwin-x64'],
  linux: ['linux-x64', 'linux-arm64'],
  win32: ['win32-x64'],
};

// MSVC runtime DLLs imported by the Windows build but not shipped in the upstream zip
const MSVC_RUNTIME_DLLS = ['msvcp140.dll', 'vcruntime140.dll', 'vcruntime140_1.dll'];

/**
 * @param {string[]} argv
 * @return {{all: boolean, force: boolean, updateChecksums: boolean, targets: string[]|null}}
 */
function parseArgs(argv) {
  const args = {
    all: false, force: false, updateChecksums: false, targets: null,
  };

  for (const arg of argv) {
    if (arg === '--all') {
      args.all = true;
    } else if (arg === '--force') {
      args.force = true;
    } else if (arg === '--update-checksums') {
      args.updateChecksums = true;
    } else if (arg.startsWith('--targets=')) {
      args.targets = arg.substring('--targets='.length).split(',').map(t => t.trim()).filter(Boolean);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

/**
 * @return {string} pinned llama.cpp release tag from package.json
 */
function getTag() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const tag = pkg.llamaCppTag;

  if (!tag) {
    throw new Error('package.json is missing "llamaCppTag"');
  }
  return tag;
}

/**
 * @param {string} tag
 * @param {string} target
 * @return {string} upstream asset file name
 */
function assetName(tag, target) {
  return `llama-${tag}-${TARGETS[target].asset}`;
}

/**
 * GET a URL, following redirects.
 * @param {string} url
 * @param {object} headers
 * @return {Promise<IncomingMessage>} response with status 200
 */
function request(url, headers = {}, redirects = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': USER_AGENT, ...headers } }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        res.resume();

        if (redirects >= 10) {
          reject(new Error(`Too many redirects for ${url}`));
          return;
        }
        // don't forward auth headers to the redirected (storage) host
        resolve(request(new URL(res.headers.location, url).toString(), {}, redirects + 1));
        return;
      }

      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`GET ${url} failed: HTTP ${res.statusCode}`));
        return;
      }
      resolve(res);
    });
    req.on('error', reject);
  });
}

/**
 * @param {string} url
 * @param {object} headers
 * @return {Promise<any>}
 */
async function getJson(url, headers) {
  const res = await request(url, headers);
  const chunks = [];

  for await (const chunk of res) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

/**
 * Downloads url to dest, returning its sha256. Writes to a temp file first so a failed download never
 * leaves a partial file at dest.
 * @param {string} url
 * @param {string} dest
 * @return {Promise<string>} hex sha256
 */
async function download(url, dest) {
  const tmp = `${dest}.download`;
  const res = await request(url);
  const total = parseInt(res.headers['content-length'] || '0', 10);
  const hash = crypto.createHash('sha256');
  const out = fs.createWriteStream(tmp);
  let received = 0;
  let lastPct = -1;

  await new Promise((resolve, reject) => {
    res.on('data', (chunk) => {
      hash.update(chunk);
      received += chunk.length;
      const pct = total ? Math.floor((received / total) * 100) : -1;

      if (pct >= 0 && pct % 10 === 0 && pct !== lastPct) {
        lastPct = pct;
        process.stdout.write(`  ${pct}%`);
      }
    });
    res.on('error', reject);
    out.on('error', reject);
    out.on('finish', resolve);
    res.pipe(out);
  });
  process.stdout.write('\n');
  fs.renameSync(tmp, dest);
  return hash.digest('hex');
}

/**
 * @param {string} file
 * @return {string} hex sha256 of file
 */
function sha256File(file) {
  const hash = crypto.createHash('sha256');
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(1024 * 1024);
  let bytes;

  try {
    while ((bytes = fs.readSync(fd, buf, 0, buf.length, null)) > 0) {
      hash.update(buf.subarray(0, bytes));
    }
  } finally {
    fs.closeSync(fd);
  }
  return hash.digest('hex');
}

/**
 * @return {{tag: string, assets: Object<string, string>}|null}
 */
function readChecksums() {
  if (!fs.existsSync(CHECKSUMS_PATH)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(CHECKSUMS_PATH, 'utf8'));
}

/**
 * Writes checksums for every target's asset at the pinned tag, using the sha256 digests GitHub publishes
 * for release assets. Falls back to downloading and hashing an asset if no digest is published.
 * @param {string} tag
 */
async function updateChecksums(tag) {
  const headers = { Accept: 'application/vnd.github+json' };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const release = await getJson(`https://api.github.com/repos/${REPO}/releases/tags/${tag}`, headers);
  const assets = {};

  for (const target of Object.keys(TARGETS)) {
    const name = assetName(tag, target);
    const asset = (release.assets || []).find(a => a.name === name);

    if (!asset) {
      throw new Error(`Release ${tag} has no asset ${name}`);
    }

    if (asset.digest && asset.digest.startsWith('sha256:')) {
      assets[name] = asset.digest.substring('sha256:'.length);
    } else {
      console.log(`No published digest for ${name}, downloading to hash it`);
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      assets[name] = await download(asset.browser_download_url, path.join(CACHE_DIR, name));
    }
    console.log(`${assets[name]}  ${name}`);
  }

  fs.writeFileSync(CHECKSUMS_PATH, JSON.stringify({ tag, assets }, null, 2) + '\n');
  console.log(`Wrote ${path.relative(ROOT, CHECKSUMS_PATH)}`);
}

/**
 * Makes sure the verified archive for target is in the cache.
 * @param {string} tag
 * @param {string} target
 * @param {{tag: string, assets: Object<string, string>}} checksums
 * @return {Promise<{file: string, sha256: string}>}
 */
async function ensureArchive(tag, target, checksums) {
  const name = assetName(tag, target);
  const expected = checksums.assets[name];

  if (!expected) {
    throw new Error(`No checksum for ${name} in ${path.relative(ROOT, CHECKSUMS_PATH)}. ` +
      'Run with --update-checksums after changing llamaCppTag.');
  }

  const file = path.join(CACHE_DIR, name);

  if (fs.existsSync(file) && sha256File(file) === expected) {
    console.log(`Using cached ${name}`);
    return { file, sha256: expected };
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  console.log(`Downloading ${name}`);
  const actual = await download(`https://github.com/${REPO}/releases/download/${tag}/${name}`, file);

  if (actual !== expected) {
    fs.unlinkSync(file);
    throw new Error(`Checksum mismatch for ${name}: expected ${expected}, got ${actual}`);
  }
  return { file, sha256: expected };
}

/**
 * @param {string} archive
 * @param {string} dest - empty folder to extract into
 */
function extract(archive, dest) {
  if (archive.endsWith('.zip')) {
    // the Windows zip has no symlinks, so adm-zip is fine here
    const AdmZip = require('adm-zip');
    new AdmZip(archive).extractAllTo(dest, true);
  } else {
    // system tar keeps symlinks and file modes (available on macOS, Linux and Windows 10+)
    execFileSync('tar', ['-xzf', archive, '-C', dest], { stdio: 'inherit' });
  }
}

/**
 * Finds the folder in the extracted archive that holds llama-server.
 * @param {string} dir
 * @return {string}
 */
function findServerDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  if (entries.some(e => e.name === 'llama-server' || e.name === 'llama-server.exe')) {
    return dir;
  }

  for (const e of entries) {
    if (e.isDirectory()) {
      const found = findServerDir(path.join(dir, e.name));

      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * Decides whether an archive entry is part of the llama-server file set.
 * @param {string} name - file name
 * @param {string[]|null} cpuVariants - ggml CPU variants to keep, or null to keep all
 * @return {boolean}
 */
function isNeeded(name, cpuVariants) {
  if (name === 'llama-server' || name === 'llama-server.exe' || name.startsWith('LICENSE')) {
    return true;
  }

  const isSharedLib = /\.(dylib|dll)$/.test(name) || /\.so(\.\d+)*$/.test(name);

  if (!isSharedLib) {
    return false; // other tools (llama-cli, llama-bench, ...) and support files
  }

  if (/-impl\./.test(name) && !/llama-server-impl\./.test(name)) {
    return false; // implementation libraries of the other tools
  }

  const cpuMatch = name.match(/ggml-cpu-(.+)\.(so|dll)$/);

  if (cpuMatch && cpuVariants) {
    return cpuVariants.includes(cpuMatch[1]);
  }
  return true;
}

/**
 * Copies the needed files from srcDir to destDir, keeping symlinks as symlinks.
 * @param {string} srcDir
 * @param {string} destDir
 * @param {string[]|null} cpuVariants
 * @return {string[]} copied file names
 */
function copyServerFiles(srcDir, destDir, cpuVariants) {
  const copied = [];

  for (const name of fs.readdirSync(srcDir).sort()) {
    if (!isNeeded(name, cpuVariants)) {
      continue;
    }

    const src = path.join(srcDir, name);
    const dest = path.join(destDir, name);
    const stat = fs.lstatSync(src);

    if (stat.isSymbolicLink()) {
      fs.symlinkSync(fs.readlinkSync(src), dest);
    } else if (stat.isFile()) {
      fs.copyFileSync(src, dest);
      fs.chmodSync(dest, stat.mode);
    } else {
      continue;
    }
    copied.push(name);
  }
  return copied;
}

/**
 * Copies the MSVC runtime DLLs from System32 next to llama-server.exe (app-local deployment), so it runs on
 * machines without the Visual C++ Redistributable. Only possible when running on 64-bit Windows.
 * @param {string} destDir
 * @return {boolean} true if copied
 */
function addMsvcRuntime(destDir) {
  if (process.platform !== 'win32') {
    console.warn('  WARNING: not on Windows, so the MSVC runtime DLLs were not added. llama-server.exe will ' +
      `need the Visual C++ Redistributable (${MSVC_RUNTIME_DLLS.join(', ')}).`);
    return false;
  }

  const system32 = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32');

  for (const dll of MSVC_RUNTIME_DLLS) {
    const src = path.join(system32, dll);

    if (!fs.existsSync(src)) {
      throw new Error(`MSVC runtime DLL not found: ${src}`);
    }
    fs.copyFileSync(src, path.join(destDir, dll));
  }
  console.log(`  added ${MSVC_RUNTIME_DLLS.join(', ')} from ${system32}`);
  return true;
}

/**
 * Checks the extracted folder is usable: llama-server present, no dangling symlinks, the required CPU
 * variants present.
 * @param {string} dir
 * @param {string} target
 */
function validate(dir, target) {
  const names = fs.readdirSync(dir);
  const exe = target.startsWith('win32') ? 'llama-server.exe' : 'llama-server';

  if (!names.includes(exe)) {
    throw new Error(`${target}: ${exe} missing after extraction`);
  }

  for (const name of names) {
    const p = path.join(dir, name);

    if (fs.lstatSync(p).isSymbolicLink() && !fs.existsSync(p)) {
      throw new Error(`${target}: dangling symlink ${name} -> ${fs.readlinkSync(p)}`);
    }
  }

  for (const variant of TARGETS[target].cpuVariants || []) {
    if (!names.some(n => n.match(new RegExp(`ggml-cpu-${variant.replace(/\./g, '\\.')}\\.(so|dll)$`)))) {
      throw new Error(`${target}: CPU variant ${variant} not found in the release. Update cpuVariants.`);
    }
  }
}

/**
 * @param {string} dir
 * @return {number} total bytes of regular files in dir
 */
function dirSize(dir) {
  return fs.readdirSync(dir)
    .map(name => fs.lstatSync(path.join(dir, name)))
    .filter(s => s.isFile())
    .reduce((sum, s) => sum + s.size, 0);
}

/**
 * Downloads and extracts one target, unless it's already up to date.
 * @param {string} tag
 * @param {string} target
 * @param {{tag: string, assets: Object<string, string>}} checksums
 * @param {boolean} force
 */
async function fetchTarget(tag, target, checksums, force) {
  const { cpuVariants, msvcRuntime } = TARGETS[target];
  const destDir = path.join(VENDOR_DIR, target);
  const stampPath = path.join(destDir, STAMP_FILE);
  const expectedSha = checksums.assets[assetName(tag, target)];

  if (!force && fs.existsSync(stampPath)) {
    const stamp = JSON.parse(fs.readFileSync(stampPath, 'utf8'));
    const msvcOk = !msvcRuntime || stamp.msvcRuntime || process.platform !== 'win32';

    if (stamp.tag === tag && stamp.sha256 === expectedSha &&
      JSON.stringify(stamp.cpuVariants) === JSON.stringify(cpuVariants) && msvcOk) {
      console.log(`${target}: up to date (${tag})`);
      return;
    }
  }

  const { file, sha256 } = await ensureArchive(tag, target, checksums);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `llama-server-${target}-`));

  try {
    console.log(`${target}: extracting`);
    extract(file, tmpDir);
    const serverDir = findServerDir(tmpDir);

    if (!serverDir) {
      throw new Error(`${target}: llama-server not found in ${path.basename(file)}`);
    }

    fs.rmSync(destDir, { recursive: true, force: true });
    fs.mkdirSync(destDir, { recursive: true });
    const copied = copyServerFiles(serverDir, destDir, cpuVariants);
    const addedMsvc = msvcRuntime ? addMsvcRuntime(destDir) : false;

    if (!copied.includes('LICENSE')) {
      // the Windows zip ships only the OpenMP license, so get llama.cpp's MIT license from the tagged source
      await download(`https://raw.githubusercontent.com/${REPO}/${tag}/LICENSE`, path.join(destDir, 'LICENSE'));
      copied.push('LICENSE');
    }
    validate(destDir, target);

    fs.writeFileSync(stampPath, JSON.stringify({
      tag,
      asset: path.basename(file),
      sha256,
      cpuVariants,
      msvcRuntime: addedMsvc,
      files: copied,
    }, null, 2) + '\n');
    console.log(`${target}: ${copied.length} files, ${(dirSize(destDir) / 1e6).toFixed(1)} MB -> ` +
      path.relative(ROOT, destDir));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const tag = getTag();

  if (args.updateChecksums) {
    await updateChecksums(tag);
    return;
  }

  const checksums = readChecksums();

  if (!checksums || checksums.tag !== tag) {
    throw new Error(`${path.relative(ROOT, CHECKSUMS_PATH)} is missing or not for ${tag}. ` +
      'Run with --update-checksums.');
  }

  let targets = args.targets || DEFAULT_TARGETS[process.platform] || [];

  if (args.all) {
    targets = Object.keys(TARGETS);
  }

  const unknown = targets.filter(t => !TARGETS[t]);

  if (unknown.length) {
    throw new Error(`Unknown target(s): ${unknown.join(', ')}. Known: ${Object.keys(TARGETS).join(', ')}`);
  }

  if (!targets.length) {
    console.log(`No llama-server targets for platform ${process.platform}`);
    return;
  }

  for (const target of targets) {
    await fetchTarget(tag, target, checksums, args.force);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(`fetch-llama-server: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { isNeeded, TARGETS };
