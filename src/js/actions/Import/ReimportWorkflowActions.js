// actions
import * as AlertModalActions from '../AlertModalActions';
// helpers
import {getTranslate} from '../../selectors';

/**
 * Displays a confirmation dialog before users access the internet.
 * @param {string} message - the message in the alert box
 * @param {func} onConfirm - callback when the user allows reimport
 * @param {func} onCancel - callback when the user denies reimport
 * @return {Function} - returns a thunk for redux
 */
export const confirmReimportDialog = (message, onConfirm, onCancel) => {
  return ((dispatch, getState) => {
    const translate = getTranslate(getState());
    const confirmText = translate('buttons.overwrite_project');
    const cancelText = translate('buttons.cancel_button');
    dispatch(AlertModalActions.openOptionDialog(message,
      (result) => {
        if (result !== cancelText) {
          dispatch(AlertModalActions.closeAlertDialog());
          onConfirm();
        } else {
          dispatch(AlertModalActions.closeAlertDialog());
          onCancel();
        }
      }, confirmText, cancelText));
  });
};
