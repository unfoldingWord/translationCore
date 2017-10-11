import consts from '../actions/ActionTypes';

const initialState = {
  alignmentData: {}
};

const wordAlignmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.UPDATE_ALIGNMENT_DATA:
      return {
        ...state,
        alignmentData: action.alignmentData
      };
    case consts.CLEAR_ALIGNMENT_DATA:
      return initialState;
    default:
      return state;
  }
};

export default wordAlignmentReducer;
