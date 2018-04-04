import types from '../actions/ActionTypes';

const initialState = {
  verseBefore: null,
  verseAfter: null,
  tags: null,
  userName: null,
  modifiedTimestamp: null,
  gatewayLanguageCode: null,
  gatewayLanguageQuote: null,
  reference: {
    bookId: null,
    chapter: null,
    verse: null
  }
};

const verseEditReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.ADD_VERSE_EDIT:
      return {
        ...state,
        verseBefore: action.before,
        verseAfter: action.after,
        tags: action.tags,
        userName: action.username,
        modifiedTimestamp: action.modifiedTimestamp,
        gatewayLanguageCode: action.gatewayLanguageCode,
        gatewayLanguageQuote: action.gatewayLanguageQuote,
        reference: {
          bookId: action.reference.bookId,
          chapter: action.reference.chapter,
          verse: action.reference.verse
        }
      };
    default:
      return state;
  }
};

export default verseEditReducer;

/**
 * Returns a form of the state formatted for saving to the disk.
 * @param {object} state - the state slice
 * @param {string} toolName - the name of the tool performing the save.
 * @return {*}
 */
export const getSaveStructure = (state, toolName) => {
  const obj = {
    ...state,
    contextId: {
      reference: state.reference,
      tool: toolName,
      groupId: `chapter_${state.reference.chapter}`
    }
  };
  delete obj.reference;
  return obj;
};
