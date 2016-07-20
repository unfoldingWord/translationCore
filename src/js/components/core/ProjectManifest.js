/**
 * @description This module creates a project manifest.
 ******************************************************************************/
const TimeStamp = require('./Timestamp').generate()[1];

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
  source: {
      original_language: '',
      gateway_language: '',
      target_language: '',
    },
  translators: [],
  checkers: [],
  time_created: '',
  last_saved : '',
  finished_chunks: [],
  checked_chunks: [],
  check_data_locations: []
}

/**
 * @description This function populates the template manifest with the data.
 * @param {json} data - The data to be fed to the template.
 * Sample data to be passed in:
 *   let data = {
 *    target_language: {filepath or url},
 *    original_language: {filepath or url},
 *    gateway_language: {filepath or url},
 *    user: [{username, email}],
 *    checkLocations: [{filepath}]
 *  }
 * @param {json=} tsManifest - A manifest from a Translation Studio project
 ******************************************************************************/
function populate (data, tsManifest) {
  var projectManifest = template;
  projectManifest.last_saved = TimeStamp;
  projectManifest.time_created = TimeStamp;
  projectManifest.source.target_language = data.target_language;
  projectManifest.source.original_language = data.original_language;
  projectManifest.source.gateway_language = data.gateway_language;
  for (user of data.user) {
    projectManifest.checkers.push(user);
  }
  for (checkLocation of data.checkLocations) {
    projectManifest.check_data_locations.push(checkLocation);
  }

  if (tsManifest) {
    projectManifest.target_language = tsManifest.target_language;
    projectManifest.type = tsManifest.type;
    projectManifest.ts_project = tsManifest.project;
    for (finishedChunk of tsManifest.finished_chunks) {
      projectManifest.finished_chunks.push(finishedChunk);
    }
    for (translator of tsManifest.translators) {
      projectManifest.translators.push(translator);
    }
  }
  return projectManifest;
}

module.exports = populate;
