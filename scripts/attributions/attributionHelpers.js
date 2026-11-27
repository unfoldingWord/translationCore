const fs = require('fs-extra');
const path = require('path-extra');

const ROOT_DIR = path.join(__dirname, '../..'); // the root translationCore directory

/**
 * Reads a package.json, returning null if it doesn't exist or can't be parsed.
 * @param {string} file
 * @return {object|null}
 */
const readJsonSafe = (file) => {
  try {
    return fs.readJSONSync(file);
  } catch (e) {
    return null;
  }
};

/**
 * Version of Electron that our Electronite build is based on (e.g. '25.3.2-graphite' -> '25.3.2').
 * @param {string} baseDir
 * @return {string|null}
 */
const getElectronVersion = (baseDir) => {
  const pkg = readJsonSafe(path.join(baseDir, 'node_modules', 'electronite', 'package.json'));
  return pkg && pkg.version ? pkg.version.replace(/-.*$/, '') : null;
};

/**
 * @param {string} baseDir
 * @return {string|null} the pinned llama.cpp release tag that is bundled with the app
 */
const getLlamaCppVersion = (baseDir) => {
  const pkg = readJsonSafe(path.join(baseDir, 'package.json'));
  return (pkg && pkg.llamaCppTag) || null;
};

// This is for any packages that we can't get dynamically that we maybe use/reference elsewhere rather than in
// package.json's dependencies list, or if a package's info needs correction. These packages will also appear first
// in the package list of the generated attributions JSON file. It needs to be keyed by the packages's name, and have
// 'repository' (URL to the package), and 'license' as the license type. 'version' is optional.
const staticPackages = {
  // we ship Electronite, a fork of Electron
  'electron': {
    'repository': 'https://github.com/electron/electron',
    'license': 'MIT',
    'version': getElectronVersion(ROOT_DIR),
  },
  // llama-server binaries bundled for local AI suggestions (see scripts/fetch-llama-server.js)
  'llama.cpp': {
    'repository': 'https://github.com/ggml-org/llama.cpp',
    'license': 'MIT',
    'version': getLlamaCppVersion(ROOT_DIR),
  },
  // libomp.dll is bundled with llama-server on Windows
  'LLVM OpenMP runtime': {
    'repository': 'https://github.com/llvm/llvm-project/tree/main/openmp',
    'license': 'Apache-2.0 WITH LLVM-exception',
  },
  // vendored CSS in src/css (imported by src/css/styles.css)
  'bootstrap': {
    'repository': 'https://github.com/twbs/bootstrap',
    'license': 'MIT',
    'version': '3.3.6',
  },
  'normalize.css': {
    'repository': 'https://github.com/necolas/normalize.css',
    'license': 'MIT',
    'version': '3.0.3',
  },
  'hint.css': {
    'repository': 'https://github.com/chinchang/hint.css',
    'license': 'MIT',
    'version': '2.5.0',
  },
};

// All font attributions are static and thus need to be listed here. These are the fonts loaded by
// src/css/styles.css and public/previewStyles-*.css (font files in src/fonts). Versions are from the font files.
const staticFonts = {
  'Noto Sans': {
    'license': 'SIL Open Font License 1.1',
    'repository': 'https://github.com/notofonts/latin-greek-cyrillic',
    'version': '1.06',
  },
  'Charis SIL': {
    'license': 'SIL Open Font License 1.1',
    'repository': 'https://software.sil.org/charis',
    'version': '6.200',
  },
  'SIL Ezra Font': {
    'license': 'SIL Open Font License 1.1',
    'repository': 'https://software.sil.org/ezra',
    'version': '2.51',
  },
  'Padauk': {
    'license': 'SIL Open Font License 1.1',
    'repository': 'https://software.sil.org/padauk',
    'version': '4.000',
  },
  'Awami Nastaliq': {
    'license': 'SIL Open Font License 1.1',
    'repository': 'https://software.sil.org/awami',
    'version': '2.000',
  },
  'Scheherazade': {
    'license': 'SIL Open Font License 1.1',
    'repository': 'https://software.sil.org/scheherazade',
    'version': '2.100',
  },
  // icon font that comes with bootstrap 3, licensed to Bootstrap under its MIT license
  'Glyphicons Halflings': {
    'license': 'MIT',
    'repository': 'https://getbootstrap.com/docs/3.3/components/#glyphicons',
    'version': '1.009',
  },
};

