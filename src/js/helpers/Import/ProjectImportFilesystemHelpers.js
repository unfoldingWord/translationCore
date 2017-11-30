/**
 * @Description:
 * Import Helpers for moving projects to `~/translationCore/imports` while importing
 * and to `~/translationCore/projects` after migrations and validation.
 * Other import based fs functions should reside here if possible for maintainability
 * and to make fs mocks simpler.
 */
// Bruce Anchor
jest.unmock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
// constants
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(path.homedir(), 'translationCore', 'projects');

export const move = (projectName) => {
  return new Promise((resolve, reject) => {
    const fromPath = path.join(IMPORTS_PATH, projectName);
    const toPath   = path.join(PROJECTS_PATH, projectName);
    // if project does not exist then move import to projects
    if(fs.existsSync(toPath)) {
      reject(`Project: ${toPath} already exists. Cannot copy.`);
    } else {
      // copy import to project
      if(fs.existsSync(fromPath)) {
        fs.copySync(fromPath, toPath);
        // verify target project copied
        if(fs.existsSync(toPath)) {
          // remove from imports
          fs.removeSync(fromPath);
        } else {
         reject(`Could not copy: ${fromPath} to: ${toPath}`);
        }
      } else {
        reject(`No import project: ${fromPath}`);
      }
    }
  });
};
