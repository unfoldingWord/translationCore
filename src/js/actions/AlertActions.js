import types from './ActionTypes';

export const closeAlert = (id) => {
  return {
    type: types.CLOSE_ALERT,
    id
  };
};

/**
 * Opens a new alert
 * @param {string} id - the alert id
 * @param {*} message - the message to display in the alert
 * @param {boolean} ignorable - a convenience property to make the alert ignorable handling the ignore callback.
 * @param {func} onConfirm - custom confirm handler.
 * @param {func} onCancel - custom cancel handler.
 * @param {func} onIgnore - custom ignore handler. This overrides `ignorable`.
 * @param {string} confirmText - the confirm button text
 * @param {string} cancelText - the cancel button text
 * @param {string} ignoreText - the ignore checkbox text
 * @return {*}
 */
export const openAlert = (id, message, ignorable = false, {
  onConfirm = null,
  onCancel = null,
  onIgnore = null,
  confirmText = null,
  cancelText = null,
  ignoreText = null
} = {}) => {

  // generate convenience ignore fallback
  let ignoreFallback = null;
  if (ignorable) {
    ignoreFallback = () => {};
  }

  return {
    type: types.OPEN_ALERT,
    id,
    message,
    onConfirm,
    confirmText,
    onCancel,
    cancelText,
    onIgnore: onIgnore ? onIgnore : ignoreFallback,
    ignoreText
  };
};

/**
 * Ignores a specific alert for the rest of the session
 * @param {string} id - the alert id to ignore
 * @param {boolean} ignore - ignores or enables the alert
 * @return {*}
 */
export const ignoreAlert = (id, ignore = true) => {
  return {
    type: types.IGNORE_ALERT,
    id,
    ignore
  };
};
