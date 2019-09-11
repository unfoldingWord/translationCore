import isEqual from 'deep-equal';
import _ from 'lodash';
import consts from '../actions/ActionTypes';
import { getToggledGroupData } from '../helpers/getToggledGroupData';

const initialState = {
  groupsData: {},
  loadedFromFileSystem: false,
};

const groupsDataReducer = (state = initialState, action) => {
  switch (action.type) {
  case consts.ADD_GROUP_DATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.groupId]: action.groupsData,
      },
    };
  case consts.LOAD_GROUPS_DATA_FROM_FS:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        ...action.allGroupsData,
      },
      loadedFromFileSystem: true,
    };
  case consts.TOGGLE_REMINDERS_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.contextId.groupId]: getToggledGroupData(state, action, 'reminders'),
      },
    };
  case consts.SET_REMINDERS_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.contextId.groupId]: getToggledGroupData(state, action, 'reminders'),
      },
    };
  case consts.SET_INVALIDATION_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.contextId.groupId]: getToggledGroupData(state, action, 'invalidated'),
      },
    };
  case consts.TOGGLE_SELECTIONS_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.contextId.groupId]: getToggledGroupData(state, action, 'selections'),
      },
    };
  case consts.TOGGLE_VERSE_EDITS_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.contextId.groupId]: getToggledGroupData(state, action, 'verseEdits'),
      },
    };
  case consts.TOGGLE_MULTIPLE_VERSE_EDITS_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.groupId]: setMultipleVerseEdits(state, action),
      },
    };
  case consts.TOGGLE_COMMENTS_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.contextId.groupId]: getToggledGroupData(state, action, 'comments'),
      },
    };
  case consts.CLEAR_PREVIOUS_GROUPS_DATA:
    return initialState;
  default:
    return state;
  }
};

/**
 *
 * @param {Object} state
 * @param {{groupId:String, references:Array, type:String}} action
 * @return {*} updated group data for groupId
 */
function setMultipleVerseEdits(state, action) {
  let groupData = state.groupsData[action.groupId];

  if (!groupData) {
    return groupData;
  }

  const newGroupData = _.cloneDeep(groupData);

  for (let i = 0, l = action.references.length; i < l; i++) {
    const reference = action.references[i];

    for (let k = 0, lGD = newGroupData.length; k < lGD; k++) {
      const item = newGroupData[k];

      if (isEqual(item.contextId.reference, reference)) {
        item.verseEdits = true;
      }
    }
  }
  return newGroupData;
}

export const getGroupsData = (state) =>
  state.groupsData;

export default groupsDataReducer;
