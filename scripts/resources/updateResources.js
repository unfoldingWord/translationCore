/**
 * This script updates the resources in a given directory for the given languages
 * Syntax: node scripts/resources/updateResources.js <path to resources> <language> [language...]
 */
require('babel-polyfill'); // required for async/await
const fs = require('fs-extra');
const SourceContentUpdater = require('tc-source-content-updater').default;
const UpdateResourcesHelpers = require('./updateResourcesHelpers');
const zipResourcesContent = require('./zipHelpers').zipResourcesContent;

const updateResources = async (languages, resourcesPath) => {
  const sourceContentUpdater = new SourceContentUpdater();

  try {
    const localResourceList = UpdateResourcesHelpers.getLocalResourceList(resourcesPath);

    await sourceContentUpdater.getLatestResources(localResourceList)
      .then(async () => {
        await sourceContentUpdater.downloadResources(languages, resourcesPath)
          .then(resources => {
            resources.forEach(resource => {
              console.log('Updated resource \'' + resource.resourceId + '\' for language \'' + resource.languageId + '\' to v' + resource.version);
            });
          })
          .catch(err => {
            console.error(err);
          });
      });
    return sourceContentUpdater.getLatestDownloadErrorsStr();
  } catch (e) {
    const message = `Error getting latest resources: `;
    console.error(message, e);
    return `${message}: ${e.toString()}`;
  }
};

const executeResourcesUpdate = async (languages, resourcesPath) => {
  let errors = await updateResources(languages, resourcesPath);

  if (errors) {
    console.log('Errors on downloading updated resources!!');
  }
  console.log('Zipping up updated resources');

  languages.forEach(async (languageId) => {
    try {
      await zipResourcesContent(resourcesPath, languageId);
    } catch (e) {
      errors += e.toString() + '\n';
    }
  });

  // update source content updater manifest, but don't clobber tCore version
  UpdateResourcesHelpers.updateSourceContentUpdaterManifest(resourcesPath);

  if (errors) {
    console.log('Errors on downloading updated resources:\n' + errors);
  } else {
    console.log('Updating Succeeded!!!');
  }
};

// run as main
if (require.main === module) {
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
