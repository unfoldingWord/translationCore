import consts from './CoreActionConsts'
import {shiftGroupIndex, shiftGroupDataItem} from '../helpers/navigationHelpers'
import {loadComments, loadReminders, loadSelections, loadVerseEdit} from './checkDataLoadActions'


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
    })
    loadCheckData(dispatch);
  });
}

export const changeToNextContextId = () => {
  return ((dispatch, getState) => {
    let state = getState()
    let {groupsData} = state.groupsDataReducer
    let {groupsIndex} = state.groupsIndexReducer
    let {contextId} = state.contextIdReducer
    let newGroupDataItem = shiftGroupDataItem(1, contextId, groupsData) // get the next groupDataItem
    if (newGroupDataItem === undefined) { // if it is undefined
      let newGroupIndex = shiftGroupIndex(1, contextId, groupsIndex) // get the next groupIndex
      let newGroupData = groupsData[newGroupIndex.id] // get the new groupData for next group
      newGroupDataItem = newGroupData[0] // get the first one since we're incrementing 1
    }
    contextId = newGroupDataItem.contextId
    dispatch({
      type: consts.CHANGE_CURRENT_CONTEXT_ID,
      contextId
    })
    loadCheckData(dispatch);
  })
}

export const changeToPreviousContextId = () => {
  return ((dispatch, getState) => {
    let state = getState()
    let {groupsData} = state.groupsDataReducer
    let {groupsIndex} = state.groupsIndexReducer
    let {contextId} = state.contextIdReducer
    let newGroupDataItem = shiftGroupDataItem(-1, contextId, groupsData) // get the next groupDataItem
    if (newGroupDataItem === undefined) { // if it is undefined
      let newGroupIndex = shiftGroupIndex(-1, contextId, groupsIndex) // get the next groupIndex
      let newGroupData = groupsData[newGroupIndex.id] // get the new groupData for next group
      newGroupDataItem = newGroupData[newGroupData.length-1] // get the first one since we're incrementing 1
    }
    contextId = newGroupDataItem.contextId
    dispatch({
      type: consts.CHANGE_CURRENT_CONTEXT_ID,
      contextId
    })
    loadCheckData(dispatch);
  })
}
