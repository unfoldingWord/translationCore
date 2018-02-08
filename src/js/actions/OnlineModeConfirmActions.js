import types from './ActionTypes';
// components
import OnlineDialog from '../components/dialogComponents/OnlineDialog';
import {getTranslate} from '../selectors';
// actions
import * as AlertModalActions from './AlertModalActions';
import React from 'react';

export function confirmOnlineAction(callback) {
  return ((dispatch, getState) => {
    const translate = getTranslate(getState());
    const cancelText = translate('cancel');
    const onlineMode = getState().settingsReducer.onlineMode;
    if (!onlineMode) {
      const onConfirmCheckCallback = (val) => {
        dispatch(checkBox(val));
      };
      // TODO: this is a very bad idea. We should not be storing react components in the state
      dispatch(AlertModalActions.openOptionDialog(<OnlineDialog onChecked={onConfirmCheckCallback}/>,
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

