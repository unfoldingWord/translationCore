import consts from '../actions/CoreActionConsts';

const initialState = {
  groups: {}
};

const groupDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_GROUP_DATA:
      return {
        ...state,
        groups: {
          ...state.groups,
          [action.groupName]: action.groupData
        }
      };
    default:
      return state;
  }
};

export default groupDataReducer;
