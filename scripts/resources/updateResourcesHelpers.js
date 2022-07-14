const path = require('path-extra');
const fs = require('fs-extra');

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
  console.log(`updateSourceContentUpdaterManifest() - updated ${sourceContentManifestPath} to `, manifest);
  fs.outputJsonSync(sourceContentManifestPath, manifest, { spaces: 2 });
};

module.exports = {
  updateSourceContentUpdaterManifest,
};
