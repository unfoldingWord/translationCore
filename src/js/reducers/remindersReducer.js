import consts from '../actions/ActionTypes';

const initialState = {
  enabled: false,
  userName: null,
  modifiedTimestamp: null
};

const remindersReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_REMINDER:
      return {
        ...state,
        enabled: !state.enabled,
        userName: action.userName,
        modifiedTimestamp: action.modifiedTimestamp
      };
    case consts.SET_REMINDER:
      return {
        ...state,
        enabled: action.enabled,
        userName: action.userName,
        modifiedTimestamp: action.modifiedTimestamp
      };
    default:
      return state;
  }
};

export default remindersReducer;
