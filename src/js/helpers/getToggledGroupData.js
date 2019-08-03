import isEqual from 'deep-equal';

/**
 * search groupData to find matching contextId
 * @param {object} contextId
 * @param {Array} groupData
 * @return {number}
 */
export const findGroupDataItem = (contextId, groupData) => {
  let index = -1;
  for (let i = 0, l = groupData.length; i < l; i++) {
    if (isEqual(groupData[i].contextId, contextId)) {
      index = i;
      break;
    }
  }
  return index;
};

/**
 * @description returns the toggled group data based on the key string name passed in.
 * @param {object} state - app store state.
 * @param {object} action - action object being dispatch by the action method.
 * @param {string} key - object key. ex. "comments", "reminders", "selections" or "verseEdits".
 * @return {object} returns the group data object which the key boolean toggled.
 */
export const getToggledGroupData = (state, action, key) => {
  let groupData = state.groupsData[action.contextId.groupId];
  if (groupData == undefined) return groupData;
  const index = findGroupDataItem(action.contextId, groupData);
  const oldGroupObject = (index >= 0) ? groupData[index] : null;
  if (oldGroupObject) {
    groupData = [...groupData]; // create new array from old one (shallow copy)
    let groupObject = {...oldGroupObject}; // create new object from old one (shallow copy)
    groupData[index] = groupObject; // replace original object
    switch (key) {
      case "comments":
        if (action.text.length > 0) {
          groupObject[key] = true;
        } else {
          groupObject[key] = false;
        }
        break;
      case "invalidated":
        if (action.boolean) {
          groupObject[key] = true;
        } else {
          groupObject[key] = false;
        }
        break;
      case "reminders":
        if (action.boolean) {
          groupObject[key] = action.boolean;
        } else {
          groupObject[key] = !groupData[index][key];
        }
        break;
      case "selections":
        if (action.selections.length > 0) {
          groupObject[key] = action.selections; // we save the selections for quick invalidation checking
          groupObject['nothingToSelect'] = !!action.nothingToSelect;
        } else {
          groupObject[key] = null;
          groupObject['nothingToSelect'] = !!action.nothingToSelect;
        }
        break;
      default:
        groupObject[key] = true;
        break;
    }
  }
  return groupData;
};
