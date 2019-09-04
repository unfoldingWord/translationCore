import types from './ActionTypes';

export const closeAlert = (id) => ({
  type: types.CLOSE_ALERT,
  id,
});

/**
 * Opens a new alert.
 * @param {string} id - the alert id
 * @param {*} message - the message to display in the alert
 * @param {func} onConfirm - custom confirm handler
 * @param {func} onCancel - custom cancel handler
 * @param {string} confirmText - the confirm button text
 * @param {string} cancelText - the cancel button text
 * @return {*}
 */
export const openAlert = (id, message, {
  onConfirm = null,
  onCancel = null,
  confirmText = null,
  cancelText = null,
} = {}) => ({
  type: types.OPEN_ALERT,
  id,
  message,
  onConfirm,
  confirmText,
  onCancel,
  cancelText,
});

/**
 * Opens a new alert that can be ignored.
 * @param {string} id - the alert id
 * @param {*} message
 * @param {func} onConfirm - custom confirm handler
 * @param {func} onCancel - custom cancel handler
 * @param {func} onIgnore - custom ignore handler
 * @param {string} confirmText - the confirm button text
 * @param {string} cancelText - the cancel button text
 * @param {string} ignoreText - the ignore checkbox text
 * @return {*}
 */
export const openIgnorableAlert = (id, message, {
  onConfirm = null,
  onCancel = null,
  onIgnore = null,
  confirmText = null,
  cancelText = null,
  ignoreText = null,
} = {}) => ({
  type: types.OPEN_ALERT,
  id,
  message,
  onConfirm,
  confirmText,
  onCancel,
  cancelText,
  onIgnore: typeof onIgnore === 'function' ? onIgnore : () => {},
  ignoreText,
});

/**
 * Ignores a specific alert for the rest of the session
 * @param {string} id - the alert id to ignore
 * @param {boolean} ignore - ignores or enables the alert
 * @return {*}
 */
export const ignoreAlert = (id, ignore = true) => ({
  type: types.IGNORE_ALERT,
  id,
  ignore,
});
