/* eslint-disable no-async-promise-executor */
import fs from 'fs-extra';
import path from 'path-extra';
import { PROJECT_LICENSES_PATH } from '../common/constants';

/**
 * Saves the LICENSE.md in project folder and
 * adds the license Id to project manifest
 * @param {String} licenseId
 */
export async function saveProjectLicense(licenseId, projectSaveLocation) {
  const licenseSavePath = path.join(projectSaveLocation, 'LICENSE.md');
  const licenseData = loadProjectLicenseMarkdownFile(licenseId);

  await fs.outputFile(licenseSavePath, licenseData);
}

/**
 * Reads in the license markdown file from the filesystem.
 * @param {String} licenseId
 */
export function loadProjectLicenseMarkdownFile(licenseId) {
  const fileName = licenseId + '.md';
  const projectLicensePath = path.join(PROJECT_LICENSES_PATH, fileName);

  return fs.readFileSync(projectLicensePath, 'utf8');
}

/**
 * Assigns a License To project Imported from D43
 * @param {string} projectPath
 */
export async function assignLicenseToOnlineImportedProject(projectPath) {
  try {
    const manifestPath = path.join(projectPath, 'manifest.json');

    if (await fs.exists(manifestPath)) {
      const manifest = await fs.readJson(manifestPath);

      if (!manifest.license) {
        manifest.license = 'CC BY-SA 4.0';
        const savePath = path.join(projectPath, 'manifest.json');
        await fs.outputJson(savePath, manifest, { spaces: 2 });
        // Save LICENSE.md in project folder.
        await saveProjectLicense('CC BY-SA 4.0', projectPath);
      }
    }
  } catch (error) {
    console.error('assignLicenseToOnlineImportedProject()', error);
    throw (`Failed saving the project license to ${projectPath}`); // eslint-disable-line no-throw-literal
  }
}
