// Points the checking-tool-wrapper and tc-ui-toolkit dependencies in package.json at the
// newest local .tgz build in ../checking-tool-wrapper and ../tc-ui-toolkit, then reinstalls.
//
// Usage: node ./scripts/update_local_tgz_deps.js [--dry-run] [--no-install] [--force-install]
//   --dry-run        show what would change, but don't write package.json or install
//   --no-install     update package.json but don't run npm install
//   --force-install  run npm install even if package.json didn't change (e.g. a .tgz was rebuilt in place)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const PACKAGES = ['checking-tool-wrapper', 'tc-ui-toolkit'];

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const noInstall = args.includes('--no-install');
const forceInstall = args.includes('--force-install');

/**
 * Splits a version like '7.4.12-beta.234' into numeric and text parts for comparison.
 * @param {string} version
 * @returns {{main: Array<number>, pre: Array<string|number>}}
 */
function parseVersion(version) {
  const [main, pre] = version.split('-', 2);
  const toPart = part => (/^\d+$/.test(part) ? Number(part) : part);

  return {
    main: main.split('.').map(Number),
    pre: pre ? pre.split('.').map(toPart) : [],
  };
}

/**
 * Compares two versions using semver precedence (a release is newer than its prereleases).
 * @param {string} a
 * @param {string} b
 * @returns {number} negative if a < b, positive if a > b, 0 if equal
 */
function compareVersions(a, b) {
  const va = parseVersion(a);
  const vb = parseVersion(b);

  for (let i = 0; i < 3; i++) {
    const diff = (va.main[i] || 0) - (vb.main[i] || 0);

    if (diff) {
      return diff;
    }
  }

  if (!va.pre.length || !vb.pre.length) {
    return vb.pre.length - va.pre.length; // no prerelease sorts after a prerelease
  }

  for (let i = 0; i < Math.max(va.pre.length, vb.pre.length); i++) {
    const pa = va.pre[i];
    const pb = vb.pre[i];

    if (pa === undefined || pb === undefined) {
      return pa === undefined ? -1 : 1;
    }

    if (pa !== pb) {
      if (typeof pa === 'number' && typeof pb === 'number') {
        return pa - pb;
      }

      if (typeof pa === 'number' || typeof pb === 'number') {
        return typeof pa === 'number' ? -1 : 1; // numeric identifiers sort before text
      }
      return pa < pb ? -1 : 1;
    }
  }
  return 0;
}

/**
 * Finds the newest <name>-<version>.tgz in ../<name>.
 * @param {string} name - package name
 * @returns {string} absolute path to the newest .tgz
 */
function findLatestTgz(name) {
  const dir = path.resolve(ROOT, '..', name);

  if (!fs.existsSync(dir)) {
    throw new Error(`Folder not found: ${dir}`);
  }

  const prefix = `${name}-`;
  const builds = fs.readdirSync(dir)
    .filter(file => file.startsWith(prefix) && file.endsWith('.tgz'))
    .map(file => ({ file, version: file.slice(prefix.length, -'.tgz'.length) }))
    .filter(({ version }) => /^\d+\.\d+\.\d+/.test(version))
    .sort((a, b) => compareVersions(a.version, b.version));

  if (!builds.length) {
    throw new Error(`No ${prefix}<version>.tgz files found in ${dir}`);
  }
  return path.join(dir, builds[builds.length - 1].file);
}

function main() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  let changed = false;

  for (const name of PACKAGES) {
    const latest = findLatestTgz(name);
    const current = packageJson.dependencies[name];

    if (current === latest) {
      console.log(`${name}: already at ${path.basename(latest)}`);
    } else {
      console.log(`${name}: ${current} -> ${latest}`);
      packageJson.dependencies[name] = latest;
      changed = true;
    }
  }

  if (dryRun) {
    console.log('Dry run: no changes written.');
    return;
  }

  if (changed) {
    fs.writeFileSync(PACKAGE_JSON, `${JSON.stringify(packageJson, null, 2)}\n`);
    console.log('Updated package.json');
  }

  if (noInstall || (!changed && !forceInstall)) {
    console.log(changed ? 'Skipping install (--no-install).' : 'Nothing to install.');
    return;
  }

  console.log('Running npm i --legacy-peer-deps ...');
  execSync('npm i --legacy-peer-deps', { cwd: ROOT, stdio: 'inherit' });
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
