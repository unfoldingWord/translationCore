/**
 * This script updates the resources in a given directory for the given languages
 * Syntax: node scripts/resources/updateResources.js <path to resources> <language> [language...]
 */
require("babel-polyfill"); // required for async/await
const fs = require('fs-extra');
const sourceContentUpdater = require('tc-source-content-updater').default;
const updateResourcesHelpers = require('./updateResourcesHelpers');

const path = require('path-extra');
const archiver = require('archiver');

function zipBibles(resourcesPath, languageId) {
  const biblesPath = path.join(resourcesPath, languageId, 'bibles');
  const bibleIds = fs.readdirSync(biblesPath).filter(item => item !== '.DS_Store');
  bibleIds.forEach(bibleId => {
    try {
      const bibleIdPath = path.join(biblesPath, bibleId);
      const bibleLatestVersionPath = updateResourcesHelpers.getLatestVersionInPath(bibleIdPath);
      const biblesContentPath = path.join(bibleLatestVersionPath);
      const excludedItems = ['index.json', 'manifest.json', 'books'];
      const books = fs.readdirSync(biblesContentPath)
        .filter(item => !excludedItems.includes(item))
        .filter(item => item !== '.DS_Store');
      fs.ensureDirSync(path.join(biblesContentPath, 'books'));
      const booksPath = path.join(biblesContentPath, 'books');

      books.forEach((book) => {
        const bookPath = path.join(biblesContentPath, book);
        const destinationPath = path.join(booksPath, book);
        fs.copySync(bookPath, destinationPath);
      });
      // creating a file to stream archive data to.
      const output = fs.createWriteStream(__dirname + '/example.zip');
      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });

      output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
      });

      archive.on('error', error => console.error(error));
      archive.pipe(output);
      archive.file('h.txt', { name: 'h.txt' });

      // archive.directory(booksPath, 'books');
      archive.finalize();

    } catch (error) {
      console.error(error);
    }
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
  // updateResources(languages, resourcesPath);

  zipBibles(resourcesPath, 'en');
}
