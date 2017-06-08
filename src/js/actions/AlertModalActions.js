import consts from './ActionTypes';

/**
 * @description opens the alert dialog with the specified alert message.
 * @param {string} alertMessage - message to be displayed inside the alert dialog.
 * @param {boolean} loading - true displays spinning icon and no action button in dialog.
 * @return {object} action content.
 */
export function openAlertDialog(alertMessage, loading) {
  return {
    type: consts.OPEN_ALERT_DIALOG,
    alertMessage,
    loading
  }
}

/**
 * @description opens the option dialog with the specified alert message, and options.
 * @param {string} alertMessage - message to be displayed inside the alert dialog.
 * @param {function} callback - message to be displayed inside the alert dialog.
 * @param {string} button1Text - message to be displayed inside the alert dialog.
 * @param {string} button2Text - message to be displayed inside the alert dialog.
 * @return {object} action content.
 */
export function openOptionDialog(alertMessage, callback, button1Text, button2Text) {
  return {
    type: consts.OPEN_OPTION_DIALOG,
    alertMessage,
    callback,
    button1Text,
    button2Text
  };
}


/**
 * @description closes the alert dialog.
 * @return {object} action content.
 */
export function closeAlertDialog() {
  return {
    type: consts.CLOSE_ALERT_DIALOG
  };
}
