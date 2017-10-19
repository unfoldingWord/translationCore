import fs from 'fs-extra';
import path from 'path';
// helpers
import * as selectionHelpers from './selectionHelpers';
// constants
const INDEX_DIRECTORY = path.join('.apps', 'translationCore', 'index');

/**
 * @description this action validates if the contextId is valid by checking to see if the quote occurrence exists
 * @param {object} state - current state to get the verse out of
 * @param {object} contextId - the contextId object.
 * @param {String} bibleId - the id/name of the bible to get the chapter/verse text to check for the string occurrences
 * @return {bool} returns if the contextId is valid.
 */
export const validateContextIdQuote = (state, contextId, bibleId) => {
  let valid = false;
  if (contextId && bibleId && contextId.quote) {
    const { chapter, verse } = contextId.reference;
    const { quote, occurrence } = contextId;
    const verseText = state.resourcesReducer.bibles[bibleId][chapter][verse];
    const occurrences = selectionHelpers.getQuoteOccurrencesInVerse(verseText, quote);
    valid = occurrence <= occurrences;
  }
  if (!contextId.quote) valid = true;
  return valid;
};

/**
 * @description saves the contextId data.
 * @param {object} state - store state object.
 */
export const saveContextId = (state, contextId) => {
  try {
    let {projectSaveLocation} = state.projectDetailsReducer;
    let currentToolName = contextId ? contextId.tool : undefined;
    let bookId = contextId ? contextId.reference.bookId : undefined;
    if (projectSaveLocation && currentToolName && bookId) {
      let fileName = "contextId.json";
      let savePath = path.join(projectSaveLocation, INDEX_DIRECTORY, currentToolName, bookId, "currentContextId", fileName);
      fs.outputJsonSync(savePath, contextId);
    } else {
      // saveCurrentContextId: missing required data
    }
  } catch (err) {
    console.warn(err);
  }
};
