/**
 * This script updates the resources in a given directory for the given languages
 * Syntax: node scripts/resources/updateResources.js <path to resources> <language> [language...]
 */
require("babel-polyfill"); // required for async/await
const fs = require('fs-extra');
const sourceContentUpdater = require('tc-source-content-updater').default;
const updateResourcesHelpers = require('./updateResourcesHelpers');

const path = require('path-extra');
const AdmZip = require('adm-zip');

function zipBibles(resourcesPath, languageId) {
  const biblesPath = path.join(resourcesPath, languageId, 'bibles');
  const bibleIds = fs.readdirSync(biblesPath).filter(item => item !== '.DS_Store');
  const zip = new AdmZip();
  bibleIds.forEach(bibleId => {
    const bibleIdPath = path.join(biblesPath, bibleId);
    const bibleLatestVersionPath = updateResourcesHelpers.getLatestVersionInPath(bibleIdPath);
    const biblesContentPath = path.join(bibleLatestVersionPath);
    const excludedItems = ['index.json', 'manifest.json'];
    const books = fs.readdirSync(biblesContentPath).filter(item => !excludedItems.includes(item));
console.log(biblesContentPath, '----------');
    books.forEach((book) => {
      zip.addLocalFolder(path.join(biblesContentPath, book));
    });
    console.log('aa----------', path.join(biblesContentPath, 'bibles.zip'));
    zip.writeZip('test.zip');
  });
}

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
  updateResources(languages, resourcesPath);

  // zipBibles(resourcesPath, 'en');
}