// packageRename are when we are using an older version of a package or a forked version
// The key is the package name as it appears in packages.json's dependencies list, and the attributes
// are what we want name and the repository URL to be.
const packageRename = {
  '@neutrinog/electron-dl': {
    name: 'electron-dl',
    repository: 'https://github.com/sindresorhus/electron-dl',
  },
  '@material-ui/core': {
    name: 'material-ui',
    repository: 'https://github.com/mui-org/material-ui',
  },
};

// These are packages we don't want to attribute such as our own code bases, or redundant packages such as extra
// material-ui packages. Our own packages' dependencies are still scanned, since we ship them.
const ignorePackages = [
  '@material-ui/icons',
  'bible-reference-range',
  'checking-tool-wrapper',
  'gogs-client',
  'selections',
  'string-punctuation-tokenizer',
  'tc-electron-env',
  'tc-source-content-updater',
  'tc-strings',
  'tc-tool',
  'tc-ui-toolkit',
  'tsv-groupdata-parser',
  'usfm-js',
  'word-aligner',
  'wordmap',
  'wordmap-lexer',
];

// dependencies that are only used for building or testing, so nothing from them is shipped
const buildOnlyPackages = [
  '@craco/craco',
  'identity-obj-proxy',
  'jest-environment-jsdom',
  'react-scripts',
];

/**
 * @param {string} pkg
 * @return {boolean} true for packages that only contribute build or test code
 */
const isBuildOnly = (pkg) => buildOnlyPackages.includes(pkg) || pkg.startsWith('@types/');

/**
 * @param {string} repository - http(s) repository URL
 * @return {boolean} true if this is one of our own code bases
 */
const isOwnRepository = (repository) => {
  const repo = repository.toLowerCase();
  return repo.includes('translationcoreapps') ||
    repo.includes('unfoldingword-dev') ||
    repo.includes('github.com/unfoldingword/') ||
    repo.includes('github.com/unfoldingword-box3/');
};

/**
 * Finds the installed package.json for pkg, searching the root node_modules first and then the nested
 * node_modules of the packages that depend on it.
 * @param {string} baseDir
 * @param {string} pkg
 * @param {string[]} searchDirs - node_modules folders of the dependents, nearest first
 * @return {object|null}
 */
const findPackageJson = (baseDir, pkg, searchDirs) => {
  for (const dir of searchDirs.concat([path.join(baseDir, 'node_modules')])) {
    const pkgJson = readJsonSafe(path.join(dir, pkg, 'package.json'));

    if (pkgJson) {
      return { pkgJson, dir: path.join(dir, pkg) };
    }
  }
  return null;
};

/**
 * Lists the third party packages to attribute: tC's dependencies, the dependencies of the checking tools in
 * src/tC_apps, and the dependencies of our own packages (which we ship, but don't attribute to ourselves).
 * @param {string} baseDir
 * @return {Array<{pkg: string, pkgJson: object}>}
 */
const collectDependencies = (baseDir) => {
  const tcJson = fs.readJSONSync(path.join(baseDir, 'package.json'));
  const queue = Object.keys(tcJson.dependencies || {}).map(pkg => ({ pkg, searchDirs: [] }));
  const appsDir = path.join(baseDir, 'src', 'tC_apps');

  if (fs.existsSync(appsDir)) {
    fs.readdirSync(appsDir).forEach((app) => {
      const appJson = readJsonSafe(path.join(appsDir, app, 'package.json'));

      if (appJson) {
        Object.keys(appJson.dependencies || {}).forEach(pkg => queue.push({ pkg, searchDirs: [] }));
      }
    });
  }

  const seen = new Set();
  const results = [];

  while (queue.length) {
    const { pkg, searchDirs } = queue.shift();

    if (seen.has(pkg) || isBuildOnly(pkg)) {
      continue;
    }
    seen.add(pkg);

    const found = findPackageJson(baseDir, pkg, searchDirs);

    if (!found) {
      console.warn(`Skipping ${pkg}: not installed in node_modules`);
      continue;
    }

    const repository = getProperHTTPURL(pkg, getRepositoryUrl(found.pkgJson));

    if (ignorePackages.includes(pkg) || isOwnRepository(repository)) {
      // one of ours: don't attribute it, but attribute the third party code it brings in
      const nestedDirs = [path.join(found.dir, 'node_modules')].concat(searchDirs);
      Object.keys(found.pkgJson.dependencies || {}).forEach(dep => queue.push({ pkg: dep, searchDirs: nestedDirs }));
      continue;
    }
    results.push({ pkg, pkgJson: found.pkgJson });
  }
  return results;
};

/**
 * @param {object} pkgJson
 * @return {string|undefined} repository URL, which can be a string or an object with a url property
 */
