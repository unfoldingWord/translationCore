#!/usr/bin/env node
/**
 * Copies the llama-server files fetched by scripts/fetch-llama-server.js into each packaged app in dist/,
 * then smoke-tests the copies this machine can run. Runs after electronite-packager and before the gulp
 * release tasks (DMG, deb, Windows installer).
 *
 * Copying after packaging keeps the multi-arch packager calls unchanged, and for the macOS universal app it
 * happens after the arm64 and x64 halves are merged, so @electron/universal never sees these files.
 *
 * Usage:
 *   node scripts/add-llama-server.js [--dist=dist] [--no-smoke-test]
 *
 * Set LLAMA_SERVER_SKIP_SMOKE_TEST=1 to skip the smoke test (same as --no-smoke-test).
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const VENDOR_DIR = path.join(ROOT, 'vendor', 'llama-server');
const DEST_FOLDER = 'llama-server';
const SMOKE_TEST_TIMEOUT_MS = 60 * 1000;

/**
 * Which vendor/llama-server targets go into each packaged folder (dist/<name>-<platform>-<arch>).
 * An empty list means this build gets no llama-server (no upstream build for it).
 */
const PACKAGED_TARGETS = {
  'darwin-x64': ['darwin-x64'],
  'darwin-arm64': ['darwin-arm64'],
  'darwin-universal': ['darwin-arm64', 'darwin-x64'],
  'linux-x64': ['linux-x64'],
  'linux-arm64': ['linux-arm64'],
  'win32-x64': ['win32-x64'],
  'win32-ia32': [],
};

// expected CPU architecture of the binaries in each target, checked by reading their headers
const TARGET_ARCH = {
  'darwin-x64': 'x64',
  'darwin-arm64': 'arm64',
  'linux-x64': 'x64',
  'linux-arm64': 'arm64',
  'win32-x64': 'x64',
};

/**
 * @param {string[]} argv
 * @return {{dist: string, smokeTest: boolean}}
 */
