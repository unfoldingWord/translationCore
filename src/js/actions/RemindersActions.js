import consts from './ActionTypes';
import {generateTimestamp} from '../helpers/index';

export function toggle(userName, timestamp) {
  return {
    type: consts.TOGGLE_REMINDER,
    modifiedTimestamp: timestamp,
    userName
  };
}

/**
 * @description Toggles the reminder to true or false
 * @param {String} username - The username of who toggled the reminder.
 * @return {object} action state.
 */
export const toggleReminder = username => {
  return ((dispatch, getState) => {
    let state = getState();
    let contextId = state.contextIdReducer.contextId;

    dispatch(toggle(username, generateTimestamp()));
    dispatch({
      type: consts.TOGGLE_REMINDERS_IN_GROUPDATA,
      contextId
    });
  });
};
