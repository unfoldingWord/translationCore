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

/**
 * Returns the selections.
 * This needs a better description. What are selections?
 * @param {object} state the selections slice of the state object
 */
export const getSelections = (state) =>
  state.selections;
