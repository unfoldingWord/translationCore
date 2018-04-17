import consts from './ActionTypes';
// helpers
import {generateTimestamp} from '../helpers/index';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';

/**
 * @description sets invalidatedReducer to true or false
 * @param {String} userName - The username of who invalidated.
 * @param {String} timestamp
 * @param {Boolean} invalidated - new state for invalidated flag
 * @return {object} action state.
 */
export function set(userName, timestamp, invalidated) {
  return ((dispatch, getState) => {
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());

    dispatch({
      type: consts.SET_INVALIDATED,
      modifiedTimestamp: timestamp,
      gatewayLanguageCode,
      gatewayLanguageQuote,
      userName,
      invalidated
    });
  });
}

/**
 * @description sets invalidated to true or false in both invalidatedReducer and groupDataReducer
 * @param {String} username - The username of who invalidated.
 * @param {Boolean} invalidated - new state for invalidated flag
 * @return {object} action state.
 */
export const setInvalidated = (username, invalidated) => {
  return ((dispatch, getState) => {
    let state = getState();
    let contextId = state.contextIdReducer.contextId;

    dispatch(set(username, generateTimestamp(), invalidated));
    dispatch({
      type: consts.SET_INVALIDATION_IN_GROUPDATA,
      contextId,
      boolean: invalidated
    });
  });
};
