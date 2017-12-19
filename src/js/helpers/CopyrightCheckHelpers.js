import fs from 'fs-extra';
import path from 'path-extra';

/**
 * @description saves the LICENSE.md in project folder and
 * adds the license Id to project manifest
 * @param {String} licenseId
 */
export function saveProjectLicense(licenseId, projectSaveLocation) {
  return new Promise(async(resolve, reject) => {
    try {
      const licenseSavePath = path.join(projectSaveLocation, 'LICENSE.md');
      const licenseData = loadProjectLicenseMarkdownFile(licenseId);

      fs.outputFileSync(licenseSavePath, licenseData);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * reads in the license markdown file from the filesystem.
 * @param {String} licenseId
 */
export function loadProjectLicenseMarkdownFile(licenseId) {
  const fileName = licenseId + '.md';
  const projectLicensesPath = path.join(__dirname, '../../assets/projectLicenses', fileName);

  return fs.readFileSync(projectLicensesPath, 'utf8');
}

export function assignLicenseToOnlineImportedProject(projectPath) {
  return new Promise(async(resolve, reject) => {
    try {
      const manifestPath = path.join(projectPath, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = fs.readJsonSync(manifestPath);
        if (!manifest.license) {
          manifest.license = 'CC BY-SA 4.0';
          const savePath = path.join(projectPath, 'manifest.json');
          fs.outputJsonSync(savePath, manifest);
          // Save LICENSE.md in project folder.
          await saveProjectLicense('CC BY-SA 4.0', projectPath);
        }
      }
      resolve();
    } catch (error) {
      console.error(error);
      reject(`Failed saving the project license to ${projectPath}`);
    }
  });
}
