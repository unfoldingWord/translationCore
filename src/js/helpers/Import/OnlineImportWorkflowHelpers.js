import path from 'path-extra';
import fs from 'fs-extra';
import env from 'tc-electron-env';
import Repo from '../Repo';

/**
 * Generates the import path from a git url
 * @param {string} url - a remote git url
 * @returns {Promise<string>} the import path
 */
export async function generateImportPath(url) {
  const cleanedUrl = Repo.sanitizeRemoteUrl(url);
  let project = Repo.parseRemoteUrl(cleanedUrl);

  if (project === null) {
    throw new Error(`The URL ${url} does not reference a valid project`);
  }

  let importPath = path.join(env.home(), 'translationCore', 'imports', project.name);
  const exists = await fs.pathExists(importPath);

  if (exists) {
    throw new Error(`Project ${project.name} has already been imported.`);
  }

  return importPath;
}

/**
 * make sure this is a tStudio or tCore Project before we try to import it
 * @param {String} projectPath - path to project project
 * @return {Boolean} true if tStudio or tCore Project
 */
export function verifyThisIsTCoreOrTStudioProject(projectPath) {
  const projectManifestPath = path.join(projectPath, 'manifest.json');
  const projectTCManifestPath = path.join(projectPath, 'tc-manifest.json');
  let valid = fs.existsSync(projectTCManifestPath); // if we have tc-manifest.json, then need no more checking

  if (!valid) { // check standard manifest.json
    if (fs.existsSync(projectManifestPath)) {
      const manifest = fs.readJsonSync(projectManifestPath);

      if (manifest) {
        const generatorName = manifest.generator && manifest.generator.name;
        const isTStudioProject = (generatorName &&
          (generatorName.indexOf('ts-') === 0)); // could be ts-desktop or ts-android
        const isTCoreProject = (generatorName &&
          (generatorName === 'tc-desktop')) ||
          (manifest.tc_version) || (manifest.tcInitialized);
        valid = (isTStudioProject || isTCoreProject);
      }
    }
  }
  return valid;
}
