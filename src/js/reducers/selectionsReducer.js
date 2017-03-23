import consts from '../actions/CoreActionConsts.js';

const initialState = {
  selection: [],
  userName: null,
  modifiedTimestamp: null
};

const selectionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_SELECTION:
      return Object.assign({}, state, {
        selection: action.selection,
        userName: action.userName,
        modifiedTimestamp: action.modifiedTimestamp
      });
    case consts.REMOVE_SELECTION:
      return Object.assign({}, state, {
        selection: [],
        userName: action.userName,
        modifiedTimestamp: action.modifiedTimestamp
      });
    default:
      return state;
  }
};

export default selectionsReducer;
