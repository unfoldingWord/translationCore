import consts from '../actions/ActionTypes';
const initialState = {
  conflicts: null,
  filePath: null,
};

const mergeConflictReducer = (state = initialState, action) => {
  switch (action.type) {
  case consts.MERGE_CONFLICTS_CHECK:
    return {
      ...state,
      conflicts: action.conflicts,
      filePath: action.filePath,
    };
  case consts.CLEAR_MERGE_CONFLICTS_REDUCER:
    return initialState;
  default:
    return state;
  }
};

export default mergeConflictReducer;
