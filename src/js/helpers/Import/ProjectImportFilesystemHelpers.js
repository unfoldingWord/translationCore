import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// actions
import * as ProjectDetailsActions from '../../actions/ProjectDetailsActions';
//helpers
import * as manifestHelpers from '../manifestHelpers';
// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

/**
 * @description Import Helpers for moving projects to `~/translationCore/imports` while importing
 * and to `~/translationCore/projects` after migrations and validation.
 * @param {String} projectName
 * @param {Function} dispatch
 */
export const move = (projectName, dispatch) => {
  return new Promise((resolve, reject) => {
    const fromPath = path.join(IMPORTS_PATH, projectName);
    const toPath   = path.join(PROJECTS_PATH, projectName);
    const projectPath = path.join(PROJECTS_PATH, projectName);
    // if project does not exist then move import to projects
    const projectAlreadyExists = projectExistsInProjectsFolder(fromPath);
    if(projectAlreadyExists) {
      fs.removeSync(path.join(IMPORTS_PATH, projectName));
      reject(
        <div>
          The project you selected ({projectName}) already exists.<br />
          Reimporting existing projects is not currently supported.
        </div>
      );
    } else {
      // copy import to project
      if(fs.existsSync(fromPath)) {
        fs.copySync(fromPath, toPath);
        // verify target project copied
        if(fs.existsSync(toPath)) {
          // remove from imports
          fs.removeSync(fromPath);
          dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
          resolve();
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

export function projectExistsInProjectsFolder(fromPath) {
  const importProjectManifest = manifestHelpers.getProjectManifest(fromPath);
  const { target_language: { id, name }, project } = importProjectManifest;
  const projectsThatMatchImportType = getProjectsByType(id, name, project.id);
  return projectsThatMatchImportType.length > 0;
}

export function getProjectsByType(tLId, tLName, bookId) {
  const destinationPathProjects = fs.readdirSync(PROJECTS_PATH);
  return destinationPathProjects.filter((projectPath) => {
    const importProjectManifest = manifestHelpers.getProjectManifest(path.join(PROJECTS_PATH, projectPath));
    const { target_language: { id, name }, project } = importProjectManifest;
    return id === tLId && name === tLName && project.id === bookId;
  });
}