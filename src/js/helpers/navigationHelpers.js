import isEqual from 'lodash/isEqual'

export const shiftGroupIndex = (_shift, contextId, groupsIndex) => {
  let currentIndex = groupsIndex.findIndex( (groupIndex) => {
    return (groupIndex.id === contextId.groupId)
  })
  let shiftedIndex = currentIndex + _shift
  if (shiftedIndex < 0) shiftedIndex = groupsIndex.length-1 // don't go below zero, return the last
  if (shiftedIndex > groupsIndex.length-1) shiftedIndex = 0 // don't go past the last, return the first
  return groupsIndex[shiftedIndex]
}

export const shiftGroupDataItem = (_shift, contextId, groupsData) => {
  let currentGroupData = groupsData[contextId.groupId]
  let currentGroupDataIndex = currentGroupData.findIndex( (groupItem) => {
    return isEqual(groupItem.contextId, contextId)
  })
  let shiftedGroupDataIndex = currentGroupDataIndex + _shift
  if (shiftedGroupDataIndex >= 0 && shiftedGroupDataIndex <= currentGroupData.length-1) {
    let groupDataItem = currentGroupData[shiftedGroupDataIndex]
    return groupDataItem
  } else {
    return undefined
  }
}
