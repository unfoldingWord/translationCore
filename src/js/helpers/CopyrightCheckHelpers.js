// modules
import fs from 'fs-extra';
import path from 'path-extra';

/**
 * @description saves the LICENSE.md in project folder and
 * adds the license Id to project manifest
 * @param {String} licenseId 
 */
export function saveProjectLicense(licenseId, projectSaveLocation) {
  const licenseSavePath = path.join(projectSaveLocation, 'LICENSE.md')
  const licenseData = loadProjectLicenseMarkdownFile(licenseId);

  fs.outputFileSync(licenseSavePath, licenseData)
}

/**
 * reads in the license markdown file from the filesystem.
 * @param {String} licenseId 
 */
export function loadProjectLicenseMarkdownFile(licenseId) {
  const fileName = licenseId + '.md';
  const projectLicensesPath = path.join(window.__base, 'src/assets/projectLicenses', fileName);
 
  return fs.readFileSync(projectLicensesPath);
}
