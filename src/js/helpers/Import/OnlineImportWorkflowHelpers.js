import Repo from '../Repo';
import path from 'path-extra';
import ospath from 'ospath';
import fs from 'fs-extra';

/**
 * Generates the import path from a git url
 * @param {string} url - a remote git url
 * @returns {Promise<string>} the import path
 */
export async function generateImportPath(url) {
  const cleanedUrl = Repo.sanitizeRemoteUrl(url);
  let project = Repo.parseRemoteUrl(cleanedUrl);

  if(project === null) {
    throw new Error(`The URL ${url} does not reference a valid project`);
  }

  let importPath = path.join(ospath.home(), 'translationCore', 'imports', project.name);
  const exists = await fs.pathExists(importPath);
  if (exists) {
    throw new Error(`Project ${project.name} has already been imported.`);
  }

  return importPath;
}
