import consts from './ActionTypes';
// helpers
import {generateTimestamp} from '../helpers/index';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';

/**
 * Edits a target bible verse.
 * @param {String} beforeEdit - Previous text version of the verse.
 * @param {String} afterEdit - New edited text version of the verse.
 * @param {Array} tags - Array of tags used for verse Edit check boxes.
 * @param {String} userName - Alias name.
 * @return {object} New state for verse Edit reducer.
 */
export const addVerseEdit = (verseBefore, verseAfter, tags, userName) => {
  return ((dispatch, getState) => {
    const contextId = getState().contextIdReducer.contextId;
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());

    dispatch({
      type: consts.ADD_VERSE_EDIT,
      verseBefore,
      verseAfter,
      userName,
      tags,
      gatewayLanguageCode,
      gatewayLanguageQuote,
      modifiedTimestamp: generateTimestamp()
    });
    dispatch(editTargetVerseInBiblesReducer(verseAfter));
    dispatch({
      type: consts.TOGGLE_VERSE_EDITS_IN_GROUPDATA,
      contextId
    });
  });
};

/**
 * Updates the verse for the target language bible in the reosurces reducer.
 * @param {String} editedText - new edited version of the verse.
 * @return {object} action object to be handle by the reducer.
 */
export function editTargetVerseInBiblesReducer(editedText) {
  return ((dispatch, getState) => {
    let {contextIdReducer} = getState();
    let {chapter, verse} = contextIdReducer.contextId.reference;
    dispatch({
      type: consts.UPDATE_EDITED_TARGET_VERSE,
      editedText,
      chapter,
      verse
    });
  });
}
