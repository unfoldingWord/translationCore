import consts from '../actions/CoreActionConsts';

/**
 * @description This action adds a groupName as a property to the
 *  groups object and assigns payload as its value.
 * @param {string} groupName - groupName of object ex. figs_metaphor.
 * @param {array} groupData - array of objects containing group data.
 * @return {object} action object.
 */
export const addGroupData = (groupName, groupData) => {
  return {
    type: consts.ADD_GROUP_DATA,
    groupName,
    groupData
  };
};
