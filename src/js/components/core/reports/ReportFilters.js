const api = window.ModuleApi;
const path = require('path');
const fs = require(window.__base + 'node_modules/fs-extra');
const statusList = ['FLAGGED', 'CORRECT', 'UNCHECKED'];
const retainedList = ['Replaced', 'Retained', ''];

function getListOfChecks() {
  let modulesFolder = path.join(__base, "modules");
  // get only the folders and make them absolute paths
  let modules = fs.readdirSync(modulesFolder);
  modules = modules.map((dir) => path.join(modulesFolder, dir));
  modules = modules.filter((dir) => fs.statSync(dir).isDirectory());
  let checkCategories = [];
  modules.forEach((dir) => {
    if(fs.readdirSync(dir).includes('ReportView.js') && fs.readdirSync(dir).includes('manifest.json')) {
      var manifest = require(path.join(dir, 'manifest.json'));
      checkCategories.push(manifest.name);
    }
  });
  return checkCategories;
}

function getGroups() {
  var checkCategories = getListOfChecks();
  var groups = [];
  checkCategories.map((category) => {
    var catObj = {name: category, groups: []};
    var catGroups = api.getDataFromCheckStore(category, 'groups');
    catGroups.map((group) => {
      catObj.groups.push(group.group);
    });
    groups.push(catObj);
  });
  return groups;
}


/**
 * @description This function refines the groups list by query
 * @param {Array} query - An array of group names to show.
 * @param {String} checkCategory - The name of the checkCategory.
 * @return {Array} refinedGroups - The new groups list, refiend by query.
 ******************************************************************************/
function filterByGroup(query, checkCategory) {
  var groups = api.getDataFromCheckStore(checkCategory, 'groups');
  if (query.length === 0) return groups;
  var refinedGroups = [];
  groups.map((group) => {
    if (query.includes(group.group)) {
      refinedGroups.push(group);
    }
  });
  return refinedGroups;
}

function filterByStatus(query, checkCategory){

}

function filterByRetained(query, checkCategory){

}

function filterByNotes(query, checkCategory) {

}

function filterByProposed(query, checkCategory) {

}
exports.getListOfChecks = getListOfChecks;
exports.getGroups = getGroups;
exports.getStatuses = statusList;
exports.getRetained = retainedList;
exports.filter = {
  byGroup: filterByGroup,
  byStatus: filterByStatus,
  byRetained: filterByRetained,
  byNotes: filterByNotes,
  byProposed: filterByProposed
}
