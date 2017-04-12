import consts from '../actions/CoreActionConsts';

const initialState = {
  groupsData: {},
  loadedFromFileSystem:false
};

const groupsDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_GROUP_DATA:
      return {
        ...state,
        groupsData: {
          ...state.groupsData,
          [action.groupId]: action.groupsData
        }
      };
    case consts.LOAD_GROUPS_DATA_FROM_FS:
      return {
        ...state,
        groupsData:action.allGroupsData,
        loadedFromFileSystem: true
      }
      break;
    default:
      return state;
  }
};

export default groupsDataReducer;
