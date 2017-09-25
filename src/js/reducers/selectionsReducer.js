import consts from '../actions/ActionTypes';

const initialState = {
  selections: [],
  userName: null,
  modifiedTimestamp: null
};

const selectionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.CHANGE_SELECTIONS:
      return {
        ...state,
        selections: action.selections,
        userName: action.userName,
        modifiedTimestamp: action.modifiedTimestamp
      };
    default:
      return state;
  }
};

export default selectionsReducer;
