import consts from '../actions/CoreActionConsts';

const initialState = {
  contextId: null
};

const contextIdReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.CHANGE_CURRENT_CONTEXT_ID:
      return Object.assign({}, state, {
        contextId: action.contextId
      });
    default:
      return state;
  }
};

export default contextIdReducer;
