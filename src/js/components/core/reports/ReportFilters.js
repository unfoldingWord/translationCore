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

/**
 * @description Gives the namespaces of all check modules.
 * @return {Array} checkCategories - An array of namespaces.
 ******************************************************************************/
function getListOfChecks() {
  let modulesFolder = path.join(__base, "modules");
  // get only the folders and make them absolute paths
  let modules = fs.readdirSync(modulesFolder);
  modules = modules.map(dir => path.join(modulesFolder, dir));
  modules = modules.filter(dir => fs.statSync(dir).isDirectory());
  let checkCategories = [];
  modules.forEach(dir => {
    var includesReportView = fs.readdirSync(dir).includes('ReportView.js');
    var includesManifest = fs.readdirSync(dir).includes('manifest.json')
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
 * @description This function refines the groups list by retained status
 * @param {Array} query - An array of retained status types to show.
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
  return refinedGroups;
}
exports.getListOfChecks = getListOfChecks;
exports.getGroups = getGroups;
exports.getStatuses = statusList;
exports.getRetained = retainedList;
exports.filter = {
  byGroup: filterByGroup,
  byStatus: filterByStatus,
  byRetained: filterByRetained,
  byComments: filterByComments,
  byProposed: filterByProposed,
  byCustom: filterByCustom
};
