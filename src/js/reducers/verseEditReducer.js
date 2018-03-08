import consts from '../actions/ActionTypes';

const initialState = {
  verseBefore: null,
  verseAfter: null,
  tags: null,
  userName: null,
  modifiedTimestamp: null,
  gatewayLanguageCode: null,
  gatewayLanguageQuote: null
};

const verseEditReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_VERSE_EDIT:
      return {
        ...state,
        verseBefore: action.verseBefore,
        verseAfter: action.verseAfter,
        tags: action.tags,
        userName: action.userName,
        modifiedTimestamp: action.modifiedTimestamp,
        gatewayLanguageCode: action.gatewayLanguageCode,
        gatewayLanguageQuote: action.gatewayLanguageQuote
      };
    default:
      return state;
  }
};

export default verseEditReducer;
