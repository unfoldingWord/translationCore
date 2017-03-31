import consts from '../actions/CoreActionConsts.js';

const initialState = {
  selections: [],
  userName: null,
  modifiedTimestamp: null
};

const selectionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.CHANGE_SELECTIONS:
      return Object.assign({}, state, {
        selections: action.selections,
        userName: action.userName,
        modifiedTimestamp: action.modifiedTimestamp
      });
    default:
      return state;
  }
};

export default selectionsReducer;
