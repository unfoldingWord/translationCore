// modules
import fs from 'fs-extra';
import path from 'path-extra';

/**
 * @description saves the LICENSE.md in project folder and
 * adds the license Id to project manifest
 * @param {String} licenseId 
 */
export function saveProjectLicense(licenseId, projectSaveLocation) {
  const fileName = licenseId + '.md';
  const projectLicensesPath = path.join(window.__base, 'src/assets/projectLicenses', fileName);
  const licenseSavePath = path.join(projectSaveLocation, 'LICENSE.md')
  const licenseData = fs.readFileSync(projectLicensesPath);

  fs.outputFileSync(licenseSavePath, licenseData)
}
