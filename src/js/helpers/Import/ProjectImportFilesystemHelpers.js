import React from 'react';
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
export const move = (projectName) => {
  return new Promise((resolve, reject) => {
    const fromPath = path.join(IMPORTS_PATH, projectName);
    const toPath = path.join(PROJECTS_PATH, projectName);
    const projectPath = path.join(PROJECTS_PATH, projectName);
    // if project does not exist then move import to projects
    const projectAlreadyExists = projectExistsInProjectsFolder(fromPath);
    if (projectAlreadyExists || fs.existsSync(toPath)) {
      fs.removeSync(path.join(IMPORTS_PATH, projectName));
      reject(
        <div>
          The project you selected ({projectName}) already exists.<br />
          Reimporting existing projects is not currently supported.
        </div>
      );
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
          reject(
            <div>
              Error occured while importing your project.<br />
              Could not move the project from {fromPath} to {toPath}
            </div>
          );
        }
      } else {
        reject(
          <div>
            Error occured while importing your project.<br />
            The project file {projectName} was not found in {fromPath}
          </div>
        );
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