/**
 * This script updates the resources in a given directory for the given languages
 * Syntax: node scripts/updateResources.js <path to resources> <language> [language...]
 */
require("babel-polyfill"); // required for async/await
const path = require('path-extra');
const fs = require('fs-extra');
const sourceContentUpdater = require('tc-source-content-updater').default;

const getVersionsInPath = resourcePath => {
  if (! resourcePath || ! fs.pathExistsSync(resourcePath)) {
    return null;
  }
  const isVersionDirectory = name => {
    const fullPath = path.join(resourcePath, name);
    return fs.lstatSync(fullPath).isDirectory() && name.match(/^v\d/i);
  };
  return fs.readdirSync(resourcePath).filter(isVersionDirectory);
};

const sortVersions = versions => {
  // Don't sort if null, empty or not an array
  if (! versions || ! Array.isArray(versions)) {
    return versions;
  }
  // Only sort of all items are strings
  for(let i = 0; i < versions.length; ++i) {
    if (typeof versions[i] !== 'string') {
      return versions;
    }
  }
  versions.sort( (a, b) => String(a).localeCompare(b, undefined, { numeric:true }) );
  return versions;
};

const getLatestVersionInPath = resourcePath => {
  const versions = sortVersions(getVersionsInPath(resourcePath));
  if (versions && versions.length) {
    return path.join(resourcePath, versions[versions.length-1]);
  }
  return null; // return illegal path
};

const cleanReaddirSync = path => {
  let cleanDirectories = [];

  if (fs.existsSync(path)) {
    cleanDirectories = fs.readdirSync(path)
      .filter(file => file !== '.DS_Store');
  } else {
    console.warn(`no such file or directory, ${path}`);
  }

  return cleanDirectories;
};

const getLocalResourceList = resourcesPath => {
  try {
    const localResourceList = [];
    const resourceLanguages = fs.readdirSync(resourcesPath)
      .filter(file => path.extname(file) !== '.json' && file !== '.DS_Store');

    for (let i = 0; i < resourceLanguages.length; i++) {
      const languageId = resourceLanguages[i];
      const biblesPath = path.join(resourcesPath, languageId, 'bibles');
      const tHelpsPath = path.join(resourcesPath, languageId, 'translationHelps');
      const bibleIds = cleanReaddirSync(biblesPath);
      const tHelpsResources = cleanReaddirSync(tHelpsPath);

      bibleIds.forEach(bibleId => {
        const bibleIdPath = path.join(biblesPath, bibleId);
        const bibleLatestVersion = getLatestVersionInPath(bibleIdPath);
        if (bibleLatestVersion) {
          const pathToBibleManifestFile = path.join(bibleLatestVersion, 'manifest.json');
          if (fs.existsSync(pathToBibleManifestFile)) {
            const resourceManifest = fs.readJsonSync(pathToBibleManifestFile);
            const localResource = {
              languageId: languageId,
              resourceId: bibleId,
              modifiedTime: resourceManifest.catalog_modified_time
            };

            localResourceList.push(localResource);
          } else {
            console.warn(`no such file or directory, ${pathToBibleManifestFile}`);
          }
        } else {
          console.log(`$bibleLatestVersion is ${bibleLatestVersion}.`);
        }
      });

      tHelpsResources.forEach(tHelpsId => {
        const tHelpResource = path.join(tHelpsPath, tHelpsId);
        const tHelpsLatestVersion = getLatestVersionInPath(tHelpResource);

        if (tHelpsLatestVersion) {
          const pathTotHelpsManifestFile = path.join(tHelpsLatestVersion, 'manifest.json');
          if (fs.existsSync(pathTotHelpsManifestFile)) {
            const resourceManifest = fs.readJsonSync(pathTotHelpsManifestFile);
            const localResource = {
              languageId: languageId,
              resourceId: tHelpsId,
              modifiedTime: resourceManifest.catalog_modified_time
            };

            localResourceList.push(localResource);
          } else {
            console.warn(`no such file or directory, ${pathTotHelpsManifestFile}`);
          }
        } else {
          console.log(`$tHelpsLatestVersion is ${tHelpsLatestVersion}.`);
        }
      });
    }
    return localResourceList;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const updateResources = async (languages, resourcesPath) => {
  const SourceContentUpdater = new sourceContentUpdater();
  const localResourceList = getLocalResourceList(resourcesPath);
  await SourceContentUpdater.getLatestResources(localResourceList)
    .then(async () => {
      await SourceContentUpdater.downloadResources(languages, resourcesPath)
      .then(resources => {
        resources.forEach(resource => {
          console.log("Updated resource '" + resource.resourceId + "' for language '" + resource.languageId + "' to v" + resource.version);
        });
      })
      .catch(err => {
        console.error(err);
      });
    });
};

// run as main
if(require.main === module) {
  if (process.argv.length < 4) {
    console.error('Syntax: node scripts/updateResources.js <path to resources> <language> [language...]');
    return 1;
  }
  const resourcesPath = process.argv[2];
  const languages = process.argv.slice(3);
  if (! fs.existsSync(resourcesPath)) {
    console.error('Directory does not exist: ' + resourcesPath);
    return 1;
  }
  updateResources(languages, resourcesPath);
}
