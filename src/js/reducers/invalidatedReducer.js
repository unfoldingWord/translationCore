import consts from '../actions/ActionTypes';

const initialState = {
  enabled: false,
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
        enabled: action.enabled,
        userName: action.userName,
        modifiedTimestamp: action.modifiedTimestamp,
        gatewayLanguageCode: action.gatewayLanguageCode,
        gatewayLanguageQuote: action.gatewayLanguageQuote
      };
    default:
      return state;
  }
};

export default invalidatedReducer;
