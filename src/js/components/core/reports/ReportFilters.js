/**
 * @author Ian Hoegen
 * These functions allow the ability to get a list of all the groups,
 * the name of possible checks, and methods to filter.
**/
const api = window.ModuleApi;
const statusList = ['FLAGGED', 'CORRECT', 'UNCHECKED'];
const retainedList = ['Replaced', 'Retained', ''];

/**
 * @description This function refines the groups list by group name.
 * @param {Array} query - An array of group names to show.
 * @param {Array} store - The check store.
 * @return {Array} refinedGroups - The new groups list, refined by query.
 ******************************************************************************/
function filterByGroup(query, store) {
  if (!query || query.length === 0 || !store) return store;
  var refinedGroups = [];
  store.map(group => {
    if (query.includes(group.group)) {
      refinedGroups.push(group);
    }
  });
  return refinedGroups;
}
/**
 * @description This function refines the groups list by status
 * @param {Array} query - An array of status types to show.
 * @param {Array} store - The check store.
 * @return {Array} refinedGroups - The new groups list, refined by query.
 ******************************************************************************/
function filterByStatus(query, store) {
  if (!query || query.length === 0 || !store) return store;
  var refinedGroups = [];
  store.map(group => {
    var defaultGroup = {checks: [], group: group.group};
    group.checks.map(checks => {
      if (query.includes(checks.checkStatus)) {
        defaultGroup.checks.push(checks);
      }
    });
    if (defaultGroup.checks.length > 0) {
      refinedGroups.push(defaultGroup);
    }
  });
  return refinedGroups;
}

/**
 * @description This function refines the groups list by wheter or not it has comments
 * @param {boolean} query - Whether the check contains comments.
 * @param {Array} store - The check store.
 * @return {Array} refinedGroups - The new groups list, refined by query.
 ******************************************************************************/
function filterByComments(query, store) {
  if (!store) return store;
  var refinedGroups = [];
  store.map(group => {
    var defaultGroup = {checks: [], group: group.group};
    group.checks.map(checks => {
      if ((query && checks.comment) || (!query && !checks.comment)) {
        defaultGroup.checks.push(checks);
      }
    });
    if (defaultGroup.checks.length > 0) {
      refinedGroups.push(defaultGroup);
    }
  });
  return refinedGroups;
}
/**
 * @description This function refines the groups list by wheter or not it has comments
 * @param {boolean} query - Whether the check contains proposed changes.
 * @param {Array} store - The name of the check category.
 * @return {Array} refinedGroups - The new groups list, refined by query.
 ******************************************************************************/
function filterByProposed(query, store) {
  if (!store) return store;
  var refinedGroups = [];
  store.map(group => {
    var defaultGroup = {checks: [], group: group.group};
    group.checks.map(checks => {
      if ((query && checks.proposedChanges) || (!query && !checks.proposedChanges)) {
        defaultGroup.checks.push(checks);
      }
    });
    if (defaultGroup.checks.length > 0) {
      refinedGroups.push(defaultGroup);
    }
  });
  return refinedGroups;
}
/**
 * @description This function allows filtration via multiple parameters.
 * @param {Object} query - Whether the check contains proposed changes.
 * Sample of query:
 * {
 *    group: {Array}
 *    status: {Array}
 *    retained: {Array}
 *    comments: {Boolean}
 *    proposed: {Boolean}
 *    search: {String}
 *    chapter: {Array of integers}
 *    verse: {Array of integers}
 * }
 * @param {Array} store - The check store being passed in.
 * @return {Array} refinedGroups - The new groups list, refined by query.
 ******************************************************************************/
function filterByCustom(query, store) {
  if (!store || !query) {return store;}
  var refinedGroups = store;
  if (query.group) refinedGroups = filterByGroup(query.group, refinedGroups);
  if (query.status) refinedGroups = filterByStatus(query.status, refinedGroups);
  if (query.retained) refinedGroups = filterByRetained(query.retained, refinedGroups);
  if (query.comments !== undefined) refinedGroups = filterByComments(query.comments, refinedGroups);
  if (query.proposed !== undefined) refinedGroups = filterByProposed(query.proposed, refinedGroups);
  if (query.chapter) refinedGroups = filterByChapter(query.chapter, refinedGroups);
  if (query.verse) refinedGroups = filterByVerse(query.verse, refinedGroups);
  if (query.search) refinedGroups = filterBySearchTerm(query.search, refinedGroups);
  return refinedGroups;
}
/**
 * @description This searches for words and pharses
 * @param {String} query - The word or phrase to search for
 * @param {Array} store - The name of the check category.
 * @return {Array} refinedGroups - The new groups list, refined by query.
 ******************************************************************************/
