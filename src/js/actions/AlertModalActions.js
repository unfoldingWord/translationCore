/**
 * @module Actions/AlertModal
 */

import consts from './ActionTypes';

/**
 * @description opens the alert dialog with the specified alert message.
 * @param {String} alertMessage - message to be displayed inside the alert dialog.
 * @param {Boolean} loading - true displays spinning icon and no action button in dialog.
 * @param {String} buttonText - optional button text
 * @param {function} callback - callback for when optional button was pressed
 * @return {object} action content.
 */
export function openAlertDialog(alertMessage, loading, buttonText = null, callback = null) {
  return {
    type: consts.OPEN_ALERT_DIALOG,
    alertMessage,
    loading,
    buttonText,
    callback,
  };
}

/**
 * @description opens the option dialog with the specified alert message, and options.
 * @param {String} alertMessage - message to be displayed inside the alert dialog.
 * @param {function} callback - callback function that is called when clicking on button.  First parameter is text on button. Exception is when callback2 is given.
 * @param {String} button1Text - button text to show right button.
 * @param {String} button2Text - button text to show left of right button. (optional - if not present button is not added)
 * @param {String} buttonLinkText - button text to show on left link button. (optional - if not present button is not added)
 * @param {function} callback2 - optional callback function that is called user clicks on button2Text.
 * @param {Boolean} notCloseableAlert - boolean to make the alert not closeable. (optional - if not present alert is closeable by clicking the x otherwise the x doesn't show up)
 * @return {Object} action content.
 */
export function openOptionDialog(alertMessage, callback, button1Text, button2Text, buttonLinkText = null, callback2 = null, notCloseableAlert = false) {
  return {
    type: consts.OPEN_OPTION_DIALOG,
    alertMessage,
    callback,
    callback2,
    button1Text,
    button2Text,
    buttonLinkText,
    notCloseableAlert,
  };
}

/**
 * @description closes the alert dialog.
 * @return {object} action content.
 */
export function closeAlertDialog() {
  return { type: consts.CLOSE_ALERT_DIALOG };
}
