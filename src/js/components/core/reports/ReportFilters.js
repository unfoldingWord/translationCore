/**
 * @author Ian Hoegen
 * These functions allow the ability to get a list of all the groups,
 * the name of possible checks, and methods to filter.
**/
const api = window.ModuleApi;
const path = require('path');
const fs = require(window.__base + 'node_modules/fs-extra');
const statusList = ['FLAGGED', 'CORRECT', 'UNCHECKED'];
const retainedList = ['Replaced', 'Retained', ''];
const pathex = require('path-extra');

const PARENT = pathex.datadir('translationCore')
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled')

/**
 * @description Gives the namespaces of all check modules.
 * @return {Array} checkCategories - An array of namespaces.
 ******************************************************************************/
function getListOfChecks() {
  let modulesFolder = PACKAGE_COMPILE_LOCATION;
  // get only the folders and make them absolute paths
  let modules = fs.readdirSync(modulesFolder);
  modules = modules.map(dir => path.join(modulesFolder, dir));
  modules = modules.filter(dir => fs.statSync(dir).isDirectory());
  let checkCategories = [];
  modules.forEach(dir => {
    var includesReportView = fs.readdirSync(dir).includes('ReportView.js');
    var includesManifest = fs.readdirSync(dir).includes('manifest.json');
    if (includesReportView && includesManifest) {
      var manifest = require(path.join(dir, 'manifest.json'));
      checkCategories.push(manifest.name);
    }
  });
  return checkCategories;
}
/**
 * @description Gives the store of all check modules.
 * @return {Array} groups - An array of group names.
 ******************************************************************************/
function getGroups() {
  var checkCategories = getListOfChecks();
  var groups = [];
  checkCategories.map(category => {
    var catObj = {name: category, groups: []};
    var catGroups = api.getDataFromCheckStore(category, 'groups');
    catGroups.map(group => {
      catObj.groups.push(group.group);
    });
    groups.push(catObj);
  });
  return groups;
}
/**
 * @description This function refines the groups list by group name.
 * @param {Array} query - An array of group names to show.
 * @param {Array} store - The check store.
 * @return {Array} refinedGroups - The new groups list, refined by query.
 ******************************************************************************/
function filterByGroup(query, store) {
  if (query.length === 0) return store;
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
  if (query.length === 0) return store;
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
  if (query.length === 0) return store;
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
  if (query.length === 0) return store;
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
  if (query.length === 0) return store;
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
  if (query.length === 0) return store;
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
function getChapters() {
  var targetLang = window.ModuleApi.getDataFromCommon("targetLanguage");
  return Object.getOwnPropertyNames(targetLang);
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
  listOfChecks: getListOfChecks,
  groups: getGroups,
  statusList: statusList,
  retainedList: retainedList,
  chapters: getChapters
}
exports.searchText = searchText
