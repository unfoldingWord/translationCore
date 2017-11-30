import * as AlertModalActions from '../AlertModalActions';
import * as OnlineModeConfirmActions from '../OnlineModeConfirmActions';
import * as OnlineImportWorkflowHelpers from '../../helpers/Import/OnlineImportWorkflowHelpers';
import consts from '../ActionTypes';

/**
 * @Description:
 * Actions that dispatch other actions to wrap up online importing
**/
import { migrate } from './ProjectMigrationActions';
import { validate } from './ProjectValidationActions';
import { move } from './ProjectImportFilesystemActions';

export const onlineImport = () => {
  return ((dispatch, getState) => {
    let link = getState().importOnlineReducer.importLink;
    link = link.trim();
    dispatch(OnlineModeConfirmActions.confirmOnlineAction(() => {
      dispatch(
        AlertModalActions.openAlertDialog("Importing " + link + " Please wait...", true)
      );
      OnlineImportWorkflowHelpers.cloneRepo(link).then(()=> {
        dispatch(migrate());
        dispatch(validate());
        dispatch(move());
        dispatch(clearLink());
        dispatch(AlertModalActions.closeAlertDialog());
      }).catch((errMessage) => {
        dispatch(AlertModalActions.openAlertDialog(errMessage));
        dispatch({type: "LOADED_ONLINE_FAILED"});
      });
    }));
  });
};

export function clearLink() {
  return {
      type: consts.IMPORT_LINK,
      importLink: ""
  };
}
