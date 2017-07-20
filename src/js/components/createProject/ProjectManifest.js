/**
 * @author Ian Hoegen
 * @description This module creates a project manifest.
 * @TODO: Move to utils instead of components
 ******************************************************************************/
import * as LoadHelpers from '../../helpers/LoadHelpers';
import {generateTimestamp} from '../../helpers/index';

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
  project: {
    id: '',
    name: ''
  },
  type: {
    id: '',
    name: ''
  },
  source_translations: [],
  translators: [],
  checkers: [],
  time_created: '',
  tools: [],
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
  projectManifest.time_created = generateTimestamp();
  if (data) {
    projectManifest.repo = data.repo;
  }
  for (var oldElements in tsManifest) {
    projectManifest[oldElements] = tsManifest[oldElements];
  }

  if (data && data.user) {
    for (var users in data.user) {
      var user = data.user[users];
      if (user) {
        projectManifest.checkers.push(user);
      }
    }
  }

  if (data && data.checkLocations) {
    for (var item in data.checkLocations) {
      var currentItem = data.checkLocations[item];
      projectManifest.tools.push(currentItem.name);
    }
  }
  try {
    if (tsManifest) {
      projectManifest.target_language = tsManifest.target_language;
      projectManifest.type = tsManifest.type;
      if (tsManifest.source_translations) {
        projectManifest.source_translations = tsManifest.source_translations;
      }
      projectManifest.project = tsManifest.project || tsManifest.project;
      if (projectManifest.project) {
        if (!projectManifest.project.name || projectManifest.project.name.length < 1) {
          projectManifest.project.name = LoadHelpers.convertToFullBookName(projectManifest.project.id);
        }
      }
      projectManifest.translators = tsManifest.translators;
      projectManifest.project_id = tsManifest.project_id;
    }
  } catch (e) {
    console.error(e);
  }

  return projectManifest;
}

module.exports = populate;
