import consts from '../actions/CoreActionConsts';

/**
 * @description This action adds a groupName as a property to the
 *  groups object and assigns payload as its value.
 * @param {string} groupName - groupName of object ex. figs_metaphor.
 * @param {array} groupData - array of objects containing group data.
 * @return {object} action object.
 */
export const addGroupData = (groupId, groupsData) => {
  return {
    type: consts.ADD_GROUP_DATA,
    groupId,
    groupsData
  };
};

export const loadGroupsDataFromFS = (allGroupsData) => {
  return {
    type: consts.LOAD_GROUPS_DATA_FROM_FS,
    allGroupsData
  }
}
