import consts from '../actions/ActionTypes';

const initialState = {
  invalidated: false,
  userName: null,
  modifiedTimestamp: null,
  gatewayLanguageCode: null,
  gatewayLanguageQuote: null,
  invalidatedChecksTotal: null,
  verseEditsTotal: null,
  invalidatedAlignmentsTotal: null,
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
      invalidated: action.invalidated,
    };
  case consts.SET_INVALIDATED_CHECKS_TOTAL:
    return {
      ...state,
      invalidatedChecksTotal: action.invalidatedChecksTotal,
    };
  case consts.SET_INVALIDATED_ALIGNMENTS_TOTAL:
    return {
      ...state,
      invalidatedAlignmentsTotal: action.invalidatedAlignmentsTotal,
    };
  case consts.SET_VERSE_EDITS_TOTAL:
    return {
      ...state,
      verseEditsTotal: action.verseEditsTotal,
    };
  default:
    return state;
  }
};

export default invalidatedReducer;
