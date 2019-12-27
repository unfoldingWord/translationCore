import fs from 'fs-extra';
import path from 'path-extra';
//helpers
import * as manifestHelpers from '../manifestHelpers';
// constants
import { PROJECTS_PATH, IMPORTS_PATH } from '../../common/constants';
const TEMP_DIR = IMPORTS_PATH + '-old';

/**
 * Import Helpers for moving projects to `~/translationCore/imports` while importing
 * and to `~/translationCore/projects` after migrations and validation.
 * @param {String} projectName
 * @param translate
 */
export const moveProject = (projectName, translate) => new Promise((resolve, reject) => {
  const fromPath = path.join(IMPORTS_PATH, projectName);
  const toPath = path.join(PROJECTS_PATH, projectName);
  const projectPath = path.join(PROJECTS_PATH, projectName);
  // if project does not exist then move import to projects
  const projectAlreadyExists = projectExistsInProjectsFolder(fromPath);

  if (projectAlreadyExists || fs.existsSync(toPath)) {
    fs.removeSync(path.join(IMPORTS_PATH, projectName));
    // two translatable strings are concatenated for response.
    const compoundMessage = translate('projects.project_exists', { project_path: projectName }) +
          ' ' + translate('projects.reimporting_not_supported');
    reject(compoundMessage);
  } else {
    // copy import to project
    if (fs.existsSync(fromPath)) {
      fs.copySync(fromPath, toPath);

      // verify target project copied
      if (fs.existsSync(toPath)) {
        // remove from imports
        fs.removeSync(fromPath);
        resolve(projectPath);
      } else {
        reject({ message: 'projects.local_import_error', data: { fromPath, toPath } });
      }
    } else {
      reject({ message: 'projects.not_found', data: { projectName, fromPath } });
    }
  }
});

/**
 * Helper function to check if the given project exists in the 'projects folder',
 *    goes beyond project names and checks attributes such as language_id, bookId,
 *    resource_id for uniqueness
 *
 * @param {string} fromPath - Path that the project is moving from
 *                              located in the imports folder
 * @returns {boolean} - True if the project provided already exists in the
 *                            projects folder
 */
export function projectExistsInProjectsFolder(fromPath) {
  const isDirectory = fs.lstatSync(fromPath).isDirectory();

  if (!isDirectory) {
    return false;
  }

  const importProjectManifest = manifestHelpers.getProjectManifest(fromPath);
  const {
    target_language: { id }, project, resource,
  } = importProjectManifest;
  const resourceId = resource && resource.id ? resource.id : '';
  const projectsThatMatchImportType = getProjectsByType(id, project.id, resourceId );
  return projectsThatMatchImportType.length > 0;
}

/**
 * case insensitive compare of two strings
 * @param {String} a
 * @param {String} b
 * @return {boolean} true if equal in lowercase
 */
export function areStringsEqualCaseInsensitive(a, b) {
  return (
    (typeof a === 'string') &&
    (typeof a === typeof b) &&
    (a.toLowerCase() === b.toLowerCase()));
}

/**
 * Helper function to get projects from the projects folder by a given type
 *
 * @param {string} tLId - Target language id. e.g. hi
 * @param {string} bookId - Project book id e.g. tit
 * @param {string} resourceId - Translation identifier e.g. ULT
 * @returns {array} - Array of paths that match specified type ['~/tC/projects/myproject1', '~/tC/projects/myproject2']
 */
export function getProjectsByType(tLId, bookId, resourceId) {
  const destinationPathProjects = fs.readdirSync(PROJECTS_PATH);
  return destinationPathProjects.filter((projectName) => {
    const isDirectory = fs.lstatSync(path.join(PROJECTS_PATH, projectName)).isDirectory();

    if (!isDirectory) {
      return false;
    }

    const importProjectManifest = manifestHelpers.getProjectManifest(path.join(PROJECTS_PATH, projectName));
    const {
      target_language: { id }, project, resource,
    } = importProjectManifest;
    const resourceId_ = resource && resource.id ? resource.id : '';
    return areStringsEqualCaseInsensitive(id, tLId) &&
      areStringsEqualCaseInsensitive(project.id, bookId) &&
      areStringsEqualCaseInsensitive(resourceId_, resourceId);
  });
}

/**
 * Deletes  the imports folder before import. Since there had been a race condition,
 * It now renames the "to be deleted folder" to ...-old
 * then deletes it so that async functions will not be confused.
 */
export const deleteImportsFolder = async () => {
  console.log('deleteImportsFolder()');

  try {
    if (await fs.exists(IMPORTS_PATH)) {
      await fs.rename(IMPORTS_PATH, TEMP_DIR);
      await fs.remove(TEMP_DIR);
    }
  } catch (err) {
    console.error('deleteImportsFolder()', err);
    throw (err);
  }
};

/**
 * Deletes a project from the imports folder
 * @param projectName - the name of the project to be deleted
 */
export const deleteProjectFromImportsFolder = (projectName) => {
  const projectPath = path.join(IMPORTS_PATH, projectName);

  if (fs.existsSync(projectPath)) {
    fs.removeSync(projectPath);
  }
};
