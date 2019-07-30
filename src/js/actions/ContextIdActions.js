/**
 * @module Actions/ContextId
 */

import consts from './ActionTypes';
import fs from 'fs-extra';
// helpers
import { shiftGroupIndex, shiftGroupDataItem, visibleGroupItems } from '../helpers/navigationHelpers';
// actions
import { loadComments, loadReminders, loadSelections, loadInvalidated } from './CheckDataLoadActions';
import {getContextIdPathFromIndex, saveContextId} from '../helpers/contextIdHelpers';
import {
  getSelectedToolName,
  getGroupsIndex,
  getGroupsData,
  getProjectSaveLocation,
  getToolsByKey
} from "../selectors";
import Repo from "../helpers/Repo";

/**
 * TODO: tool data should eventually move into the respective tools.
 * @param dispatch
 */
function loadCheckData(dispatch) {
  dispatch(loadComments());
  dispatch(loadReminders());
  dispatch(loadSelections());
  dispatch(loadInvalidated());
}

/**
 * @description this action changes the contextId to the current check.
 * @param {object} contextId - the contextId object.
 * @return {object} New state for contextId reducer.
 */
export const changeCurrentContextId = contextId => {
  return async (dispatch, getState) => {
    dispatch({
      type: consts.CHANGE_CURRENT_CONTEXT_ID,
      contextId
    });
    if (contextId) {
      loadCheckData(dispatch);
      let state = getState();
      saveContextId(state, contextId);
      const apis = getToolsByKey(state);
      const {reference: {chapter, verse} } = contextId;
      for (var toolName in apis) {
        apis[toolName].api.trigger('validateVerse', chapter, verse, null, getGroupsData(state));
      }
      // commit project changes
      const projectDir = getProjectSaveLocation(getState());
      try {
        try {
          console.log("changeCurrentContextId() - setting new contextId to: " + JSON.stringify(contextId));
        } catch(e) { console.log("changeCurrentContextId() - setting new contextId") }
        const repo = await Repo.open(projectDir, getState().loginReducer.userdata);
        let refStr = "unknown";
        if (contextId) {
          const {reference: {bookId, chapter, verse}} = contextId;
          refStr = `${bookId} ${chapter}:${verse}`;
        }
        const saveStarted = await repo.saveDebounced(`Auto saving at ${refStr}`);
        if (!saveStarted) {
          console.log(`Saving already running, skipping save after ${refStr}`);
        }
      } catch(e) {
        console.error(`Failed to auto save`, contextId, e);
      }
    }
  };
};
/**
 * @description this action changes the contextId to the first check.
 * @return {object} New state for contextId reducer.
 */
function firstContextId(state) {
  let contextId;
  const groupsIndex = getGroupsIndex(state);
  const groupsData = getGroupsData(state);
  let groupsIndexEmpty = groupsIndex.length === 0;
  let groupsDataEmpty = Object.keys(groupsData).length === 0;
  if (!groupsIndexEmpty && !groupsDataEmpty) {
    let valid = false, i = 0;
    while (!valid && i < groupsIndex.length - 1 || i === 0) {
      let groupId = groupsIndex[i].id;
      let data = groupsData[groupId];
      if (!!data && !!data[0]) contextId = data[0].contextId;
      valid = (contextId ? true : false);
      i++;
    }
    return contextId;
  }
}

export const changeToNextContextId = () => {
  return ((dispatch, getState) => {
    let state = getState();
    let { groupsData } = state.groupsDataReducer;
    let { filters } = state.groupMenuReducer;
    let { groupsIndex } = state.groupsIndexReducer;
    let { contextId } = state.contextIdReducer;
    let nextGroupDataItem = shiftGroupDataItem(1, contextId, groupsData, filters); // get the next groupDataItem
    if (nextGroupDataItem === undefined) { // if it is undefined
      // End of the items in the group, need first of next group
      const nextGroupIndex = shiftGroupIndex(1, contextId, groupsIndex, groupsData, filters);
      if (nextGroupIndex !== undefined) {
        const nextGroupData = groupsData[nextGroupIndex.id]; // get the new groupData for previous group
        const visibleItems = visibleGroupItems(nextGroupData, filters);
        if (visibleItems.length) {
          contextId = visibleItems.shift().contextId;
        }
      }
    } else {
      contextId = nextGroupDataItem.contextId;
    }
    dispatch(changeCurrentContextId(contextId));
  });
};

export const changeToPreviousContextId = () => {
  return ((dispatch, getState) => {
    let state = getState();
    let { groupsData } = state.groupsDataReducer;
    let { filters } = state.groupMenuReducer;
    let { groupsIndex } = state.groupsIndexReducer;
    let { contextId } = state.contextIdReducer;
    let prevGroupDataItem = shiftGroupDataItem(-1, contextId, groupsData, filters); // get the prev groupDataItem
    if (prevGroupDataItem === undefined) { // if it is undefined
      // End of the items in the group, need first of previous group
      const prevGroupIndex = shiftGroupIndex(-1, contextId, groupsIndex, groupsData, filters);
      if (prevGroupIndex !== undefined) {
        const prevGroupData = groupsData[prevGroupIndex.id]; // get the new groupData for previous group
        const visibleItems = visibleGroupItems(prevGroupData, filters);
        if (visibleItems.length) {
          contextId = visibleItems.pop().contextId;
        }
      }
    } else {
      contextId = prevGroupDataItem.contextId;
    }
    dispatch(changeCurrentContextId(contextId));
  });
};

/**
 * @description loads the latest contextId file from the file system.
 * @return {object} Dispatches an action that loads the contextId with data.
 */
export function loadCurrentContextId() {
  return (dispatch, getState) => {
    let state = getState();
    let { projectSaveLocation, manifest } = state.projectDetailsReducer;
    let { groupsIndex } = state.groupsIndexReducer;
    const toolName = getSelectedToolName(state);
    let bookId = manifest.project.id ? manifest.project.id : undefined;

    if (projectSaveLocation && toolName && bookId) {
      let contextId = {};
      try {
        let loadPath = getContextIdPathFromIndex(projectSaveLocation, toolName, bookId);
        if (fs.existsSync(loadPath)) {
          contextId = fs.readJsonSync(loadPath);
          const contextIdExistInGroups = groupsIndex.filter(({id}) => id === contextId.groupId).length > 0;
          if (contextId && contextIdExistInGroups) {
            return dispatch(changeCurrentContextId(contextId));
          }
        }
        contextId = firstContextId(state);
        dispatch(changeCurrentContextId(contextId));
      } catch (err) {
        // The object is undefined because the file wasn't found in the directory
        console.warn(err);
      }
    }
  };
}
