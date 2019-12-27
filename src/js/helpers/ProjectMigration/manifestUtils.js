/* eslint-disable no-console */
import path from 'path-extra';
import fs from 'fs-extra';
//helpers
import { generateTimestamp } from '../TimestampGenerator';
import * as bibleHelpers from '../bibleHelpers';
import * as usfmHelpers from '../usfmHelpers';
import * as LoadHelpers from '../LoadHelpers';

let template = {
  generator: {
    name: 'tc-desktop',
    build: '',
  },
  target_language: {
    id: '',
    name: '',
    direction: '',
  },
  project: {
    id: '',
    name: '',
  },
  type: {
    id: '',
    name: '',
  },
  source_translations: [],
  translators: [],
  checkers: [],
  time_created: '',
  tools: [],
  repo: '',
  tcInitialized: true,
};

/**
 * This function populates the template manifest with the data.
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
 * @param {string} projectSaveLocation - absolute path where the translationCore manifest file will be saved.
 * @param {string} link
 * @param {object} oldManifest - The translationStudio manifest data loaded from a translation
 * studio project
 */
export function setUpManifest(projectSaveLocation, link, oldManifest) {
  let manifest;

  try {
    let manifestLocation = getManifestPath(projectSaveLocation);

    if (oldManifest && ((oldManifest.package_version === '3') || (oldManifest.package_version === 3))) {
      //some older versions of ts-manifest have to be tweaked to work
      manifest = fixManifestVerThree(oldManifest);
      oldManifest = manifest; // use update version to generate new manifest
    }

    manifest = generateManifest(link, oldManifest || {});
    fs.outputJsonSync(manifestLocation, manifest, { spaces: 2 });
  } catch (err) {
    console.log(err);
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
    newManifest.project.name = bibleHelpers.convertToFullBookName(oldManifest.project_id);

    for (let el in oldManifest.source_translations) {
      newManifest.source_translations = oldManifest.source_translations[el];
      let parameters = el.split('-');
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
 * @description Sets up a USFM project manifest according to tC standards.
 *
 * @param {object} parsedUSFM - The object containing usfm parsed by header/chapters
 */
export function setUpDefaultUSFMManifest(parsedUSFM) {
  let usfmDetails = usfmHelpers.getUSFMDetails(parsedUSFM);
  return {
    'source_translations': [
      {
        'language_id': 'en',
        'resource_id': 'ult',
        'checking_level': '',
        'date_modified': new Date(),
        'version': '',
      },
    ],
    'tcInitialized': true,
    'target_language': {
      id: usfmDetails.language.id,
      name: usfmDetails.language.name,
      direction: usfmDetails.language.direction,
    },
    'project': {
      id: usfmDetails.book.id,
      name: usfmDetails.book.name,
    },
  };
}

/**
 * Retrieves tC manifest and returns it or if not available looks for tS manifest.
 * If neither are available tC has no way to load the project, unless its a usfm project.
 * @param {string} projectPath - path location in the filesystem for the project.
 * @param {string|undefined} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 */
export const getProjectManifest = (projectPath, projectLink) => {
  let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  let tCManifest = LoadHelpers.loadFile(projectPath, 'tc-manifest.json');
  manifest = manifest || tCManifest;

  if (!manifest || !manifest.tcInitialized) {
    manifest = setUpManifest(projectPath, projectLink, manifest);
  }
  return manifest;
};

/**
 * @description - find path to manifest.json file in project path
 * @param {String} projectPath - path to project
 * @return {null}
 */
export const getManifestPath = (projectPath) => {
  const projectManifestPath = path.join(projectPath, 'manifest.json');
  return fs.existsSync(projectManifestPath) ? projectManifestPath : null;
};

/**
 * @description - writes new manifest at project path
 * @param {String} projectPath - path to project
 * @param {object} manifest - data to save
 * @return {null}
 */
export const saveProjectManifest = (projectPath, manifest) => {
  if (manifest) {
    const validManifestPath = getManifestPath(projectPath);

    if (validManifestPath) {
      fs.outputJsonSync(validManifestPath, manifest, { spaces: 2 });
    }
  }
};
