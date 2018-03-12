/**
 * @module Actions/Comments
 */

import consts from './ActionTypes';
// helpers
import {generateTimestamp} from '../helpers/index';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';

export function comment(text, username, timestamp) {
  return ((dispatch, getState) => {
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());

    dispatch({
      type: consts.ADD_COMMENT,
      userName: username,
      modifiedTimestamp: timestamp,
      gatewayLanguageCode,
      gatewayLanguageQuote,
      text
    });
  });
}

/**
 * Add a comment for the current check.
 * @param {String} text - comment text.
 * @param {String} username - Alias name.
 * @return {Object} New state for comment reducer.
 */
export const addComment = (text, username) => {
  return ((dispatch, getState) => {
    let state = getState();
    let contextId = state.contextIdReducer.contextId;
    dispatch(comment(text, username, generateTimestamp()));
    dispatch({
      type: consts.TOGGLE_COMMENTS_IN_GROUPDATA,
      contextId,
      text
    });
  });
};
