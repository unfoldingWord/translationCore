import consts from '../actions/ActionTypes';

const initialState = {
  invalidated: false,
  userName: null,
  modifiedTimestamp: null,
  gatewayLanguageCode: null,
  gatewayLanguageQuote: null
};

const invalidatedReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SET_INVALIDATED:
      return {
        ...state,
        userName: action.userName,
        modifiedTimestamp: action.modifiedTimestamp,
        gatewayLanguageCode: action.gatewayLanguageCode,
        gatewayLanguageQuote: action.gatewayLanguageQuote,
        invalidated: action.invalidated
      };
    default:
      return state;
  }
};

export default invalidatedReducer;
