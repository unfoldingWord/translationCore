import consts from '../actions/CoreActionConsts';

/**
 * @description This action sends a group ID and full name to the group
 * indexes reducer.
 * @param {string} groupIndex - The object of group indecies
 * @return {object} action object.
 */
export const addGroupIndex = (groupIndex) => {
  return {
    type: consts.ADD_GROUP_INDEX,
    groupIndex
  };
};