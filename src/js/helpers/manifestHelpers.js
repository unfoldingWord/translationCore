/* eslint-disable no-console */
import path from 'path-extra';
import fs from 'fs-extra';
//helpers
import {generateTimestamp} from './TimestampGenerator';
import * as bibleHelpers from './bibleHelpers';
import * as usfmHelpers from './usfmHelpers';

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
  repo: '',
  tcInitialized: true
};

/**
 * This function populates the template manifest with the data.
 * @param {[...string]} currentUsers - users checking the current project
 * @param {string} repo - Repository where the project came from
 * @param {object} tsManifest - The translationStudio manifest for the selected project
 */
export function generateManifest(repo, tsManifest) {
  //Creating new object reference to fix edge case bug
  let projectManifest = JSON.parse(JSON.stringify(template));
  projectManifest.time_created = generateTimestamp();
  if (repo) {
    projectManifest.repo = repo;
  }
  for (let oldElements in tsManifest) {
    projectManifest[oldElements] = tsManifest[oldElements];
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
export function setUpManifest(projectSaveLocation, link, oldManifest) {
  let manifest;
  try {
    let manifestLocation = path.join(projectSaveLocation, 'manifest.json');
    if (oldManifest && oldManifest.package_version == '3') {
      //some older versions of ts-manifest have to be tweaked to work
      manifest = fixManifestVerThree(oldManifest);
    } else {
      manifest = generateManifest(link, oldManifest || {});
    }
    fs.outputJsonSync(manifestLocation, manifest);
  } catch (err) {
    console.log(err)
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


/**
 * @description Sets up a USFM project manifest according to tC standards.
 *
 * @param {object} parsedUSFM - The object containing usfm parsed by chapters
 * @param {string} direction - Direction of the book being read for the project target language
 * @param {objet} user - The current user loaded
 */
export function setUpDefaultUSFMManifest(parsedUSFM, direction) {
  let usfmDetails = usfmHelpers.getUSFMDetails(parsedUSFM);
  const defaultManifest = {
    "source_translations": [
      {
        "language_id": "en",
        "resource_id": "ulb",
        "checking_level": "",
        "date_modified": new Date(),
        "version": ""
      }
    ],
    tcInitialized: true,
    target_language: {
      id: usfmDetails.language.id,
      name: usfmDetails.language.name,
      direction: usfmDetails.language.direction
    },
    project: {
      id: usfmDetails.book.id,
      name: usfmDetails.book.name
    }
  }
  return defaultManifest;
}