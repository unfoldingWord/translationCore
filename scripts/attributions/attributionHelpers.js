const fs = require('fs-extra');
const path = require('path-extra');

// This is for an packages that we can't get dynamically that we maybe use/reference elsewhere rather than in
// package.json's dependencies list, or if a package's info needs correction. These packages will also appear first
// in the package list of the generated attributions JSON file. It needs to be keyed by the packages's name, and have
// 'reference' (URL to the package), and 'license' as the license type. 'version' is optional.
const staticPackages = {
  'electron': {
    'repository': 'https://github.com/electron/electron',
    'license': 'MIT',
    'version': '3.0.11'
  }
};

// All font attributions are static and thus need to be listed here.
const staticFonts = {
  'Noto Sans': {
    'license' : 'SIL Open Font License',
    'repository': 'https://github.com/googlefonts/noto-fonts'
  },
  'SIL Ezra Font': {
    'license' : 'SIL Open Font License',
    'repository': 'http://software.sil.org/ezra',
    'version': '2.51'
  }
};

// packageRename are when we are using an older version of a package or a forked version
// The key is the package name as it appears in packages.json's dependencies list, and the attributes
// are what we want name and the repository URL to be.
const packageRename = {
  '@neutrinog/electron-dl': {
    name: 'electron-dl',
    repository: 'https://github.com/sindresorhus/electron-dl'
  },
  '@material-ui/core': {
    name: 'material-ui',
    repository: 'https://github.com/mui-org/material-ui'
  },
};

// These are packages we don't want to attribute such as our own code bases, or redundant packages such as extra
// material-ui packages.
const ignorePackages = [
  '@material-ui/icons',
  'checking-tool-wrapper',
  'gogs-client',
  'selections',
  'string-punctuation-tokenizer',
  'tc-source-content-updater',
  'tc-strings',
  'tc-tool',
  'tc-ui-toolkit',
  'tsv-groupdata-parser',
  'usfm-js',
  'word-aligner',
  'wordmap',
  'wordmap-lexer'
];

// Function generates a JSON of all the elements in which to give attribution to and saves it to the outputFile
const generateAttributionData = (baseDir, outputFile) => {
  const attributionData = {
    '_comment1': 'WARNING: Do NOT modify this file by hand. Add any special packages or fonts to `[tC root]/scripts/attributions/attributionHelpers.js` and run `npm run update-attributions`.',
    '_comment2': 'If any auto-generated data is wrong, simply copy the package\'s entry below into attributionHelpers.js\'s staticPackages map with the same key and change what needs to be modified.',
    'packages': staticPackages,
    'fonts': staticFonts,
  };

  // Get all the packages in tC's package.json file's dependencies attribute and loop through them
  const tcJson = fs.readJSONSync(path.join(baseDir, 'package.json'));
  Object.keys(tcJson.dependencies).forEach((pkg) => {
    const pkgJson = fs.readJSONSync(path.join(baseDir, 'node_modules', pkg, 'package.json'));
    let name = pkgJson.name;
    let repository = pkgJson.repository;
    let license = pkgJson.license || 'MIT';
    let version = pkgJson.version || null;

    // If this package was to have data different than the node module package.json, we use it here
    if (packageRename[pkg]) {
      name = packageRename[pkg].name || pkg;
      repository = packageRename[pkg].repository || repository;
      license = packageRename[pkg].license || license;
      version = packageRename[pkg].version || version;
    }

    // repository can be a string of the URL or an object with a url property
    if (typeof repository === 'object' && pkgJson.repository.url) {
      repository = pkgJson.repository.url;
    }

    // Make sure we have a valid http(s) URL
    repository = getProperHTTPURL(pkg, repository);

    // We do not give self attributions so ignore repos in the ignorePackages list or those
    // with translationCoreApps or unfoldingWord-dev as their owner
    if (ignorePackages.indexOf(pkg) < 0 && !attributionData['packages'][name] &&
      !repository.toLowerCase().includes('translationcoreapps') &&
      !repository.toLowerCase().includes('unfoldingword-dev')) {
      attributionData['packages'][name] = {
        'license': license,
        'repository': repository,
        'version': version,
      };
    }
  });

  // Write the whole attributionData object to file
  fs.writeFileSync(outputFile, JSON.stringify(attributionData, null, 2));
  console.log('Attributions written to ' + outputFile);
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
    if (!noDomainNamePattern.test(repoUrl))
      repoUrl = 'github.com/' + repoUrl;
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
  generateAttributionData
};
