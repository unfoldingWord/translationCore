import consts from '../actions/CoreActionConsts';

const initialState = {
  groupIndex: {}
};

const groupIndexReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_GROUP_INDEX: {
      let groupIndex = state.groupIndex;
      groupIndex.push({
          "id": action.groupId,
          "name": action.groupName
      });
      return Object.assign({}, state, {
        groupIndex: groupIndex
      });
    }
    default:
      return state;
  }
};

export default groupIndexReducer;
