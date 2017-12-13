import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as AlertModalActions from '../AlertModalActions';
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
    const projectName = getState().localImportReducer.selectedProjectFilename;
    const projectPath = path.join(PROJECTS_PATH, projectName);

    ProjectImportFilesystemHelpers.move(projectName)
      .then(() => {
        dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
        fs.removeSync(path.join(IMPORTS_PATH, projectName));
      })

      .catch((error) => {
        dispatch(AlertModalActions.openAlertDialog(error));
      });
  });
};
