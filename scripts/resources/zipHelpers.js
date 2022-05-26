const fs = require('fs-extra');
const path = require('path-extra');
const AdmZip = require('adm-zip');
const updateResourcesHelpers = require('./updateResourcesHelpers');

/**
 * Zips the contents of a resource by languageId.
 * @param {String} resourcesRootPath
 * @param {String} languageId
 */
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
        const versions = fs.readdirSync(resourceIdPath).filter(item => item !== '.DS_Store');

        versions.forEach(version => {
          const resourcesContentPath = path.join(resourceIdPath, version);
          const contentType = resourceType === 'bibles' ? 'books' : 'contents';

          if (fs.existsSync(path.join(resourcesContentPath, contentType + '.zip'))) {
            console.log(`Resource was not updated, skipping: ${languageId} ${resourceId} ${version}`);
            return;
          }
          console.log(`Resource was updated, zipping: ${languageId} ${resourceId} ${version}`);

          const excludedItems = ['index.json', 'manifest.json', 'books', 'books.zip', 'contents.zip', '.DS_Store'];
          const resources = fs.readdirSync(resourcesContentPath)
            .filter(item => !excludedItems.includes(item));
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
        });
      } catch (error) {
        const message = `zipResourcesContent(${resourcesPath}) Failed: `;
        console.error(message, error);
        throw message + error.toString();
      }
    });
  });
};

module.exports = { zipResourcesContent };