const getRepositoryUrl = (pkgJson) => {
  const repository = pkgJson.repository;
  return (repository && typeof repository === 'object') ? repository.url : repository;
};

/**
 * @param {object} pkgJson
 * @return {string} license, normalizing the old `licenses` array form
 */
const getLicense = (pkgJson) => {
  let license = pkgJson.license;

  if (license && typeof license === 'object') {
    license = license.type;
  }

  if (!license && Array.isArray(pkgJson.licenses)) {
    license = pkgJson.licenses.map(l => (typeof l === 'object' ? l.type : l)).join(' OR ');
  }
  return license || 'MIT';
};

// Function generates a JSON of all the elements in which to give attribution to and saves it to the outputFile
const generateAttributionData = (baseDir, outputFile) => {
  const attributionData = {
    '_comment1': 'WARNING: Do NOT modify this file by hand. Add any special packages or fonts to `[tC root]/scripts/attributions/attributionHelpers.js` and run `npm run update-attributions`.',
    '_comment2': 'If any auto-generated data is wrong, simply copy the package\'s entry below into attributionHelpers.js\'s staticPackages map with the same key and change what needs to be modified.',
    'packages': {
      ...staticPackages,
      'electron': { ...staticPackages.electron, version: getElectronVersion(baseDir) },
      'llama.cpp': { ...staticPackages['llama.cpp'], version: getLlamaCppVersion(baseDir) },
    },
    'fonts': staticFonts,
  };

  collectDependencies(baseDir).forEach(({ pkg, pkgJson }) => {
    let name = pkgJson.name || pkg;
    let repository = getRepositoryUrl(pkgJson);
    let license = getLicense(pkgJson);
    let version = pkgJson.version || null;

    // If this package was to have data different than the node module package.json, we use it here
    if (packageRename[pkg]) {
      name = packageRename[pkg].name || pkg;
      repository = packageRename[pkg].repository || repository;
      license = packageRename[pkg].license || license;
      version = packageRename[pkg].version || version;
    }

    // Make sure we have a valid http(s) URL
    repository = getProperHTTPURL(pkg, repository);

    if (!attributionData['packages'][name]) {
      attributionData['packages'][name] = {
        'license': license,
        'repository': repository,
        'version': version,
      };
    }
  });

  // Write the whole attributionData object to file
  fs.writeFileSync(outputFile, JSON.stringify(attributionData, null, 2) + '\n');
  console.log(`Attributions written to ${outputFile} (${Object.keys(attributionData.packages).length} packages, ` +
    `${Object.keys(attributionData.fonts).length} fonts)`);
};

// Since a package's repository URL can have many forms, this function properly converts them to http(s) URLs and cleans
// them up.
const getProperHTTPURL = (pkg, repoUrl) => {
  if (!repoUrl) {
    // No URL so we expect to find it in the npmjs.com package database
    return 'https://npmjs.com/package/' + pkg;
  }

  if (repoUrl.startsWith('git+')) {
    repoUrl = repoUrl.replace(/^git\+/, '');
  }

  if (repoUrl.startsWith('git://')) {
    repoUrl = repoUrl.replace('git://', 'https://');
  }

  if (repoUrl.startsWith('ssh://')) {
    repoUrl = repoUrl.replace('ssh://', '');
  }

  // shorthand forms like "github:user/repo"
  if (repoUrl.startsWith('github:')) {
    repoUrl = repoUrl.replace(/^github:/, '');
  }

  const githubPattern = /^git@github.com[\/:]/i;

  if (githubPattern.test(repoUrl)) {
    repoUrl = repoUrl.replace(githubPattern, 'https://github.com/');
  }

  if (repoUrl.startsWith('git@github.com/')) {
    repoUrl = repoUrl.replace('git@github.com/', 'https://github.com/');
  }

  if (repoUrl && !repoUrl.startsWith('http')) {
    // Doesn't have http(s) as the prefix, but see if it has a domain name without http(s) and add github.com if not.
    const noDomainNamePattern = /^[^\/]+\.(com|net|org|co|uk|edu)[^\/]*\//;

    if (!noDomainNamePattern.test(repoUrl)) {
      repoUrl = 'github.com/' + repoUrl;
    }
    repoUrl = 'https://' + repoUrl;
  }

  if (repoUrl.endsWith('.git')) {
    repoUrl = repoUrl.replace(/\.git$/, '');
  }
  return repoUrl;
};


module.exports = {
  staticPackages,
  staticFonts,
  packageRename,
  ignorePackages,
  generateAttributionData,
};
