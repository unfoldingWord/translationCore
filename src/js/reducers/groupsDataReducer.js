import consts from '../actions/CoreActionConsts';

const initialState = {
  groupsData: {}
};

const groupsDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_GROUP_DATA:
      let groupData = state.groupsData[action.groupId]
      if (groupData === undefined) groupData = []
      groupData.push(action.groupData)

      return {
        ...state,
        groupsData: {
          ...state.groupsData,
          [action.groupId]: groupData
        }
      };
    default:
      return state;
  }
};

export default groupsDataReducer;
