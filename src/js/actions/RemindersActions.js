import consts from './ActionTypes';
// helpers
import {generateTimestamp} from '../helpers/index';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';

export function toggle(userName, timestamp) {
  return ((dispatch, getState) => {
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());

    dispatch({
      type: consts.TOGGLE_REMINDER,
      modifiedTimestamp: timestamp,
      gatewayLanguageCode,
      gatewayLanguageQuote,
      userName
    });
  });
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
