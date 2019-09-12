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
export const loadGroupsIndex = (groupsIndex) => ((dispatch) => {
  dispatch({
    type: consts.LOAD_GROUPS_INDEX,
    groupsIndex,
  });
});

export const updateRefreshCount = () => ((dispatch) => {
  dispatch({ type: consts.UPDATE_REFRESH_COUNT_GROUPS_INDEX });
});
