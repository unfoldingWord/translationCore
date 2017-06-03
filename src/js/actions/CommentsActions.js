import consts from './ActionTypes';
// helpers
import {generateTimestamp} from '../helpers/index';

/**
 * @description this action adds a comment to the current check.
 * @param {string} text - comment text.
 * @param {string} userName - Alias name.
 * @return {object} New state for comment reducer.
 */
export const addComment = (text, userName) => {
  return ((dispatch, getState) => {
    let state = getState()
    let contextId = state.contextIdReducer.contextId
    dispatch({
      type: consts.ADD_COMMENT,
      modifiedTimestamp: generateTimestamp(),
      text,
      userName
    });
    dispatch({
      type: consts.TOGGLE_COMMENTS_IN_GROUPDATA,
      contextId,
      text
    });
  });
};
