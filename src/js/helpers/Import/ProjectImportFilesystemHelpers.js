import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
// constants
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(path.homedir(), 'translationCore', 'projects');

/**
 * @description Import Helpers for moving projects to `~/translationCore/imports` while importing
 * and to `~/translationCore/projects` after migrations and validation.
 * @param {String} projectName
 */
export const move = (projectName) => {
  return new Promise((resolve, reject) => {
    const fromPath = path.join(IMPORTS_PATH, projectName);
    const toPath   = path.join(PROJECTS_PATH, projectName);
    // if project does not exist then move import to projects
    if(fs.existsSync(toPath)) {
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
