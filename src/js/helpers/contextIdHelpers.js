// helpers
import * as selectionHelpers from './selectionHelpers';

/**
 * @description this action validates if the contextId is valid by checking to see if the quote occurrence exists
 * @param {object} state - current state to get the verse out of
 * @param {object} contextId - the contextId object.
 * @param {string} bibleId - the id/name of the bible to get the chapter/verse text to check for the string occurrences
 * @return {bool} returns if the contextId is valid.
 */
export const validateContextIdQuote = (state, contextId, bibleId) => {
  let valid = false
  if (contextId && bibleId) {
    const { chapter, verse } = contextId.reference;
    const { quote, occurrence } = contextId;
    const verseText = state.resourcesReducer.bibles[bibleId][chapter][verse];
    const occurrences = selectionHelpers.getQuoteOccurrencesInVerse(verseText, quote);
    valid = occurrence <= occurrences;
  }
  return valid;
}