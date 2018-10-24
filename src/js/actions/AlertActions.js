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
 * @param {boolean} ignorable - makes the alert id ignorable.
 * @return {*}
 */
export const openAlert = (id, message, ignorable=false) => {
  return {
    type: types.OPEN_ALERT,
    id,
    message,
    onIgnore : ignorable ? () => {} : null
  };
};

/**
 * Ignores a specific alert for the rest of the session
 * @param {string} id - the alert id to ignore
 * @param {boolean} ignore - ignores or enables the alert
 * @return {*}
 */
export const ignoreAlert = (id, ignore=true) => {
  return {
    type: types.IGNORE_ALERT,
    id,
    ignore
  };
};
