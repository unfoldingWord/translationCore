import consts from '../actions/ActionTypes';

const initialState = {
  text: null,
  userName: null,
  modifiedTimestamp: null,
  gatewayLanguageCode: null,
  gatewayLanguageQuote: null
};

const commentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_COMMENT:
      return Object.assign({}, state, {
        text: action.text,
        userName: action.userName,
        modifiedTimestamp: action.modifiedTimestamp,
        gatewayLanguageCode: action.gatewayLanguageCode,
        gatewayLanguageQuote: action.gatewayLanguageQuote
      });
    default:
      return state;
  }
};

export default commentsReducer;
