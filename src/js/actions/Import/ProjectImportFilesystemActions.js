import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as ProjectDetailsActions from '../ProjectDetailsActions';
// helpers
import * as ProjectImportFilesystemHelpers from '../../helpers/Import/ProjectImportFilesystemHelpers';
// constants
const PROJECTS_PATH = path.join(path.homedir(), 'translationCore', 'projects');
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');

/**
 * @description Moves a project from imports folder to projects folder
 */
export const move = () => {
  return ((dispatch, getState) => {
    return new Promise(async(resolve, reject) => {
      const projectName = getState().localImportReducer.selectedProjectFilename;
      const projectPath = path.join(PROJECTS_PATH, projectName);
      try {
        await ProjectImportFilesystemHelpers.move(projectName);
        dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
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
export const deleteProjectFromImportsFolder = () => (dispatch, getState) => {
  const projectName = getState().localImportReducer.selectedProjectFilename;
  const projectImportsLocation = path.join(IMPORTS_PATH, projectName);

  if (fs.existsSync(projectImportsLocation)) {
    fs.removeSync(projectImportsLocation);
  }
};
