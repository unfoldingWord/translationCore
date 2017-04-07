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
/**
 * @description this action changes the contextId to the first check.
 * @return {object} New state for contextId reducer.
 */
export const changeToFirstContextId = () => {
  return ((dispatch, getState) => {
    let state = getState()
    let {contextId} = state.contextIdReducer
    let {groupsIndex} = state.groupsIndexReducer
    let {groupsData} = state.groupsDataReducer
    if (!!groupsIndex && !!groupsData && !contextId) {
      let valid = false, i = 0
      while (!valid && i < groupsIndex.length-1) {
        let groupId = groupsIndex[i].id
        let groupData = groupsData[groupId]
        if (!!groupData && !!groupData[0]) contextId = groupData[0].contextId
        valid = !!contextId
      }
      debugger
      dispatch({
        type: consts.CHANGE_CURRENT_CONTEXT_ID,
        contextId
      })
      loadCheckData(dispatch);
    }
  })
}

export const changeToNextContextId = () => {
  return ((dispatch, getState) => {
    let state = getState()
    let {groupsData} = state.groupsDataReducer
    let {groupsIndex} = state.groupsIndexReducer
    let {contextId} = state.contextIdReducer
    let newGroupDataItem = shiftGroupDataItem(1, contextId, groupsData) // get the next groupDataItem
    if (newGroupDataItem === undefined) { // if it is undefined
      let newGroupIndex, newGroupData
      let valid = false, i = 1
      while (!valid && i < groupsIndex.length) { // if after getting the shifted groupIndex, it is still empty try again
        newGroupIndex = shiftGroupIndex(i, contextId, groupsIndex) // get the next groupIndex
        newGroupData = groupsData[newGroupIndex.id] // get the new groupData for next group
        valid = newGroupData !== undefined
        i += 1
      }
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
      let newGroupIndex, newGroupData
      let valid = false, i = -1
      while (!valid && -i < groupsIndex.length) { // if after getting the shifted groupIndex, it is still empty try again
        newGroupIndex = shiftGroupIndex(i, contextId, groupsIndex) // get the next groupIndex
        newGroupData = groupsData[newGroupIndex.id] // get the new groupData for next group
        valid = newGroupData !== undefined
        i -= 1
      }
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
