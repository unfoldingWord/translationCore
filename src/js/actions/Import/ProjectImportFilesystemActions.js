// actions
import * as AlertModalActions from '../AlertModalActions';
// helpers
import * as ProjectImportFilesystemHelpers from '../../helpers/Import/ProjectImportFilesystemHelpers';

/**
 *  Moves a project from imports folder to projects folder
 * @param {String} projectName
 */
export const move = (projectName) => {
  return ((dispatch) => {
    ProjectImportFilesystemHelpers.move(projectName)
      .catch((error) => {
        dispatch(AlertModalActions.openAlertDialog(error));
      });
  });
};
