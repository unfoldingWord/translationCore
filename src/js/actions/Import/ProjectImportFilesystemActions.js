/**
 * @Description:
 * Actions that call helpers to handle business logic for moving projects
**/

// actions
import * as AlertModalActions from '../AlertModalActions';
// helpers
import * as ProjectImportFilesystemHelpers from '../../helpers/Import/ProjectImportFilesystemHelpers';

export const move = (projectName) => {
  return((dispatch, getState) => {
    ProjectImportFilesystemHelpers.move(projectName)
      .catch((error) => {
        dispatch(AlertModalActions.openAlertDialog(error));
      });
  });
};
