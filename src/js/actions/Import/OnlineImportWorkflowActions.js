import consts from '../../actions/ActionTypes';
import path from 'path-extra';
// actions
import * as ProjectMigrationActions from '../Import/ProjectMigrationActions';
import * as ProjectValidationActions from '../Import/ProjectValidationActions';
import * as ProjectImportFilesystemActions from './ProjectImportFilesystemActions';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as OnlineModeConfirmActions from '../../actions/OnlineModeConfirmActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as MyProjectsActions from '../MyProjects/MyProjectsActions';
import * as ProjectLoadingActions from '../MyProjects/ProjectLoadingActions';
// helpers
import * as OnlineImportWorkflowHelpers from '../../helpers/Import/OnlineImportWorkflowHelpers';
//consts
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');

export const onlineImport = () => {
  return ((dispatch, getState) => {
    dispatch(OnlineModeConfirmActions.confirmOnlineAction(async () => {
      try {
        const link = getState().importOnlineReducer.importLink;
        dispatch(clearLink());
        dispatch(AlertModalActions.openAlertDialog(`Importing ${link} Please wait...`, true));
        const selectedProjectFilename = await OnlineImportWorkflowHelpers.clone(link);
        dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename });
        const importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename);
        ProjectMigrationActions.migrate(importProjectPath);
        await dispatch(ProjectValidationActions.validate(importProjectPath));
        dispatch(ProjectImportFilesystemActions.move());
        dispatch(MyProjectsActions.getMyProjects());
        dispatch(ProjectLoadingActions.displayTools());
      } catch (e) {
        await dispatch(AlertModalActions.openAlertDialog(e));
        await dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
        await dispatch(ProjectLoadingActions.clearLastProject());
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
