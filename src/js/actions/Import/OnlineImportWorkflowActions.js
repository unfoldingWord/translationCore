/**
 * @Description:
 * Actions that dispatch other actions to wrap up online importing
**/
import path from 'path-extra';
import { clone } from '../../helpers/Import/OnlineImportWorkflowHelpers';
import { migrate } from './ProjectMigrationActions';
import { validate } from './ProjectValidationActions';
import { move } from './ProjectImportFilesystemActions';
import consts from '../../actions/ActionTypes';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as OnlineModeConfirmActions from '../../actions/OnlineModeConfirmActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as ProjectSelectionActions from '../ProjectSelectionActions';
import * as ProjectDetailsActions from '../ProjectDetailsActions';
import * as MyProjectsActions from '../MyProjects/MyProjectsActions';
import { displayTools } from '../MyProjects/ProjectLoadingActions';
//consts
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(path.homedir(), 'translationCore', 'projects');

export const onlineImport = () => {
  return ((dispatch, getState) => {
    dispatch(OnlineModeConfirmActions.confirmOnlineAction(async () => {
      const link = getState().importOnlineReducer.importLink;
      dispatch(clearLink());
      dispatch(AlertModalActions.openAlertDialog(`Importing ${link} Please wait...`, true));
      try {
        const selectedProjectFilename = await clone(link);
        const importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename); 
        const projectPath = path.join(PROJECTS_PATH, selectedProjectFilename);
        dispatch(AlertModalActions.closeAlertDialog());
        migrate(importProjectPath);
        await dispatch(validate(importProjectPath));
        dispatch(move(selectedProjectFilename));
        dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
        dispatch(MyProjectsActions.getMyProjects());
        dispatch(displayTools());
      } catch (e) {
        await dispatch(AlertModalActions.openAlertDialog(e));
        await dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
        await dispatch(ProjectSelectionActions.clearLastProject());
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
