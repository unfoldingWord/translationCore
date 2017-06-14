import consts from '../actions/ActionTypes';

const initialState = {
  contextId: null
};

const contextIdReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.CHANGE_CURRENT_CONTEXT_ID:
      return Object.assign({}, state, {
        contextId: action.contextId
      });
    case consts.CLEAR_CONTEXT_ID:
      return initialState;
    default:
      return state;
  }
};

export default contextIdReducer;
