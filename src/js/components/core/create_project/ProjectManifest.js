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
  if (tsManifest.package_version == '3') {
    return fixManifestVerThree(tsManifest);
  }
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

function fixManifestVerThree(oldManifest){
  var newManifest = {};
  for (var oldElements in oldManifest) {
    newManifest[oldElements] = oldManifest[oldElements];
  }
  newManifest.finished_chunks = oldManifest.finished_frames;
  newManifest.ts_project = {};
  newManifest.ts_project.id = oldManifest.project_id;
  newManifest.ts_project.name = api.convertToFullBookName(oldManifest.project_id);
  for(var el in oldManifest.source_translations) {
    newManifest.source_translations = oldManifest.source_translations[el];
    var parameters = el.split("-");
    newManifest.source_translations.language_id = parameters[1];
    newManifest.source_translations.resource_id = parameters[2];
    break;
  }
  return newManifest;

}

module.exports = populate;
