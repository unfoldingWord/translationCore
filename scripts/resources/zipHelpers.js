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

const zipResourcesContent = async (resourcesRootPath, languageId) => {
  const resourcesTypePath = path.join(resourcesRootPath, languageId);
  const resourcesTypes = fs.readdirSync(resourcesTypePath).filter(item => item !== '.DS_Store');

  resourcesTypes.forEach(resourceType => {
    const resourcesPath = path.join(resourcesRootPath, languageId, resourceType);
    const resources = fs.readdirSync(resourcesPath).filter(item => item !== '.DS_Store');

    resources.forEach(resourceId => {
      const zip = new AdmZip();
      console.log('\x1b[36m%s\x1b[0m', `Started zipping the contents for: ${languageId} ${resourceId}`);
      try {
        const resourceIdPath = path.join(resourcesPath, resourceId);
        const resourcesContentPath = updateResourcesHelpers.getLatestVersionInPath(resourceIdPath);
        const excludedItems = ['index.json', 'manifest.json', 'books', 'books.zip', '.DS_Store'];
        const resources = fs.readdirSync(resourcesContentPath)
          .filter(item => !excludedItems.includes(item));
        const contentType = resourceType === 'books' ? 'books' : 'contents';
        fs.ensureDirSync(path.join(resourcesContentPath, contentType));
        const resourcessPath = path.join(resourcesContentPath, contentType);

        resources.forEach(resource => {
          const resourcePath = path.join(resourcesContentPath, resource);
          const destinationPath = path.join(resourcessPath, resource);
          fs.moveSync(resourcePath, destinationPath);
        });

        zip.addLocalFolder(resourcessPath);
        const zipFilename = contentType + '.zip';
        const zipDestination = path.join(resourcesContentPath, zipFilename);
        zip.writeZip(zipDestination);
        fs.removeSync(resourcessPath);
        console.log('\x1b[35m%s\x1b[0m', `Finished zipping the contents for: ${languageId} ${resourceId}`);
      } catch (error) {
        console.error(error);
      }
    });
  });
};

module.exports = {
  zipBibles,
  zipResourcesContent,
};
