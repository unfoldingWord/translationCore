import React from 'react';
import OnlineDialog from '../components/dialogComponents/OnlineDialog';
import { getTranslate } from '../selectors';
import types from './ActionTypes';
// components
// actions
import * as AlertModalActions from './AlertModalActions';
// selectors

/**
 * Displays a confirmation dialog before users access the internet.
 * @param {func} onConfirm - callback when the user allows internet access
 * @param {func} onCancel - callback when the user denies internet access
 * @return {Function} - returns a thunk for redux
 */
export function confirmOnlineAction(onConfirm, onCancel) {
  return ((dispatch, getState) => {
    const translate = getTranslate(getState());
    const cancelText = translate('buttons.cancel_button');
    const onlineMode = getState().settingsReducer.onlineMode;

    if (!onlineMode) {
      const onConfirmCheckCallback = (val) => {
        dispatch(checkBox(val));
      };

      // TODO: this is a very bad idea. We should not be storing react components in the state
      dispatch(AlertModalActions.openOptionDialog(
        <OnlineDialog translate={translate} onChecked={onConfirmCheckCallback}/>,
        (result) => {
          if (result !== cancelText) {
            dispatch(AlertModalActions.closeAlertDialog());
            onConfirm();
          } else {
            dispatch(AlertModalActions.closeAlertDialog());

            if (typeof onCancel === 'function') {
              onCancel();
            }
          }
        }, translate('access_internet'), cancelText));
    } else {
      onConfirm();
    }
  });
}

export function checkBox(val) {
  return {
    type: types.UPDATE_ONLINE_MODE,
    val,
  };
}

