import consts from '../actions/CoreActionConsts';
import {generateTimestamp} from '../helpers/index';

/**
 * @description This action updates or adds the data needed to
 * @param {string} before - Previous text version of the verse.
 * @param {string} after - New edited text version  of the verse.
 * @param {array} tags - Array of tags used for verse Edit check boxes.
 * @param {string} userName - Alias name.
 * @return {object} New state for verse Edit reducer.
 */
export const addVerseEdit = (before, after, tags, userName) => {
  return {
    type: consts.ADD_VERSE_EDIT,
    before,
    after,
    tags,
    userName,
    modifiedTimestamp: generateTimestamp()
  };
};
