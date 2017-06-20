import consts from './ActionTypes';

/**
 * @description This action sends all of the group Ids and
 * group names to the groupsIndexReducer
 * @param {string} groupIndex - The object of group indecies
 * @return {object} action object.
 */
export const loadGroupsIndex = (groupsIndex) => {
  return ((dispatch) => {
    // Alphabetize the groups order
    groupsIndex = groupsIndex.sort((a, b) => {
      if (a.id.toUpperCase() < b.id.toUpperCase()) {
        return -1;
      }
      if (a.id.toUpperCase() > b.id.toUpperCase()) {
        return 1;
      }
      return 0;
    })

    dispatch({
      type: consts.LOAD_GROUPS_INDEX,
      groupsIndex
    });
  });
};
