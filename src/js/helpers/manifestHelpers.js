import path from 'path-extra';
import fs from 'fs-extra';
//helpers
import {generateTimestamp} from './TimestampGenerator';
import * as bibleHelpers from './bibleHelpers';

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
export function generateManifest(data, tsManifest) {
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
 * @param {object} data - The translationCore manifest data to be saved
 * @param {object} tsManifest - The translationStudio manifest data loaded from a translation
 * studio project
 */
export function saveManifest(projectSaveLocation, link, oldManifest, currentUser) {
  var data = {
    user: [currentUser],
    repo: link
  }
  var manifest;
  try {
    var manifestLocation = path.join(projectSaveLocation, 'manifest.json');
    if (oldManifest.package_version == '3') {
      //some older versions of ts-manifest have to be tweaked to work
      manifest = this.fixManifestVerThree(oldManifest);
    } else {
      manifest = generateManifest(data, oldManifest);
    }
    fs.outputJsonSync(manifestLocation, manifest);
  }
  catch (err) {
    console.error(err);
  }
  return manifest;
}

/**
 * @desription - Uses the tc-standard format for projects to make package_version 3 compatible
 * @param {object} oldManifest - The name of an employee.
 */
export function fixManifestVerThree(oldManifest) {
  var newManifest = {};
  try {
    for (var oldElements in oldManifest) {
      newManifest[oldElements] = oldManifest[oldElements];
    }
    newManifest.finished_chunks = oldManifest.finished_frames;
    newManifest.project = {};
    newManifest.project.id = oldManifest.project_id;
    newManifest.project.name = this.convertToFullBookName(oldManifest.project_id);
    for (var el in oldManifest.source_translations) {
      newManifest.source_translations = oldManifest.source_translations[el];
      var parameters = el.split("-");
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
 * @description Formats and saves manifest according to tC standards,
 * if not already done so
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 * @param {string} projectLink - Link given to load project if taken from online
 * @param {object} manifest - Default manifest given in order to load a non-usfm project
 */
export function setUpManifest(projectPath, projectLink, manifest, currentUser) {
  let newManifest = saveManifest(projectPath, projectLink, manifest, currentUser);
  return newManifest;
}

/**
 * @description Formats a default manifest according to tC standards
 *
 * @param {string} projectPath - Path in which the project is being loaded from, also should contain
 * the target language.
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function getParams(projectPath, manifest) {
  const isArray = (a) => {
    return (!!a) && (a.constructor === Array);
  }
  if (manifest.package_version == '3') {
    manifest = fixManifestVerThree(manifest);
  }
  if (manifest.finished_chunks && manifest.finished_chunks.length == 0) {
    return null;
  }

  let params = {
    'originalLanguagePath': ''
  }
  const UDBPath = path.join(window.__base, 'static', 'taggedUDB');
  params.targetLanguagePath = projectPath;
  params.gatewayLanguageUDBPath = UDBPath;
  try {
    if (manifest.project) {
      params.bookAbbr = manifest.project.id;
    }
    else {
      params.bookAbbr = manifest.project_id;
    }
    if (isArray(manifest.source_translations)) {
      if (manifest.source_translations.length == 0) params.gatewayLanguage = "Unknown";
      else params.gatewayLanguage = manifest.source_translations[0].language_id;
    } else {
      params.gatewayLanguage = manifest.source_translations.language_id;
    }
    params.direction = manifest.target_language ? manifest.target_language.direction : null;
    if (bibleHelpers.isOldTestament(params.bookAbbr)) {
      params.originalLanguage = "hebrew";
    } else {
      params.originalLanguage = "greek";
    }
  } catch (e) {
    console.error(e);
  }
  return params;
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
