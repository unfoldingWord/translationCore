import isEqual from 'deep-equal';

export const shiftGroupIndex = (_shift, contextId, groupsIndex, groupsData=[], filters={}) => {
  const currentIndex = groupsIndex.findIndex( (groupIndex) => (groupIndex.id === contextId.groupId));
  let shiftedIndex = currentIndex + _shift;

  // Loop around until we get back to the current group or we find a visible group
  while (shiftedIndex !== currentIndex) {
    let newGroupData = groupsData[groupsIndex[shiftedIndex].id];

    if (filters && groupsData && (! newGroupData || ! groupIsVisible(newGroupData, filters))) {
      shiftedIndex += (_shift < 0 ? -1 : 1);

      if (shiftedIndex < 0) {
        shiftedIndex = groupsIndex.length-1;// don't go below zero, set index to last group
      } else if (shiftedIndex >= groupsIndex.length) {
        shiftedIndex = 0;
      } // don't go past the last, set index to first group
    } else {
      return groupsIndex[shiftedIndex];
    }
  }
  return groupsIndex[currentIndex]; // Didn't find a new group, so returning the current one
};

export const countFilters = (filters) => Object.keys(filters).filter(k=>filters[k]).length;

/**
 * @description - Determines if the item should be navigatable
 * @param {object} groupItemData
 * @returns {boolean}
 */
export const groupItemIsVisible = (groupItemData, filters) => (! countFilters(filters) ||
      ((filters.invalidated && groupItemData.invalidated)
        || (filters.reminders && groupItemData.reminders)
        || (filters.selections && groupItemData.selections)
        || (filters.noSelections && ! groupItemData.selections)
        || (filters.verseEdits && groupItemData.verseEdits)
        || (filters.comments && groupItemData.comments)
      ));

/**
 * @description - Determines if the group is navigatable based on filters
 * @param {object} groupData
 * @returns {boolean}
 */
export const groupIsVisible = (groupData, filters) => {
  if (! countFilters(filters)) {
    return true;
  }

  for (let groupItemData of groupData) {
    if (groupItemIsVisible(groupItemData, filters)) {
      return true;
    }
  }
  return false;
};

/**
 * @description - Returns all visible items in an array of group items
 * @param {*} groupData
 * @param {*} filters
 */
export const visibleGroupItems = (groupData, filters={}) => groupData.filter(item => groupItemIsVisible(item, filters));

export const shiftGroupDataItem = (_shift, contextId, groupsData, filters={}) => {
  let currentGroupData = groupsData[contextId.groupId];
  let currentGroupDataIndex = currentGroupData.findIndex( (groupItem) => isEqual(groupItem.contextId, contextId));
  let shiftedGroupDataIndex = currentGroupDataIndex + _shift;

  while (shiftedGroupDataIndex >= 0 && shiftedGroupDataIndex < currentGroupData.length) {
    if (! filters || groupItemIsVisible(currentGroupData[shiftedGroupDataIndex], filters)) {
      return currentGroupData[shiftedGroupDataIndex];
    } else {
      shiftedGroupDataIndex += (_shift < 0 ? -1 : 1);
    }
  }
  return undefined;
};
