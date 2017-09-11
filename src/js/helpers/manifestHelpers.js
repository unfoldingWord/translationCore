/* eslint-disable no-console */
import path from 'path-extra';
import fs from 'fs-extra';
//helpers
import {generateTimestamp} from './TimestampGenerator';
import * as bibleHelpers from './bibleHelpers';

let template = {
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
export function generateManifest(currentUsers, repo, tsManifest) {
  let projectManifest = JSON.parse(JSON.stringify(template));
  projectManifest.time_created = generateTimestamp();
  if (repo) {
    projectManifest.repo = repo;
  }
  for (let oldElements in tsManifest) {
    projectManifest[oldElements] = tsManifest[oldElements];
  }

  if (currentUsers) {
    for (let users in currentUsers) {
      let user = currentUsers[users];
      if (user) {
        projectManifest.checkers.push(user);
      }
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
          projectManifest.project.name = bibleHelpers.convertToFullBookName(projectManifest.project.id);
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


/**
 * @description - Generates and saves a translationCore manifest file
 * @param {string} projectSaveLocation - Filepath of where the translationCore manifest file will
 * be saved. Must be an ABSOLUTE PATH
 * @param {object} tsManifest - The translationStudio manifest data loaded from a translation
 * studio project
 */
export function setUpManifest(projectSaveLocation, link, oldManifest, user) {
  debugger;
  let manifest;
  try {
    let manifestLocation = path.join(projectSaveLocation, 'manifest.json');
    if (oldManifest.package_version == '3') {
      //some older versions of ts-manifest have to be tweaked to work
      manifest = fixManifestVerThree(oldManifest);
    } else {
      manifest = generateManifest([user], link, oldManifest);
    }
    fs.outputJsonSync(manifestLocation, manifest);
  } catch (err) {
    console.error(err);
  }
  return manifest;
}

/**
 * @desription - Uses the tc-standard format for projects to make package_version 3 compatible
 * @param {object} oldManifest - The name of an employee.
 */
export function fixManifestVerThree(oldManifest) {
  let newManifest = {};
  try {
    for (let oldElements in oldManifest) {
      newManifest[oldElements] = oldManifest[oldElements];
    }
    newManifest.finished_chunks = oldManifest.finished_frames;
    newManifest.project = {};
    newManifest.project.id = oldManifest.project_id;
    newManifest.project.name = this.convertToFullBookName(oldManifest.project_id);
    for (let el in oldManifest.source_translations) {
      newManifest.source_translations = oldManifest.source_translations[el];
      let parameters = el.split("-");
      newManifest.source_translations.language_id = parameters[1];
      newManifest.source_translations.resource_id = parameters[2];
      break;
    }
  } catch (e) {
    console.error(e);
  }
  return newManifest;
}

/**
 * @description Check if project is titus, or if user is in developer mode.
 *
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function checkIfValidBetaProject(manifest) {
  if (manifest && manifest.project) return manifest.project.id == "tit";
  else return false;
}
