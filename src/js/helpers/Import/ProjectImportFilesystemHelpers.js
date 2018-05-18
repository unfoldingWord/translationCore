import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
//helpers
import * as manifestHelpers from '../manifestHelpers';
// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

/**
 * @description Import Helpers for moving projects to `~/translationCore/imports` while importing
 * and to `~/translationCore/projects` after migrations and validation.
 * @param {String} projectName
 */
export const move = (projectName, translate) => {
  return new Promise((resolve, reject) => {    
    const fromPath = path.join(IMPORTS_PATH, projectName);
    const toPath = path.join(PROJECTS_PATH, projectName);
    const projectPath = path.join(PROJECTS_PATH, projectName);
    // if project does not exist then move import to projects
    const projectAlreadyExists = projectExistsInProjectsFolder(fromPath);
    if (projectAlreadyExists || fs.existsSync(toPath)) {
      fs.removeSync(path.join(IMPORTS_PATH, projectName));
      // two translatable strings are concatenated for response.
      const compoundMessage = translate('projects.project_exists', { project_path: projectName }) +
          " " + translate('projects.reimporting_not_supported');
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
          reject({ message: 'projects.import_error', data: { fromPath, toPath } });
        }
      } else {
        reject({ message: 'projects.not_found', data: { projectName, fromPath } });
      }
    }
  });
};

/**
 * @description Import Helpers for moving the contents of projects to `~/translationCore/imports` while importing
 * and to `~/translationCore/projects` after migrations and validation.
 * @param {String} projectName
 */
export const moveProjectsIntoImports = (projectName, translate) => {
  return new Promise((resolve, reject) => {    
    const importPath = path.join(IMPORTS_PATH, projectName);
    const projectPath = path.join(PROJECTS_PATH, projectName);
    // if project exist then update import from projects
    if (! fs.existsSync(projectPath)) {
      fs.removeSync(importPath);
      // two translatable strings are concatenated for response.
      const compoundMessage = translate('projects.project_does_not_exist', { project_path: projectName }) +
          " " + translate('projects.import_again_as_new_project');
      reject(compoundMessage);
    } else {
      // copy import contents to project
      if (fs.existsSync(projectPath) && fs.existsSync(importPath)) {
        let projectAppsPath = path.join(projectPath, '.apps');
        let importAppsPath = path.join(importPath, '.apps');
        if (fs.existsSync(projectAppsPath)) {
          if (! fs.existsSync(importAppsPath)) {
            // This wasn't an import of USFM3 so no data exists
            fs.copySync(path.join(projectPath, '.apps'), path.join(importPath, '.apps'));
          } else {
            // There is some alignment data from the import, as it must have been USFM3, so we preserve it
            // as we copy the rest of the project's .apps data into the import
            let alignmentPath = path.join(importAppsPath, 'translationCore', 'alignmentData');
            if (fs.existsSync(alignmentPath)) {
              let tempAlignmentPath = path.join(importPath, '.temp_alignmentData');
              fs.moveSync(alignmentPath, tempAlignmentPath);
              fs.removeSync(importAppsPath);
              fs.moveSync(projectAppsPath, importAppsPath);
              fs.removeSync(alignmentPath); // don't want the project's alignment data
              fs.moveSync(tempAlignmentPath, alignmentPath);
            }
          }
        }
        if (fs.existsSync(path.join(projectPath, '.git')))
          fs.copySync(path.join(projectPath, '.git'), path.join(importPath, '.git'));
        if (fs.existsSync(path.join(projectPath, 'LICENSE.md')))
          fs.copySync(path.join(projectPath, 'LICENSE.md'), path.join(importPath, 'LICENSE.md'));
        if (fs.existsSync(path.join(projectPath, 'manifest.json')))
          fs.copySync(path.join(projectPath, 'manifest.json'), path.join(importPath, 'manifest.json'));
        resolve(importPath);
      } else {
        reject({ message: 'projects.not_found', data: { projectName, projectPath } });
      }
    }
  });
};

/**
 * Helper function to check if the given project exists in the 'projects folder'
 *
 * @param {string} fromPath - Path that the project is moving from
 * located in the imports folder
 * @returns {boolean} - True if the project provided already exists in the
 * projects folder
 */
export function projectExistsInProjectsFolder(fromPath) {
  const isDirectory = fs.lstatSync(fromPath).isDirectory();
  if (!isDirectory) return false;
  const importProjectManifest = manifestHelpers.getProjectManifest(fromPath);
  const { target_language: { id, name }, project } = importProjectManifest;
  const projectsThatMatchImportType = getProjectsByType(id, name, project.id);
  return projectsThatMatchImportType.length > 0;
}

/**
 * Helper function to get projects from the projects folder by a given type
 *
 * @param {string} tLId - Target language id. i.e. hi
 * @param {string} tLName - Target language name i.e. Hindi
 * @param {string} bookId - Project book id i.e. tit
 * @returns {array} - Array of paths that match specified type ['~/tC/projects/myproject1', '~/tC/projects/myproject2']
 */
export function getProjectsByType(tLId, tLName, bookId) {
  const destinationPathProjects = fs.readdirSync(PROJECTS_PATH);
  return destinationPathProjects.filter((projectPath) => {
    const isDirectory = fs.lstatSync(path.join(PROJECTS_PATH, projectPath)).isDirectory();
    if (!isDirectory) return false;
    const importProjectManifest = manifestHelpers.getProjectManifest(path.join(PROJECTS_PATH, projectPath));
    const { target_language: { id, name }, project } = importProjectManifest;
    return id === tLId && name === tLName && project.id === bookId;
  });
}
