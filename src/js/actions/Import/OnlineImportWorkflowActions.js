<<<<<<< HEAD
/**
 * @Description:
 * Actions that dispatch other actions to wrap up online importing
**/
import { migrate } from './ProjectMigrationActions';
import { validate } from './ProjectValidationActions';
import { move } from './ProjectImportFilesystemActions';

export const onlineImport = () => {
  return((dispatch) => {
    // dispatch(cloneRepo());
    dispatch(migrate());
    dispatch(validate());
    dispatch(move());
  });
};
=======
import consts from '../../actions/ActionTypes';
import path from 'path-extra';
// actions
import * as ProjectMigrationActions from '../Import/ProjectMigrationActions';
import * as ProjectValidationActions from '../Import/ProjectValidationActions';
import * as ProjectImportFilesystemActions from './ProjectImportFilesystemActions';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as OnlineModeConfirmActions from '../../actions/OnlineModeConfirmActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as ProjectDetailsActions from '../ProjectDetailsActions';
import * as MyProjectsActions from '../MyProjects/MyProjectsActions';
import * as ProjectLoadingActions from '../MyProjects/ProjectLoadingActions';
// helpers
import * as OnlineImportWorkflowHelpers from '../../helpers/Import/OnlineImportWorkflowHelpers';
//consts
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(path.homedir(), 'translationCore', 'projects');

/**
 * @description Action that dispatches other actions to wrap up online importing
 */
export const onlineImport = () => {
  return ((dispatch, getState) => {
    dispatch(OnlineModeConfirmActions.confirmOnlineAction(async () => {
      /** Must allow online action before starting actions that access the internet */
      const link = getState().importOnlineReducer.importLink;
      dispatch(clearLink());
      dispatch(AlertModalActions.openAlertDialog(`Importing ${link} Please wait...`, true));
      try {
        const selectedProjectFilename = await OnlineImportWorkflowHelpers.clone(link);
        const importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename);
        const projectPath = path.join(PROJECTS_PATH, selectedProjectFilename);
        dispatch(AlertModalActions.closeAlertDialog());
        ProjectMigrationActions.migrate(importProjectPath);
        await dispatch(ProjectValidationActions.validate(importProjectPath));
        dispatch(ProjectImportFilesystemActions.move(selectedProjectFilename));
        dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
        dispatch(MyProjectsActions.getMyProjects());
        dispatch(ProjectLoadingActions.displayTools());
      } catch (e) {
        /** Catch all for errors in nested functions above */
        console.warn(e);
        dispatch(AlertModalActions.openAlertDialog(e));
        dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
        dispatch(ProjectLoadingActions.clearLastProject());
        dispatch({ type: "LOADED_ONLINE_FAILED" });
      }
    }));
  });
};

export function clearLink() {
  return {
    type: consts.IMPORT_LINK,
    importLink: ""
  };
}

export function getLink(importLink) {
  return {
    type: consts.IMPORT_LINK,
    importLink
  };
}
>>>>>>> 7f6897c218b9d4b6b85a4fbfb4ec51139a32b68e
