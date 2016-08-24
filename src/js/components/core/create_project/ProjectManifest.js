/**
 * @author Ian Hoegen
 * @description This module creates a project manifest.
 ******************************************************************************/
const TimeStamp = require('./Timestamp').generate()[1];
const api = window.ModuleApi;

var template = {
  generator: {
    name: 'tc-desktop',
    build: ''
  },
  target_language: {
    id: '',
    name: '',
    direction: ''
  },
  ts_project: {
    id: '',
    name: ''
  },
  type: {
    id: '',
    name: ''
  },
  translators: [],
  checkers: [],
  time_created: '',
  check_modules: [],
  repo: ''
};

/**
 * @description This function populates the template manifest with the data.
 * @param {json} data - The data to be fed to the template.
 * Sample data to be passed in:
 *   let data = {
 *    local: {boolean}
 *    target_language: {filepath or url},
 *    original_language: {filepath or url},
 *    gateway_language: {filepath or url},
 *    user: [{username, email}],
 *    checkLocations: [{filepath}]
 *  }
 * @param {json=} tsManifest - A manifest from a Translation Studio project
 * @return {json} projectManifest - A TC project manifest
 ******************************************************************************/
function populate(data, tsManifest) {
  var projectManifest = template;
  projectManifest.time_created = TimeStamp;
  projectManifest.repo = data.repo;

  for (var user of data.user) {
    if(user) {
      user.token = undefined;
      user.avatar_url = undefined;
      user.id = undefined;
      projectManifest.checkers.push(user);
    }
  }

  if (data.checkLocations) {
    for (item in data.checkLocations) {
      var currentItem = data.checkLocations[item];
      projectManifest.check_modules.push(currentItem.name);
    }
  }

  if (tsManifest) {
    projectManifest.target_language = tsManifest.target_language;
    projectManifest.type = tsManifest.type;
    projectManifest.ts_project = tsManifest.project;
    for (var translator of tsManifest.translators) {
      projectManifest.translators.push(translator);
    }
  }
  return projectManifest;
}

module.exports = populate;
