import isEqual from 'deep-equal';
/**
 * @description returns the toggled group data based on the key string name passed in.
 * @param {object} state - app store state.
 * @param {object} action - action objcet being dipatch by the action method.
 * @param {string} key - object key. ex. "comments", "reminders", "selections" or "verseEdits".
 * @return {object} returns the group data object which the key boolean toggled.
 */
export const getToggledGroupData = (old_state, action, key) => {
  const state = JSON.parse(JSON.stringify(old_state));
  let groupData = state.groupsData[action.contextId.groupId];
  if (groupData == undefined) return groupData;
  const index = groupData.findIndex(groupObject => {
    return isEqual(groupObject.contextId, action.contextId);
  });
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
        } else {
          groupObject[key] = null;
        }
        break;
      default:
        groupObject[key] = true;
        break;
    }
  }
  return groupData;
};
