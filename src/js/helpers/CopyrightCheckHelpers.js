/* eslint-disable no-async-promise-executor */
import fs from 'fs-extra';
import path from 'path-extra';

/**
 * @description saves the LICENSE.md in project folder and
 * adds the license Id to project manifest
 * @param {String} licenseId
 */
export async function saveProjectLicense(licenseId, projectSaveLocation) {
  const licenseSavePath = path.join(projectSaveLocation, 'LICENSE.md');
  const licenseData = loadProjectLicenseMarkdownFile(licenseId);

  await fs.outputFile(licenseSavePath, licenseData);
}

/**
 * reads in the license markdown file from the filesystem.
 * @param {String} licenseId
 */
export function loadProjectLicenseMarkdownFile(licenseId) {
  const fileName = licenseId + '.md';
  const projectLicensesPath = path.join('./assets/projectLicenses', fileName);

  return fs.readFileSync(projectLicensesPath, 'utf8');
}

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
