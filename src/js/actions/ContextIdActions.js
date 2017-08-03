import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import { shiftGroupIndex, shiftGroupDataItem } from '../helpers/navigationHelpers';
import * as contextIdHelpers from '../helpers/contextIdHelpers';
// actions
import { loadComments, loadReminders, loadSelections, loadVerseEdit } from './CheckDataLoadActions';
import { saveContextId } from '../utils/saveMethods';
import * as ResourcesActions from './ResourcesActions';
// constant declaration
const INDEX_DIRECTORY = path.join('.apps', 'translationCore', 'index');

function loadCheckData(dispatch) {
  dispatch(loadComments());
  dispatch(loadReminders());
  dispatch(loadSelections());
  dispatch(loadVerseEdit());
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
      const isValidContextId = contextIdHelpers.validateContextIdQuote(state, contextId, 'ulb');
      if (isValidContextId) {
        saveContextId(state, contextId);
      } else {
        dispatch(changeToNextContextId());
      }
    }
  });
}
/**
 * @description this action changes the contextId to the first check.
 * @return {object} New state for contextId reducer.
 */
function firstContextId(state) {
  let contextId;
  let { groupsIndex } = state.groupsIndexReducer
  let { groupsData } = state.groupsDataReducer
  let groupsIndexEmpty = groupsIndex.length === 0;
  let groupsDataEmpty = Object.keys(groupsData).length === 0;
  if (!groupsIndexEmpty && !groupsDataEmpty) {
    let valid = false, i = 0
    while (!valid && i < groupsIndex.length - 1) {
      let groupId = groupsIndex[i].id
      let groupData = groupsData[groupId]
      if (!!groupData && !!groupData[0]) contextId = groupData[0].contextId
      valid = !!contextId
      i++;
    }
    return contextId
  }
}

/**
 * @description this action changes the contextId to the last check.
 * @return {object} New state for contextId reducer.
 */
function lastContextId(state) {
  let contextId;
  let { groupsIndex } = state.groupsIndexReducer
  let { groupsData } = state.groupsDataReducer
  let groupsIndexEmpty = groupsIndex.length === 0;
  let groupsDataEmpty = Object.keys(groupsData).length === 0;
  if (!groupsIndexEmpty && !groupsDataEmpty) {
    let valid = false;
    let i = groupsIndex.length - 1;
    while (!valid && i > 0) {
      let groupId = groupsIndex[i].id
      let groupData = groupsData[groupId]
      if (!!groupData && !!groupData[0]) contextId = groupData[0].contextId
      valid = !!contextId
      i--;
    }
    return contextId
  }
}
export const changeToNextContextId = () => {
  return ((dispatch, getState) => {
    let state = getState()
    let { groupsData } = state.groupsDataReducer
    let { groupsIndex } = state.groupsIndexReducer
    let { contextId } = state.contextIdReducer
    let newGroupDataItem = shiftGroupDataItem(1, contextId, groupsData) // get the next groupDataItem
    if (newGroupDataItem === undefined) { // if it is undefined
      //End of the groups index object, need first index loaded
      var currentGroupIndex = Object.keys(groupsData).findIndex((groupIndex) => {
        return (groupIndex === contextId.groupId)
      })
      if (currentGroupIndex + 1 > Object.keys(groupsData).length - 1)
        contextId = firstContextId(state);

      else {
        //Next index object in array list needs to be loaded
        let newGroupIndex, newGroupData
        let valid = false, i = 1
        while (!valid && i < groupsIndex.length) { // if after getting the shifted groupIndex, it is still empty try again
          newGroupIndex = shiftGroupIndex(i, contextId, groupsIndex) // get the next groupIndex
          newGroupData = groupsData[newGroupIndex.id] // get the new groupData for next group
          valid = newGroupData !== undefined
          i += 1
        }
        newGroupDataItem = newGroupData[0] // get the first one since we're incrementing 1
        contextId = newGroupDataItem.contextId
      }
    } else {
      contextId = newGroupDataItem.contextId
    }
    dispatch(changeCurrentContextId(contextId));
  })
}

export const changeToPreviousContextId = () => {
  return ((dispatch, getState) => {
    let state = getState()
    let { groupsData } = state.groupsDataReducer
    let { groupsIndex } = state.groupsIndexReducer
    let { contextId } = state.contextIdReducer
    let newGroupDataItem = shiftGroupDataItem(-1, contextId, groupsData) // get the next groupDataItem
    if (newGroupDataItem === undefined) { // if it is undefined
      //Beginning of the groups index object, need last index loaded
      var currentGroupIndex = Object.keys(groupsData).findIndex((groupIndex) => {
        return (groupIndex === contextId.groupId)
      })
      if (currentGroupIndex - 1 < 0)
        contextId = lastContextId(state);
      else {
        let newGroupIndex, newGroupData
        let valid = false, i = -1
        while (!valid && -i < groupsIndex.length) { // if after getting the shifted groupIndex, it is still empty try again
          newGroupIndex = shiftGroupIndex(i, contextId, groupsIndex) // get the next groupIndex
          newGroupData = groupsData[newGroupIndex.id] // get the new groupData for next group
          valid = newGroupData !== undefined
          i -= 1
        }
        newGroupDataItem = newGroupData[newGroupData.length - 1] // get the first one since we're incrementing 1
        contextId = newGroupDataItem.contextId
      }
    } else {
      contextId = newGroupDataItem.contextId
    }
    dispatch(changeCurrentContextId(contextId));
  })
}
/**
 * @description loads the latest contextId file from the file system.
 * @return {object} Dispatches an action that loads the contextId with data.
 */
export function loadCurrentContextId() {
  return (dispatch, getState) => {
    let state = getState();
    let { projectSaveLocation, params } = state.projectDetailsReducer
    let { currentToolName } = state.toolsReducer
    let bookId = params ? params.bookAbbr : undefined
    let fileName = "contextId.json"

    if (projectSaveLocation && currentToolName && bookId) {
      let contextId
      try {
        let loadPath = path.join(projectSaveLocation, INDEX_DIRECTORY, currentToolName, bookId, "currentContextId", fileName)
        if (fs.existsSync(loadPath)) {
          contextId = fs.readJsonSync(loadPath)
        } else {
          contextId = firstContextId(state)
        }
        if (contextId) {
          dispatch(changeCurrentContextId(contextId));
        }
      } catch (err) {
        // The object is undefined because the file wasn't found in the directory
        console.warn(err)
      }
    }
  }
}
