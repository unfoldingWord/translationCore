import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as ProjectImportFilesystemHelpers from '../../helpers/Import/ProjectImportFilesystemHelpers';
// constants
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');

/**
 * @description Moves a project from imports folder to projects folder
 */
export const move = () => {
  return ((dispatch, getState) => {
    return new Promise(async(resolve, reject) => {
      try {
        const projectName = getState().localImportReducer.selectedProjectFilename;
        await ProjectImportFilesystemHelpers.move(projectName, dispatch);
        fs.removeSync(path.join(IMPORTS_PATH, projectName));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

/**
 * Deletes a project from the imports folder
 */
export const deleteProjectFromImportsFolder = (projectName) => (dispatch, getState) => {
  projectName = projectName || getState().localImportReducer.selectedProjectFilename;
  const projectImportsLocation = path.join(IMPORTS_PATH, projectName);
  if (fs.existsSync(projectImportsLocation)) {
    fs.removeSync(projectImportsLocation);
  }
};
