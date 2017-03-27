import consts from '../actions/CoreActionConsts';

/**
 * @description This action sends a group ID and full name to the group
 * indexes reducer.
 * @param {string} groupName - full name of a group (i.e "Hyperbole")
 * @param {object} groupId - short "slug" representing the name
 * (i.e "figs_hyperbole")
 * @return {object} action object.
 */
export const addGroupIndex = (groupId, groupName) => {
  return {
    type: consts.ADD_GROUP_INDEX,
    groupName,
    groupId
  };
};