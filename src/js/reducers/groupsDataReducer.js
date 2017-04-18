import consts from '../actions/CoreActionConsts';

const initialState = {
  groupsData: {},
  loadedFromFileSystem: false
};

const getToggledGroupData = (state, action, label) => {
  let groupData = state.groupsData[action.contextId.groupId]
  let groupObject = groupData.find(groupObject => {
    return groupObject.contextId === action.contextId
  })
  let index = groupData.indexOf(groupObject)
  switch (label) {
    case "comments":
      if (action.text.length > 0) {
        groupData[index][label] = true;
      } else {
        groupData[index][label] = false;
      }
      break;
    case "reminders":
      groupData[index][label] = !groupData[index][label];
      break;
    case "selections":
      if (action.selections.length > 0) {
        groupData[index][label] = true;
      } else {
        groupData[index][label] = false;
      }
      break;
    default:
      groupData[index][label] = true;
      break;
  }
  return groupData
}

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
        groupsData: action.allGroupsData,
        loadedFromFileSystem: true
      };
    case consts.TOGGLE_REMINDERS_IN_GROUPDATA:
      return {
        ...state,
        groupsData: {
          ...state.groupsData,
          [action.contextId.groupId]: getToggledGroupData(state, action, "reminders")
        }
      };
    case consts.TOGGLE_SELECTIONS_IN_GROUPDATA:
      return {
        ...state,
        groupsData: {
          ...state.groupsData,
          [action.contextId.groupId]: getToggledGroupData(state, action, "selections")
        }
      };
    case consts.TOGGLE_VERSE_EDITS_IN_GROUPDATA:
      return {
        ...state,
        groupsData: {
          ...state.groupsData,
          [action.contextId.groupId]: getToggledGroupData(state, action, "verseEdits")
        }
      };
    case consts.TOGGLE_COMMENTS_IN_GROUPDATA:
      return {
        ...state,
        groupsData: {
          ...state.groupsData,
          [action.contextId.groupId]: getToggledGroupData(state, action, "comments")
        }
      };
    default:
      return state;
  }
};

export default groupsDataReducer;
