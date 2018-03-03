/**
 * @module Actions/GroupsIndex
 */

import consts from './ActionTypes';

/**
 * @description This action sends all of the group Ids and
 * group names to the groupsIndexReducer
 * @param {string} groupIndex - The object of group indecies
 * @return {object} action object.
 */
export const loadGroupsIndex = (groupsIndex) => {
  return ((dispatch) => {
    dispatch({
      type: consts.LOAD_GROUPS_INDEX,
      groupsIndex
    });
  });
};
