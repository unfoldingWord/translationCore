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
    default:
      return state;
  }
};

export default wordAlignmentReducer;
