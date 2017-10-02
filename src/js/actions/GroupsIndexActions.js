import consts from './ActionTypes';
// helpers
import * as groupsIndexHelpers from '../helpers/groupsIndexHelpers';
/**
 * @description This action sends all of the group Ids and
 * group names to the groupsIndexReducer
 * @param {string} groupIndex - The object of group indecies
 * @return {object} action object.
 */
export const loadGroupsIndex = (_groupsIndex) => {
  return ((dispatch) => {
    const groupsIndex = groupsIndexHelpers.sortGroupsIndex(_groupsIndex);
    dispatch({
      type: consts.LOAD_GROUPS_INDEX,
      groupsIndex
    });
  });
};
