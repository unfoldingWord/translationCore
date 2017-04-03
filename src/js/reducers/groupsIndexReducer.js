import consts from '../actions/CoreActionConsts';

const initialState = {
  groupIndex: []
};

const groupsIndexReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_GROUPS_INDEX: {
      return Object.assign({}, state, {
        groupsIndex: action.groupsIndex
      });
    }
    default:
      return state;
  }
};

export default groupsIndexReducer;
