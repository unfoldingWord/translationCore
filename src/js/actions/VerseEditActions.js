import types from './ActionTypes';
// helpers
import {generateTimestamp} from '../helpers/index';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';
import {resetVerseAlignments, showResetAlignmentsDialog} from './WordAlignmentLoadActions';
import {getPopulatedVerseAlignments, getUsername} from '../selectors';
import {validateSelections} from "./SelectionsActions";

/**
 * Records an edit to the currently selected verse in the target bible.
 *
 * @deprecated use {@link editTargetVerse} instead.
 *
 * @param {string} before - Previous text version of the verse.
 * @param {string} after - New edited text version of the verse.
 * @param {string[]} tags - Array of tags used for verse Edit check boxes.
 * @param {string} [username=null] - The user's alias. If null the current username will be used.
 * @return {*}
 */
export const editSelectedTargetVerse = (before, after, tags, username=null) => {
  return (dispatch, getState) => {
    const contextId = getState().contextIdReducer.contextId;
    let {chapter, verse} = contextId.reference;
    dispatch(editTargetVerse(chapter, verse, before, after, tags, username));
  };
};

/**
 * Updates a verse in the target bible.
 * This thunk will record the edit to the disk and update the target bible resource.
 *
 * @param {int} chapter
 * @param {int} verse
 * @param {string} before - the verse text before the edit
 * @param {string} after - the verse text after the edit
 * @param {string[]} tags - an array of tags indicating the reason for the edit
 * @param {string} [username=null] - The user's alias. If null the current username will be used.
 */
export const editTargetVerse = (chapter, verse, before, after, tags, username=null) => {
  return async (dispatch, getState) => {
    const {
      contextIdReducer
    } = getState();
    const {contextId} = contextIdReducer;
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());

    let {bookId} = contextId.reference;

    // fallback to the current username
    let userAlias = username;
    if(userAlias === null) {
      userAlias = getUsername(getState());
    }

    dispatch(validateSelections(after, contextId));
    dispatch(recordTargetVerseEdit(bookId, chapter, verse, before, after, tags, userAlias, generateTimestamp(), gatewayLanguageCode, gatewayLanguageQuote));
    dispatch(updateTargetVerse(chapter, verse, after));
    dispatch({
      type: types.TOGGLE_VERSE_EDITS_IN_GROUPDATA,
      contextId: {
        ...contextId,
        reference: {
          ...contextId.reference,
          chapter,
          verse
        }
      }
    });
    // reset alignments if there are any
    const alignments = getPopulatedVerseAlignments(getState(), chapter, verse);
    if(alignments.length) {
      await dispatch(showResetAlignmentsDialog());
      dispatch(resetVerseAlignments(bookId, chapter, verse));
    }
  };
};

/**
 * Records an edit to a verse in the target language bible.
 * This will result in the verse text being written to the disk.
 * This is closely related to {@link updateTargetVerse}.
 *
 * @param {string} book - the id of the book receiving the edit
 * @param {int} chapter - the chapter receiving the edit
 * @param {int} verse - the verse that was edited
 * @param {string} before - the verse text before the edit
 * @param {string} after - the verse text after the edit
 * @param {string[]} tags - an array of tags indicating the reason for the edit
 * @param {string} username - the current user's username
 * @param {string} modified - the edit timestamp
 * @param {string|null} [glCode=null] - the gateway language code
 * @param {string|null} [glQuote=null] - the gateway language code
 * @return {*}
 */
export const recordTargetVerseEdit = (book, chapter, verse, before, after, tags, username, modified, glCode=null, glQuote=null) => ({
  type: types.ADD_VERSE_EDIT,
  before,
  after,
  tags,
  username,
  modifiedTimestamp: modified,
  gatewayLanguageCode: glCode,
  gatewayLanguageQuote: glQuote,
  reference: {
    bookId: book,
    chapter: parseInt(chapter),
    verse: parseInt(verse)
  }
});

/**
 * Updates the verse text in the target language bible resource.
 * This will not write any changes to the disk.
 * @param {int} chapter
 * @param {int} verse
 * @param {string} text
 * @return {*}
 */
export const updateTargetVerse = (chapter, verse, text) => ({
  type: types.UPDATE_TARGET_VERSE,
  editedText: text,
  chapter,
  verse
});
