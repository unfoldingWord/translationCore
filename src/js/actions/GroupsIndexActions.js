import consts from '../actions/CoreActionConsts';

/**
 * @description This action sends all of the group Ids and
 * group names to the groupsIndexReducer
 * @param {string} groupIndex - The object of group indecies
 * @return {object} action object.
 */
export const setGroupsIndex = (groupsIndex) => {
  //Alphabetize the groups order
  groupsIndex = groupsIndex.sort( (a, b) => {
    if(a.id.toUpperCase() < b.id.toUpperCase()){
      return -1;
    }
    if(a.id.toUpperCase() > b.id.toUpperCase()){
      return 1;
    }
    return 0;
  })

  return {
    type: consts.SET_GROUPS_INDEX,
    groupsIndex
  };
};
