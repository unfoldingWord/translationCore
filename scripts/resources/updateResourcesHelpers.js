const path = require('path-extra');
const fs = require('fs-extra');

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

const cleanReaddirSync = dirPath => {
  let cleanDirectories = [];
  if (fs.existsSync(dirPath)) {
    const isDirectory = name => fs.lstatSync(path.join(dirPath, name)).isDirectory();
    cleanDirectories = fs.readdirSync(dirPath).filter(isDirectory);
  }
  return cleanDirectories;
};

const getLocalResourceList = resourcesPath => {
  try {
    const localResourceList = [];
    const isDirectory = name => fs.lstatSync(path.join(resourcesPath, name)).isDirectory();
    const resourceLanguages = fs.readdirSync(resourcesPath).filter(isDirectory);
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

/**
 *  update the date in the SourceContentUpdaterManifest
 * @param {String} resourcesPath
 */
const updateSourceContentUpdaterManifest = resourcesPath => {
  const sourceContentManifestPath = path.join(resourcesPath, 'source-content-updater-manifest.json');
  let manifest = {};

  if (fs.existsSync(sourceContentManifestPath)) {
    manifest = fs.readJSONSync(sourceContentManifestPath);
  }
  fs.ensureDirSync(resourcesPath);
  manifest.modified = (new Date()).toJSON();
  fs.outputJsonSync(sourceContentManifestPath, manifest, { spaces: 2 });
};

module.exports = {
  getLocalResourceList,
  getLatestVersionInPath,
  updateSourceContentUpdaterManifest
};
