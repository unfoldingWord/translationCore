/**
 * @module Actions/ContextId
 */

import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import { shiftGroupIndex, shiftGroupDataItem, visibleGroupItems } from '../helpers/navigationHelpers';
// actions
import { loadComments, loadReminders, loadSelections, loadInvalidated } from './CheckDataLoadActions';
import { saveContextId } from '../helpers/contextIdHelpers';
import * as ResourcesActions from './ResourcesActions';
// constant declaration
const INDEX_DIRECTORY = path.join('.apps', 'translationCore', 'index');

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
  return ((dispatch, getState) => {
    dispatch({
      type: consts.CHANGE_CURRENT_CONTEXT_ID,
      contextId
    });
    if (contextId) {
      loadCheckData(dispatch);
      dispatch(ResourcesActions.loadBiblesChapter(contextId));
      let state = getState();
      saveContextId(state, contextId);
    }
  });
};
/**
 * @description this action changes the contextId to the first check.
 * @return {object} New state for contextId reducer.
 */
function firstContextId(state) {
  let contextId;
  let { groupsIndex } = state.groupsIndexReducer;
  let { groupsData } = state.groupsDataReducer;
  let groupsIndexEmpty = groupsIndex.length === 0;
  let groupsDataEmpty = Object.keys(groupsData).length === 0;
  if (!groupsIndexEmpty && !groupsDataEmpty) {
    let valid = false, i = 0;
    while (!valid && i < groupsIndex.length - 1) {
      let groupId = groupsIndex[i].id;
      let groupData = groupsData[groupId];
      if (!!groupData && !!groupData[0]) contextId = groupData[0].contextId;
      valid = (contextId?true:false);
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
    let { currentToolName } = state.toolsReducer;
    let bookId = manifest.project.id ? manifest.project.id : undefined;
    let fileName = "contextId.json";

    if (projectSaveLocation && currentToolName && bookId) {
      let contextId;
      try {
        let loadPath = path.join(projectSaveLocation, INDEX_DIRECTORY, currentToolName, bookId, "currentContextId", fileName);
        if (fs.existsSync(loadPath)) {
          contextId = fs.readJsonSync(loadPath);
        } else {
          contextId = firstContextId(state);
        }
        if (contextId) {
          dispatch(changeCurrentContextId(contextId));
        }
      } catch (err) {
        // The object is undefined because the file wasn't found in the directory
        console.warn(err);
      }
    }
  };
}
