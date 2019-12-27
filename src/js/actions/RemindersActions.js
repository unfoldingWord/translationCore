// helpers
import { generateTimestamp } from '../helpers/index';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';
import consts from './ActionTypes';

export function toggle(userName, timestamp) {
  return ((dispatch, getState) => {
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote,
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());

    dispatch({
      type: consts.TOGGLE_REMINDER,
      modifiedTimestamp: timestamp,
      gatewayLanguageCode,
      gatewayLanguageQuote,
      userName,
    });
  });
}

/**
 * @description Toggles the reminder to true or false
 * @return {object} action state.
 */
export const toggleReminder = () => ((dispatch, getState) => {
  const state = getState();
  const contextId = state.contextIdReducer.contextId;
  const username = state.loginReducer.userdata.username;

  dispatch(toggle(username, generateTimestamp()));
  dispatch({
    type: consts.TOGGLE_REMINDERS_IN_GROUPDATA,
    contextId,
  });
});
