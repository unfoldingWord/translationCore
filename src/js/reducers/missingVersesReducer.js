import consts from '../actions/ActionTypes';
const initialState = {
  verses:[]
}
const missingVersesReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.MERGE_CONFLICTS_CHECK:
      return {
        ...state,
        verses: action.verses
      }
    default:
      return state
  }
}

export default missingVersesReducer;