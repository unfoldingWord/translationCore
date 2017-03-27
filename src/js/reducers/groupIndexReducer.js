import consts from '../actions/CoreActionConsts';

const initialState = {
  groupIndex: []
};

const groupIndexReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_GROUP_INDEX: {
      return Object.assign({}, state, {
        groupIndex: action.groupIndex
      });
    }
    default:
      return state;
  }
};

export default groupIndexReducer;