function filterBySearchTerm(query, store) {
  if (!query || query.length === 0 || !store) return store;
  var refinedGroups = [];
  store.map(group => {
    var defaultGroup = {checks: [], group: group.group};
    group.checks.map(checks => {
      var lowerCaseQuery = query.toLowerCase();
      if ((checks.comment && ~checks.comment.toLowerCase().indexOf(lowerCaseQuery)) || (checks.proposedChanges && ~checks.proposedChanges.toLowerCase().indexOf(lowerCaseQuery))) {
        defaultGroup.checks.push(checks);
      }
    });
    if (defaultGroup.checks.length > 0) {
      refinedGroups.push(defaultGroup);
    }
  });
  return refinedGroups;
}
/**
 * @description This searches for words and pharses in text.
 * @param {String} query - The word or phrase to search for
 * @param {Object} text - Scripture, in the same object format as targetLanguage
 * @return {Array} refinedText - The Scripture that has verses containing query
 ******************************************************************************/
function searchText(query, text) {
  if (!query || query.length === 0) {return text};
  var refinedText = {};
  for (var chapter in text) {
    for (var verse in text[chapter]) {
      var currentVerse = text[chapter][verse];
      if(~currentVerse.toLowerCase().indexOf(query.toLowerCase())) {
        refinedText[chapter] = refinedText[chapter] || {};
        refinedText[chapter][verse] = currentVerse
      }
    }
  }
  return refinedText;
}
/**
 * @description This function refines the groups list by retain status.
 * @param {Array} query - An array of integers, containing the retain stastus to show.
 * @param {Array} store - The check store.
 * @return {Array} refinedGroups - The new groups list, refined by query.
 ******************************************************************************/
function filterByRetained(query, store) {
  if (!query || query.length === 0 || !store) return store;
  var refinedGroups = [];
  store.map(group => {
    var defaultGroup = {checks: [], group: group.group};
    group.checks.map(checks => {
      if (query.includes(checks.retained)) {
        defaultGroup.checks.push(checks);
      }
    });
    if (defaultGroup.checks.length > 0) {
      refinedGroups.push(defaultGroup);
    }
  });
  return refinedGroups;
}
/**
 * @description This function refines the groups list by chapters.
 * @param {Array} query - An array of integers, containing the chapters to show.
 * @param {Array} store - The check store.
 * @return {Array} refinedGroups - The new groups list, refined by query.
 ******************************************************************************/
function filterByChapter(query, store) {
  if (!query || query.length === 0 || !store) return store;
  var refinedGroups = [];
  store.map(group => {
    var defaultGroup = {checks: [], group: group.group};
    group.checks.map(checks => {
      if (query.includes(checks.chapter)) {
        defaultGroup.checks.push(checks);
      }
    });
    if (defaultGroup.checks.length > 0) {
      refinedGroups.push(defaultGroup);
    }
  });
  return refinedGroups;
}
/**
 * @description This function refines the groups list by verse.
 * @param {Array} query - An array of integers, containing the verses to show.
 * @param {Array} store - The check store.
 * @return {Array} refinedGroups - The new groups list, refined by query.
 ******************************************************************************/
function filterByVerse(query, store) {
  if (!query || query.length === 0 || !store) return store;
  var refinedGroups = [];
  store.map(group => {
    var defaultGroup = {checks: [], group: group.group};
    group.checks.map(checks => {
      if (query.includes(checks.verse)) {
        defaultGroup.checks.push(checks);
      }
    });
    if (defaultGroup.checks.length > 0) {
      refinedGroups.push(defaultGroup);
    }
  });
  return refinedGroups;
}
/**
 * @description Gets the chapters that are included in the target language.
 * @return {Array} targetLang - An array of strings, that denote chapter numbers.
 ******************************************************************************/
function getChapters(targetLang) {
  return Object.getOwnPropertyNames(targetLang);
}

function getStatusList() {
  return statusList;
}

function getRetainedList() {
  return retainedList;
}

exports.filter = {
  byGroup: filterByGroup,
  byStatus: filterByStatus,
  byRetained: filterByRetained,
  byComments: filterByComments,
  byProposed: filterByProposed,
  byCustom: filterByCustom,
  bySearchTerm: filterBySearchTerm,
  byChapter: filterByChapter,
  byVerse: filterByVerse
};
exports.get = {
  statusList: getStatusList,
  retainedList: getRetainedList,
  chapters: getChapters
}
exports.searchText = searchText
