import consts from './ActionTypes';
// components
import OnlineDialog from '../components/dialogComponents/OnlineDialog';
// actions
import * as AlertModalActions from './AlertModalActions';
// consts

export function confirmOnlineAction(callback) {
  return ((dispatch, getState) => {
    var onlineMode = getState().settingsReducer.onlineMode;
    if (!onlineMode) {
      dispatch(AlertModalActions.openOptionDialog(OnlineDialog((val) => dispatch(checkBox(val))),
        (result) => {
          if (result != 'Cancel') {
            dispatch(AlertModalActions.closeAlertDialog());
            callback();
          } else dispatch(AlertModalActions.closeAlertDialog());
        }, 'Access Internet', 'Cancel'));
    } else callback();
  });
}

export function checkBox(val) {
  return {
    type: consts.UPDATE_ONLINE_MODE,
    val
  };
}

