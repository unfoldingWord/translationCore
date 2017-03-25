import consts from '../actions/CoreActionConsts';

/**
 * @description This action adds a groupName as a property to the
 *  groups object and assigns payload as its value.
 * @param {string} groupName - groupName of object ex. figs_metaphor.
 * @param {object} payload - object containing group data.
 * @return {object} action object.
 */
export const addGroupData = (groupName, payload) => {
  return {
    type: consts.ADD_GROUP_DATA,
    groupName,
    payload
  };
};
