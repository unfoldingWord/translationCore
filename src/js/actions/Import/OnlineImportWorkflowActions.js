import * as AlertModalActions from '../AlertModalActions';
import * as OnlineModeConfirmActions from '../OnlineModeConfirmActions';
import * as OnlineImportWorkflowHelpers from '../../helpers/Import/OnlineImportWorkflowHelpers';
import consts from '../ActionTypes';

/**
 * @Description:
 * Actions that dispatch other actions to wrap up online importing
**/

export const onlineImport = () => {
  return ((dispatch, getState) => {
    let link = getState().importOnlineReducer.importLink;
    link = link.trim();
    dispatch(OnlineModeConfirmActions.confirmOnlineAction(() => {
      dispatch(
        AlertModalActions.openAlertDialog("Importing " + link + " Please wait...", true)
      );
      OnlineImportWorkflowHelpers.cloneRepo(link).then(()=> {
        /* TO be implemented:
        dispatch(migrate());
        dispatch(validate());
        dispatch(move());
        */
      }).catch((errMessage) => {
        dispatch(AlertModalActions.openAlertDialog(errMessage));
        dispatch({type: "LOADED_ONLINE_FAILED"});
        dispatch({type: consts.RESET_IMPORT_ONLINE_REDUCER});
      });
    }));
  });
};
