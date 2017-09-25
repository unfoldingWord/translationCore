import consts from './ActionTypes';
import {generateTimestamp} from '../helpers/index';

/**
 * @description Toggles the reminder to true or false
 * @param {String} userName - The username of who toggled the reminder.
 * @return {object} action state.
 */
export const toggleReminder = userName => {
  return ((dispatch, getState) => {
    let state = getState();
    let contextId = state.contextIdReducer.contextId;

    dispatch({
      type: consts.TOGGLE_REMINDER,
      modifiedTimestamp: generateTimestamp(),
      userName
    });
    dispatch({
      type: consts.TOGGLE_REMINDERS_IN_GROUPDATA,
      contextId
    });
  });
};
