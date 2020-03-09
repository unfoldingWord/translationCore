import path from 'path';
import fs from 'fs-extra';
import { getQuoteOccurrencesInVerse } from 'selections';
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
    const occurrences = getQuoteOccurrencesInVerse(verseText, quote);
    valid = occurrence <= occurrences;
  }

  if (!contextId.quote) {
    valid = true;
  }
  return valid;
};

/**
 * find path in index for current contextId
 * @param {String} projectSaveLocation
 * @param {String} toolName
 * @param {String} bookId
 * @return {*}
 */
export function getContextIdPathFromIndex(projectSaveLocation, toolName, bookId) {
  return path.join(projectSaveLocation, INDEX_DIRECTORY, toolName, bookId, 'currentContextId', 'contextId.json');
}

/**
 * Writes the context id to the disk.
 * @param {object} state - store state object.
 * @param {object} contextId
 */
export const saveContextId = (state, contextId) => {
  try {
    let { projectSaveLocation } = state.projectDetailsReducer;
    let toolName = contextId ? contextId.tool : undefined;
    let bookId = contextId ? contextId.reference.bookId : undefined;

    if (projectSaveLocation && toolName && bookId) {
      let savePath = getContextIdPathFromIndex(projectSaveLocation, toolName, bookId);
      fs.outputJson(savePath, contextId, { spaces: 2 });
    } else {
      // saveCurrentContextId: missing required data
    }
  } catch (err) {
    console.warn(err);
  }
};

/**
 * make sure context IDs are for same verse.  Optimized over isEqual()
 * @param {Object} contextId1
 * @param {Object} contextId2
 * @return {boolean} returns true if context IDs are for same verse
 */
export function isSameVerse(contextId1, contextId2) {
  return (contextId1.reference.chapter === contextId2.reference.chapter) &&
    (contextId1.reference.verse === contextId2.reference.verse);
}
