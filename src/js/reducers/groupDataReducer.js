import consts from '../actions/CoreActionConsts';

const initialState = {
  groups: {}
};

const groupDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_GROUP_DATA: {
      let groups = state.groups;
      groups[action.groupName] = action.groupData;
      return Object.assign({}, state, {
        groups: groups
      });
    }
    default:
      return state;
  }
};

export default groupDataReducer;
