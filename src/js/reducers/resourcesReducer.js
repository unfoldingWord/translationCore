import consts from '../actions/ActionTypes';
import * as Bible from '../common/BooksOfTheBible';
import { OWNER_SEPARATOR } from 'tc-source-content-updater/lib/helpers/apiHelpers';

const initialState = {
  bibles: {},
  translationHelps: {},
  lexicons: {},
};

const resourcesReducer = (state = initialState, action) => {
  switch (action.type) {
  case consts.ADD_NEW_BIBLE_TO_RESOURCES:
    // eslint-disable-next-line no-case-declarations
    const languageAndOwner = action.owner ? `${action.languageId}${OWNER_SEPARATOR}${action.owner}` : action.languageId;
    return {
      ...state,
      bibles: {
        ...state.bibles,
        [languageAndOwner]: {
          ...state.bibles[languageAndOwner],
          [action.bibleId]: action.bibleData,
        },
      },
    };
  case consts.UPDATE_TARGET_VERSE:
    return {
      ...state,
      bibles: {
        ...state.bibles,
        targetLanguage: {
          targetBible: {
            ...state.bibles.targetLanguage.targetBible,
            [action.chapter]: {
              ...state.bibles.targetLanguage.targetBible[action.chapter],
              [action.verse]: action.editedText,
            },
          },
        },
      },
    };
  case consts.ADD_TRANSLATIONHELPS_ARTICLE:
    return {
      ...state,
      translationHelps: {
        ...state.translationHelps,
        [action.resourceType]: {
          ...state.translationHelps[action.resourceType],
          [action.articleId]: action.articleData,
        },
      },
    };
  case consts.ADD_LEXICON_ENTRY:
    return {
      ...state,
      lexicons: {
        ...state.lexicons,
        [action.lexiconId]: {
          ...state.lexicons[action.lexiconId],
          [action.entryId]: action.entryData,
        },
      },
    };
  case consts.CLEAR_RESOURCES_REDUCER:
    return initialState;
  default:
    return state;
  }
};

export default resourcesReducer;

/**
 * Returns a verse in the target language bible
 * @param state
 * @param {number} chapter - the chapter number
 * @param {number} verse - the verse number
 * @return {*}
 */
export const getTargetVerse = (state, chapter, verse) => {
  const targetChapter = getTargetChapter(state, chapter);

  if (targetChapter) {
    return targetChapter[verse + ''];
  } else {
    return null;
  }
};

/**
 * Returns a chapter in the target language bible
 * @param state
 * @param {number} chapter - the chapter number
 */
export const getTargetChapter = (state, chapter) => state.bibles.targetLanguage.targetBible[chapter + ''];

/**
 * Returns the target language book
 * @param state
 * @returns {*}
 */
export const getTargetBook = state => state.bibles.targetLanguage && state.bibles.targetLanguage.targetBible;

/**
 * Returns the source language book
 * @param state
 * @returns {object}
 */
export const getSourceBook = state => state.bibles.originalLanguage && (state.bibles.originalLanguage[Bible.NT_ORIG_LANG_BIBLE] ||
    state.bibles.originalLanguage[Bible.OT_ORIG_LANG_BIBLE]);

/**
 * Returns a verse in the original language bible
 * @param state
 * @param {number} chapter - the chapter number
 * @param {number} verse - the verse number
 * @return {*}
 */
export const getOriginalVerse = (state, chapter, verse) => {
  const originalChapter = getOriginalChapter(state, chapter);

  if (originalChapter) {
    return originalChapter[verse + ''];
  } else {
    return null;
  }
};

/**
 * Returns a chapter in the original language bible
 * @param state
 * @param {number} chapter - the chapter number
 * @return {*}
 */
export const getOriginalChapter = (state, chapter) => {
  const sourceBible = getSourceBook(state);
  return sourceBible && sourceBible[chapter + ''];
};

/**
 * Returns the bibles object
 * @param state
 * @returns {*}
 */
export const getBibles = state => state.bibles;

/**
 * Returns the manifest for the source language book.
 * @param state
 * @returns {object}
 */
export const getSourceBookManifest = state => {
  const sourceBible = getSourceBook(state);
  return sourceBible && sourceBible.manifest;
};
