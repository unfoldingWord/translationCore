<<<<<<< HEAD
/**
 * @Description:
 * Actions that call helpers to handle business logic for moving projects
**/

export const move = () => {
  // return((dispatch, getState) => {
  // });
=======
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
>>>>>>> 7f6897c218b9d4b6b85a4fbfb4ec51139a32b68e
};
