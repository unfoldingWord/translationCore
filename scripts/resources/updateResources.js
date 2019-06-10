/**
 * This script updates the resources in a given directory for the given languages
 * Syntax: node scripts/resources/updateResources.js <path to resources> <language> [language...]
 */
require("babel-polyfill"); // required for async/await
const fs = require('fs-extra');
const path = require('path-extra');
const sourceContentUpdater = require('tc-source-content-updater').default;
const updateResourcesHelpers = require('./updateResourcesHelpers');
const zipResourcesContent = require('./zipHelpers').zipResourcesContent;

const updateResources = async (languages, resourcesPath) => {
  const SourceContentUpdater = new sourceContentUpdater();
  const localResourceList = updateResourcesHelpers.getLocalResourceList(resourcesPath);
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

const executeResourcesUpdate = async (languages, resourcesPath) => {
  await updateResources(languages, resourcesPath);

  languages.forEach(async (languageId) => await zipResourcesContent(resourcesPath, languageId));

  // update source content updater manifest, but don't clobber tCore version
  updateResourcesHelpers.updateSourceContentUpdaterManifest(resourcesPath);
};

// run as main
if(require.main === module) {
  if (process.argv.length < 4) {
    console.error('Syntax: node scripts/resources/updateResources.js <path to resources> <language> [language...]');
    return 1;
  }
  const resourcesPath = process.argv[2];
  const languages = process.argv.slice(3);
  if (! fs.existsSync(resourcesPath)) {
    console.error('Directory does not exist: ' + resourcesPath);
    return 1;
  }

  executeResourcesUpdate(languages, resourcesPath);
}

