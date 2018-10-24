import types from './ActionTypes';

export const closeAlert = (id) => {
  return {
    type: types.CLOSE_ALERT,
    id
  };
};

export const openAlert = (id, message) => {
  return {
    type: types.OPEN_ALERT,
    id,
    message
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
