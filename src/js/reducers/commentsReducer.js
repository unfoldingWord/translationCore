import consts from '../actions/ActionTypes';

const initialState = {
  text: null,
  userName: null,
  activeBook: null,
  activeChapter: null,
  activeVerse: null,
  modifiedTimestamp: null,
  gatewayLanguageCode: null,
  gatewayLanguageQuote: null,
};

const commentsReducer = (state = initialState, action) => {
  switch (action.type) {
  case consts.ADD_COMMENT:
    return Object.assign({}, state, {
      text: action.text,
      userName: action.userName,
      activeBook: action.activeBook,
      activeChapter: action.activeChapter,
      activeVerse: action.activeVerse,
      modifiedTimestamp: action.modifiedTimestamp,
      gatewayLanguageCode: action.gatewayLanguageCode,
      gatewayLanguageQuote: action.gatewayLanguageQuote,
    });
  default:
    return state;
  }
};

export default commentsReducer;
