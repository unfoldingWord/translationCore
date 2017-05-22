import isEqual from 'lodash/isEqual'
/**
 * @description returns the toggled group data based on the key string name passed in.
 * @param {object} state - app store state.
 * @param {object} action - action objcet being dipatch by the action method.
 * @param {string} key - object key. ex. "comments", "reminders", "selections" or "verseEdits".
 * @return {object} returns the group data object which the key boolen toggled.
 */
export const getToggledGroupData = (state, action, key) => {
  let groupData = state.groupsData[action.contextId.groupId]
  if (groupData == undefined) return groupData
  let groupObject = groupData.find(groupObject => {
    return isEqual(groupObject.contextId, action.contextId)
  });
  let index = groupData.indexOf(groupObject)
  switch (key) {
    case "comments":
      if (action.text.length > 0) {
        groupData[index][key] = true;
      } else {
        groupData[index][key] = false;
      }
      break;
    case "reminders":
      if (action.boolean) {
        groupData[index][key] = action.boolean;
      } else {
        groupData[index][key] = !groupData[index][key];
      }
      break;
    case "selections":
      if (action.selections.length > 0) {
        groupData[index][key] = true;
      } else {
        groupData[index][key] = false;
      }
      break;
    default:
      groupData[index][key] = true;
      break;
  }
  return groupData;
};
