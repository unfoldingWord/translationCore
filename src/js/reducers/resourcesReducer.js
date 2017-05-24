import consts from '../actions/CoreActionConsts';

const initialState = {
  bibles: {}
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
    case consts.ADD_NEW_RESOURCE:
      return {
        ...state,
        [action.resourceName]: action.resourceData
      };
    case consts.UPDATE_EDITED_TARGET_VERSE:
      state.bibles.targetLanguage[action.chapter][action.verse] = action.editedText;
      return state;
    case consts.CLEAR_RESOURCES_REDUCER:
      return initialState;
    default:
      return state;
  }
};

export default resourcesReducer;
