const fs = require('fs-extra');
const path = require('path-extra');
const AdmZip = require('adm-zip');
const updateResourcesHelpers = require('./updateResourcesHelpers');

/**
 * Zips all the books for a language into a file named books.zip.
 * @param {String} resourcesPath
 * @param {String} languageId
 */
const zipBibles = async (resourcesPath, languageId) => {
  const biblesPath = path.join(resourcesPath, languageId, 'bibles');
  const bibleIds = fs.readdirSync(biblesPath).filter(item => item !== '.DS_Store');
  bibleIds.forEach(bibleId => {
    const zip = new AdmZip();
    console.log('\x1b[36m%s\x1b[0m', `Started zipping the books for: ${languageId} ${bibleId}`);
    try {
      const bibleIdPath = path.join(biblesPath, bibleId);
      const bibleLatestVersionPath = updateResourcesHelpers.getLatestVersionInPath(bibleIdPath);
      const biblesContentPath = path.join(bibleLatestVersionPath);
      const excludedItems = ['index.json', 'manifest.json', 'books', 'books.zip', '.DS_Store'];
      const books = fs.readdirSync(biblesContentPath)
        .filter(item => !excludedItems.includes(item));
      fs.ensureDirSync(path.join(biblesContentPath, 'books'));
      const booksPath = path.join(biblesContentPath, 'books');

      books.forEach((book) => {
        const bookPath = path.join(biblesContentPath, book);
        const destinationPath = path.join(booksPath, book);
        fs.moveSync(bookPath, destinationPath);
      });
      zip.addLocalFolder(booksPath);
      const zipDestination = path.join(biblesContentPath, 'books.zip');
      zip.writeZip(zipDestination);
      fs.removeSync(booksPath);
      console.log('\x1b[35m%s\x1b[0m', `Finished zipping the books for: ${languageId} ${bibleId}`);
    } catch (error) {
      console.error(error);
    }
  });
};

module.exports = {
  zipBibles,
};
