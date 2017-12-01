/**
 * @Description:
 * Actions that dispatch other actions to wrap up online importing
**/
import { clone } from '../../helpers/Import/OnlineImportWorkflowHelpers';
import { migrate } from './ProjectMigrationActions';
import { validate } from './ProjectValidationActions';
import { move } from './ProjectImportFilesystemActions';
import consts from '../../actions/ActionTypes';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as OnlineModeConfirmActions from '../../actions/OnlineModeConfirmActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as ProjectSelectionActions from '../ProjectSelectionActions';

export const onlineImport = () => {
  return ((dispatch, getState) => {
    dispatch(OnlineModeConfirmActions.confirmOnlineAction(async () => {
      let link = getState().importOnlineReducer.importLink;
      dispatch(clearLink());
      dispatch(AlertModalActions.openAlertDialog(`Importing ${link} Please wait...`, true));
      try {
        let projectPath = await clone(link);
        dispatch(AlertModalActions.closeAlertDialog());
        migrate(projectPath);
        await dispatch(validate(projectPath, link));
        dispatch(move());
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
