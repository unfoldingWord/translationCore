import types from './ActionTypes';
// components
import OnlineDialog from '../components/dialogComponents/OnlineDialog';
import {getTranslate} from '../selectors';
// actions
import * as AlertModalActions from './AlertModalActions';
// consts

export function confirmOnlineAction(callback) {
  return ((dispatch, getState) => {
    const translate = getTranslate(getState());
    const cancelText = translate('cancel');
    var onlineMode = getState().settingsReducer.onlineMode;
    if (!onlineMode) {
      dispatch(AlertModalActions.openOptionDialog(OnlineDialog((val) => dispatch(checkBox(val))),
        (result) => {
          if (result !== cancelText) {
            dispatch(AlertModalActions.closeAlertDialog());
            callback();
          } else dispatch(AlertModalActions.closeAlertDialog());
        }, translate('access_internet'), cancelText));
    } else callback();
  });
}

export function checkBox(val) {
  return {
    type: types.UPDATE_ONLINE_MODE,
    val
  };
}

