/**
 * @description This action sorts groupsIndex
 * @param {string} groupsIndex - The object of group indecies
 * @return {array} - groupsIndex
 */
export const sortGroupsIndex = (groupsIndex) => {
  // Alphabetize the groups order
  const _groupsIndex = groupsIndex.sort((a, b) => {
    // try to sort on the number
    if (a.id.match(/\d+/) && b.id.match(/\d+/)) { // if both contain digits
      if (a.id.replace(/\d+/,'') === b.id.replace(/\d+/,'')) { // if string is the same other than digits
        return parseInt(a.id.replace(/[^\d]+/,'')) - parseInt(b.id.replace(/[^\d]+/,'')); // sort on the number
      }
    }
    if (a.id.toUpperCase() < b.id.toUpperCase()) {
      return -1;
    }
    if (a.id.toUpperCase() > b.id.toUpperCase()) {
      return 1;
    }
    return 0;
  });
  return _groupsIndex;
};
