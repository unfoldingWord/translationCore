import consts from '../actions/CoreActionConsts';

const initialState = {
  groupsData: {}
};

const groupsDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_GROUP_DATA:
      return {
        ...state,
        groupsData:action.groupsData
      };
    default:
      return state;
  }
};

export default groupsDataReducer;
