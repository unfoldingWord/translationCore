import consts from '../actions/ActionTypes';

const initialState = {
  bibles: {},
  translationHelps: {},
  lexicons: {}
};

const resourcesReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_NEW_BIBLE_TO_RESOURCES:
      return {
        ...state,
        bibles: {
          ...state.bibles,
          [action.bibleName]: action.bibleData
        }
      };
    case consts.UPDATE_EDITED_TARGET_VERSE:
      return {
        ...state,
        bibles: {
          ...state.bibles,
          targetLanguage: {
            ...state.bibles.targetLanguage,
            [action.chapter]: {
              ...state.bibles.targetLanguage[action.chapter],
              [action.verse]: action.editedText
            }
          }
        }
      };
    case consts.ADD_TRANSLATIONHELPS_ARTICLE:
      return {
        ...state,
        translationHelps: {
          ...state.translationHelps,
          [action.resourceType]: {
            ...state.translationHelps[action.resourceType],
            [action.articleId]: action.articleData
          }
        }
      };
    case consts.ADD_LEXICON_ENTRY:
      return {
        ...state,
        lexicons: {
          ...state.lexicons,
          [action.lexiconId]: {
            ...state.lexicons[action.lexiconId],
            [action.entryId]: action.entryData
          }
        }
      };
    case consts.CLEAR_RESOURCES_REDUCER:
      return initialState;
    default:
      return state;
  }
};

export default resourcesReducer;
