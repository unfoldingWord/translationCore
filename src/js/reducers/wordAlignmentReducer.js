import consts from '../actions/ActionTypes';

const initialState = {
  alignmentData: {},
  wordBank: {}
}

const wordAlignmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_ALIGNMENT_DATA_FOR_CURRENT_CHAPTER:
      return {
        ...state,
        alignmentData: {
          [action.chapter]: action.payload
        }
      }
    default:
      return state
  }
}

export default wordAlignmentReducer;
