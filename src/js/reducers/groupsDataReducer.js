import consts from '../actions/ActionTypes';
import {getToggledGroupData} from '../helpers/getToggledGroupData'

const initialState = {
  groupsData: {},
  loadedFromFileSystem: false
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
    case consts.SET_REMINDERS_IN_GROUPDATA:
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
    case consts.CLEAR_PREVIOUS_GROUPS_DATA:
      return initialState;
    default:
      return state;
  }
};

export default groupsDataReducer;
