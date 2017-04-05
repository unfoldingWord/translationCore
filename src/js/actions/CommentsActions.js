import consts from '../actions/CoreActionConsts';
import {generateTimestamp} from '../helpers/index';
/**
 * @description this action adds a comment to the current check.
 * @param {string} text - comment text.
 * @param {string} userName - Alias name.
 * @return {object} New state for comment reducer.
 */
export const addComment = (text, userName) => {
  return {
    type: consts.ADD_COMMENT,
    modifiedTimestamp: generateTimestamp(),
    text,
    userName
  };
};