function parseArgs(argv) {
  const args = { dist: path.join(ROOT, 'dist'), smokeTest: !process.env.LLAMA_SERVER_SKIP_SMOKE_TEST };

  for (const arg of argv) {
    if (arg.startsWith('--dist=')) {
      args.dist = path.resolve(arg.substring('--dist='.length));
    } else if (arg === '--no-smoke-test') {
      args.smokeTest = false;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

/**
 * @param {string} target
 * @return {string} file name of the llama-server executable for target
 */
function exeName(target) {
  return target.startsWith('win32') ? 'llama-server.exe' : 'llama-server';
}

/**
 * Finds where llama-server goes inside a packaged folder.
 * @param {string} packagedDir - e.g. dist/translationCore-darwin-universal
 * @param {string} platform
 * @return {string} the resources folder of the app
 */
function getResourcesDir(packagedDir, platform) {
  if (platform === 'darwin') {
    const app = fs.readdirSync(packagedDir).find(name => name.endsWith('.app'));

    if (!app) {
      throw new Error(`No .app found in ${packagedDir}`);
    }
    return path.join(packagedDir, app, 'Contents', 'Resources');
  }

  const resources = path.join(packagedDir, 'resources');

  if (!fs.existsSync(resources)) {
    throw new Error(`No resources folder found in ${packagedDir}`);
  }
  return resources;
}

/**
 * Copies a vendor target folder, keeping symlinks as symlinks and file modes.
 * @param {string} srcDir
 * @param {string} destDir
 * @return {number} files copied
 */
function copyTarget(srcDir, destDir) {
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(destDir, { recursive: true });
  let count = 0;

  for (const name of fs.readdirSync(srcDir)) {
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
    count++;
  }
  return count;
}

/**
 * Reads the CPU architecture from an executable's header (Mach-O, ELF or PE), without needing `file`.
 * @param {string} file
 * @return {string} 'x64', 'arm64', 'universal' (Mach-O fat binary) or 'unknown'
 */
function getBinaryArch(file) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(4096);

  try {
    fs.readSync(fd, buf, 0, buf.length, 0);
  } finally {
    fs.closeSync(fd);
  }

  const magic = buf.readUInt32BE(0);

  if (magic === 0xcafebabe) {
    return 'universal';
  }

  if (magic === 0xcffaedfe) { // 64-bit Mach-O, little endian
    const cpuType = buf.readUInt32LE(4);
    return { 0x01000007: 'x64', 0x0100000c: 'arm64' }[cpuType] || 'unknown';
  }

  if (magic === 0x7f454c46) { // ELF
    const machine = buf.readUInt16LE(18);
    return { 0x3e: 'x64', 0xb7: 'arm64' }[machine] || 'unknown';
  }

  if (buf.toString('latin1', 0, 2) === 'MZ') { // PE
    const peOffset = buf.readUInt32LE(0x3c);

    if (peOffset + 6 <= buf.length && buf.toString('latin1', peOffset, peOffset + 4) === 'PE\0\0') {
      const machine = buf.readUInt16LE(peOffset + 4);
      return { 0x8664: 'x64', 0xaa64: 'arm64', 0x14c: 'ia32' }[machine] || 'unknown';
    }
  }
  return 'unknown';
}

/**
 * @return {boolean} true if this Mac can run x64 binaries (Intel, or Apple Silicon with Rosetta installed)
 */
function canRunDarwinX64() {
  if (process.arch === 'x64') {
    return true;
  }
  return spawnSync('arch', ['-x86_64', '/usr/bin/true']).status === 0;
}

/**
 * @param {string} target
 * @return {boolean} true if this machine can run the target's binaries
 */
function canRun(target) {
  const [platform, arch] = target.split('-');

  if (platform !== process.platform) {
    return false;
  }

  if (arch === process.arch) {
    return true;
  }
  return platform === 'darwin' && arch === 'x64' && canRunDarwinX64();
}

/**
 * True when the dynamic loader couldn't start the binary because a system library is missing or too old.
 * Libraries we ship are copied next to the binary and checked by verifyCopy, so this is the host's fault.
 * @param {string} output - stdout + stderr of the failed run
 * @return {boolean}
 */
function isHostLibraryFailure(output) {
  const missing = output.match(/error while loading shared libraries: (\S+?):/);

  if (missing && !/^lib(ggml|llama|mtmd)/.test(missing[1])) {
    return true;
  }
  return /version `(GLIBC|GLIBCXX|CXXABI|OPENSSL)_[\d.]+' not found/.test(output);
}

/**
 * Runs `llama-server --version` and fails if it doesn't exit cleanly.
 * @param {string} dir - folder holding the llama-server copy inside the packaged app
 * @param {string} target
 */
function smokeTest(dir, target) {
  const exe = path.join(dir, exeName(target));
  const [platform, arch] = target.split('-');
  const runUnderRosetta = platform === 'darwin' && arch === 'x64' && process.arch !== 'x64';
  const cmd = runUnderRosetta ? 'arch' : exe;
  const cmdArgs = runUnderRosetta ? ['-x86_64', exe, '--version'] : ['--version'];
  const result = spawnSync(cmd, cmdArgs, { encoding: 'utf8', timeout: SMOKE_TEST_TIMEOUT_MS });
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();

  if (result.error || result.status !== 0) {
    if (platform === 'linux' && isHostLibraryFailure(output)) {
      // the build machine is missing libraries the binary needs at runtime (e.g. an older distro without
      // libssl3 or glibc 2.34), so it can't run here. That says nothing about the packaged files.
      console.warn(`  ${target}: smoke test skipped, this machine lacks libraries llama-server needs:\n${output}`);
      return;
    }

    throw new Error(`${target}: smoke test failed (${result.error ? result.error.message : `exit ${result.status}`})` +
      (output ? `:\n${output}` : ''));
  }

  const version = output.split('\n').find(line => /version/i.test(line)) || output.split('\n')[0];
  console.log(`  ${target}: smoke test passed (${version.trim()})`);
}

/**
 * Checks the copied files are complete and built for the right CPU.
 * @param {string} dir
 * @param {string} target
 */
function verifyCopy(dir, target) {
  const exe = path.join(dir, exeName(target));

  if (!fs.existsSync(exe)) {
    throw new Error(`${target}: ${exeName(target)} missing in ${dir}`);
  }

  if (process.platform !== 'win32' && !target.startsWith('win32') && !(fs.statSync(exe).mode & 0o111)) {
    throw new Error(`${target}: ${exe} is not executable`);
  }

  const arch = getBinaryArch(exe);

  if (arch !== TARGET_ARCH[target]) {
    throw new Error(`${target}: ${exeName(target)} is built for ${arch}, expected ${TARGET_ARCH[target]}`);
  }

  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);

    if (fs.lstatSync(p).isSymbolicLink() && !fs.existsSync(p)) {
      throw new Error(`${target}: dangling symlink ${name} in ${dir}`);
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const prefix = `${pkg.name}-`;

  if (!fs.existsSync(args.dist)) {
    throw new Error(`${args.dist} does not exist. Run the packager first.`);
  }

  const packagedDirs = fs.readdirSync(args.dist)
    .filter(name => name.startsWith(prefix) && fs.statSync(path.join(args.dist, name)).isDirectory());

  if (!packagedDirs.length) {
    throw new Error(`No packaged apps (${prefix}<platform>-<arch>) found in ${args.dist}`);
  }

  const toSmokeTest = [];

  for (const dirName of packagedDirs) {
    const platformArch = dirName.substring(prefix.length);
    const targets = PACKAGED_TARGETS[platformArch];

    if (!targets) {
      throw new Error(`Don't know which llama-server build goes into ${dirName}. Update PACKAGED_TARGETS.`);
    }

    if (!targets.length) {
      console.log(`${dirName}: no llama-server for this platform, skipped`);
      continue;
    }

    const packagedDir = path.join(args.dist, dirName);
    const destRoot = path.join(getResourcesDir(packagedDir, platformArch.split('-')[0]), DEST_FOLDER);
    fs.rmSync(destRoot, { recursive: true, force: true });

    for (const target of targets) {
      const srcDir = path.join(VENDOR_DIR, target);

      if (!fs.existsSync(path.join(srcDir, exeName(target)))) {
        throw new Error(`${path.relative(ROOT, srcDir)} is missing. Run: npm run fetch-llama-server -- --targets=${target}`);
      }

      const destDir = path.join(destRoot, target);
      const count = copyTarget(srcDir, destDir);
      verifyCopy(destDir, target);
      console.log(`${dirName}: copied ${target} (${count} files) -> ${path.relative(ROOT, destDir)}`);

      if (canRun(target)) {
        toSmokeTest.push({ dir: destDir, target });
      }
    }
  }

  if (!args.smokeTest) {
    console.log('Smoke test skipped');
    return;
  }

  if (!toSmokeTest.length) {
    console.log('Smoke test: no packaged llama-server can run on this machine, skipped');
    return;
  }

  // test each target once, even if it was copied into several apps (darwin-x64 and darwin-universal)
  const tested = new Set();

  for (const { dir, target } of toSmokeTest) {
    if (!tested.has(target)) {
      tested.add(target);
      smokeTest(dir, target);
    }
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(`add-llama-server: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { getBinaryArch, PACKAGED_TARGETS };
