/* eslint-disable comma-dangle */
import path from 'path-extra';
import fs from 'fs-extra';
import React from 'react';
import semver from 'semver';
//helpers
import { getTranslate } from '../../selectors';
import * as usfmHelpers from '../usfmHelpers';
import { getProjectManifest } from '../manifestHelpers';
import { isValidBibleBook } from '../bibleHelpers';
//constants
import {
  APP_VERSION,
  tc_MIN_COMPATIBLE_VERSION_KEY,
  tc_MIN_VERSION_ERROR,
} from '../../common/constants';

/**
 * Wrapper function for detecting invalid folder/file structures for expected
 * tC projects.
 * @param {string} sourcePath - Path of project to check for a valid structure
 * @returns {Promise}
 */

export function detectInvalidProjectStructure(sourcePath) {
  return new Promise((resolve, reject) => {
    const projectManifestPath = path.join(sourcePath, 'manifest.json');
    const projectTCManifestPath = path.join(sourcePath, 'tc-manifest.json');
    let validManifestPath;

    if (fs.existsSync(projectManifestPath)) {
      validManifestPath = projectManifestPath;
    } else if (fs.existsSync(projectTCManifestPath)) {
      validManifestPath = projectTCManifestPath;
    } else {
      validManifestPath = null;
    }

    //make sure manifest exists before checking fields
    if (validManifestPath) {
      const projectManifest = fs.readJsonSync(validManifestPath);

      if (projectManifest.project) {
        //Project manifest is valid, not checking for book id because it can be fixed later
        return resolve();
      } else {
        return reject(
          <div>
            The project you selected has an invalid manifest ({sourcePath})<br />
            Please select a new project.
          </div>
        );
      }
    } else {
      return reject(
        <div>No manifest found for the selected project ({sourcePath})
          <br />Please select a new project.
        </div>
      );
    }
  });
}

/**
 * Verifies that a project structure is valid to tC expectations.
 * tC is strictly for tS / or usfm type of importing projects.
 * Other project formats will break tC. This methods main purpose is for
 * finding projects that are not tC format, it is not ensuring that
 * the project is in tC format.
 * @param {string} projectPath - Path to the project
 * @returns {boolean | string} - If the project is not in tC format
 * returns the err type of the deteced project. If no errors are found
 * returns false.
 */
export function verifyProjectType(projectPath) {
  return new Promise((resolve, reject) => {
    let invalidTypeError;
    let projectMetaFile;

    /** For multiple book project type detecting */
    if (fs.existsSync(path.join(projectPath, 'meta.json'))) {
      projectMetaFile = fs.readJSONSync(path.join(projectPath, 'meta.json'));
    }

    if (testResourceByType(projectPath, 'obs')) {
      invalidTypeError = 'translationCore does not support checking for Open Bible Stories. It will not be loaded.';
    } else if (testResourceByType(projectPath, 'tn')) {
      invalidTypeError = 'translationCore does not support checking for translationNotes. It will not be loaded.';
    } else if (testResourceByType(projectPath, 'tq')) {
      invalidTypeError = 'translationCore does not support checking for translationQuestions. It will not be loaded.';
    } else if (testResourceByType(projectPath, 'ta')) {
      invalidTypeError = 'translationCore does not support checking for translationAcademy. It will not be loaded.';
    } else if (testResourceByType(projectPath, 'tw')) {
      invalidTypeError = 'translationCore does not support checking for translationWords. It will not be loaded.';
    } else if (projectMetaFile && projectMetaFile.slug === 'bible') {
      invalidTypeError = 'translationCore does not support checking for multiple books. It will not be loaded.';
    } else if (projectHasMultipleBooks(projectPath)) {
      invalidTypeError = 'translationCore does not support checking for multiple books. It will not be loaded.';
    }

    if (invalidTypeError) {
      fs.removeSync(projectPath);
      reject(invalidTypeError);
    } else {
      resolve();
    }
  });
}


/**
 * Determines if a project is a specified type by searching the manifest
 * @param {string} projectPath - Path to the selected project to be tested
 * @param {'obs' | 'ts' | 'ta' | 'tw' | 'tn' } type - The type of project to test for
 */
export function testResourceByType(projectPath, type) {
  if (fs.existsSync(path.join(projectPath, 'manifest.yaml'))) {
    let projectYaml = fs.readFileSync(path.join(projectPath, 'manifest.yaml')).toString();

    if (projectYaml) {
      let regex = new RegExp(`source:[\\s\\S]*?identifier: ('${type}'|${type})`, 'gi');
      return regex.test(projectYaml);
    }
  }

  if (fs.existsSync(path.join(projectPath, 'manifest.json'))) {
    let projectManifest = fs.readJSONSync(path.join(projectPath, 'manifest.json'));

    if (projectManifest) {
      if (projectManifest.project && projectManifest.project.id === `${type}` || projectManifest.type && projectManifest.type.id === `${type}`) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Returns an array of unique book ids in the project.
 * If `limit` is specified this method will return prematurely when the book count equals the limit.
 * This is mostly designed for counting books in a project.
 *
 * @param {string}  projectPath - path to the project
 * @param {int} limit - the maximum number of books to retrieve.
 * @param {array<string>} bookIDs - an array of unique book ids
 * @return {array<string>}
 */
export const getUniqueBookIds = (projectPath, limit = -1, bookIDs = []) => {
  let newIDs = [...bookIDs];

  for (let file of fs.readdirSync(projectPath)) {
    if (['.', '..', '.git'].indexOf(file) > -1) {
      continue;
    }

    const filePath = path.join(projectPath, file);

    if (fs.lstatSync(filePath).isDirectory()) {
      newIDs = getUniqueBookIds(filePath, limit, newIDs);
    } else {
      const usfmPath = isUSFMProject(filePath);

      if (usfmPath) {
        const usfmData = usfmHelpers.loadUSFMFile(usfmPath);

        if (!usfmData.includes('\\id') && !usfmData.includes('\\h')) {
          //This is not a usfm file, so we are not adding it to detected usfm files
          break;
        }

        const id = usfmHelpers.parseUsfmDetails(usfmData).book.id;

        if (newIDs.indexOf(id) === -1 && isValidBibleBook(id)) {
          newIDs.push(id);
        }
      }
    }

    if (newIDs.length >= limit && limit !== -1) {
      break;
    }
  }
  return newIDs;
};

/**
 * Checks if a project contains more than one book.
 * @param {string} projectPath - path to the project
 * @returns {boolean} - true if multiple books were found
 */
export const projectHasMultipleBooks = (projectPath) => getUniqueBookIds(projectPath, 2).length > 1;

/**
 * @description Checks if the folder/file specified is a usfm project
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 */
export function isUSFMProject(projectPath) {
  let usfmProjectPath = false;
  let isProjectFolder = fs.lstatSync(projectPath).isDirectory();

  if (isProjectFolder) {
    fs.readdirSync(projectPath).forEach(file => {
      const ext = path.extname(file).toLowerCase();

      if (ext === '.usfm' || ext === '.sfm' || ext === '.txt') {
        let usfmData = usfmHelpers.loadUSFMFile(path.join(projectPath, file));

        if (usfmData.includes('\\h') || usfmData.includes('\\id') || usfmData.includes('\\v')) {
          usfmProjectPath = path.join(projectPath, file);
        }
      }
    });
  } else {
    let file = path.basename(projectPath);
    const ext = path.extname(file).toLowerCase();

    if (ext === '.usfm' || ext === '.sfm' || ext === '.txt') {
      let usfmData = usfmHelpers.loadUSFMFile(path.join(projectPath));

      if (usfmData.includes('\\h') || usfmData.includes('\\id') || usfmData.includes('\\v')) {
        usfmProjectPath = path.join(projectPath);
      }
    }
  }
  return usfmProjectPath;
}

export function verifyValidBetaProject(state) {
  return new Promise((resolve, reject) => {
    let { currentSettings } = state.settingsReducer;
    let { manifest } = state.projectDetailsReducer;

    if (currentSettings && currentSettings.developerMode) {
      return resolve();
    } else if (manifest && manifest.project && isValidBibleBook(manifest.project.id)) {
      return resolve();
    } else {
      const translate = getTranslate(state);
      return reject(translate('tools.book_not_supported', { 'app': translate('_.app_name') }));
    }
  });
}

/**
 * compare version numbers in format `1.2.3`.  Returns -1 if a is less than b, 0 if same,
 *      and +1 if a is greater than b
 * @param {String} a
 * @param {String} b
 */
export function versionCompare(a, b) {
  const cleanA = semver.coerce(a);
  const cleanB = semver.coerce(b);

  if (semver.lt(cleanA, cleanB)) {
    return -1;
  } else if (semver.gt(cleanA, cleanB)) {
    return 1;
  } else {
    return 0;
  }
}

/**
 * Checks if the project is supported by this version of tC.
 * @param {string} projectDir - the path to the project directory
 * @param translate
 * @return {Promise<boolean>} - Promise resolves true if the project is supported, otherwise false.
 */
export function isProjectSupported(projectDir, translate) {
  return new Promise((resolve, reject) => {
    const manifest = getProjectManifest(projectDir);
    // TRICKY: versions before 0.8.1 did not have a tc_version key
    let greaterThanVersion_0_8_0 = !!manifest.tc_version;

    if (!greaterThanVersion_0_8_0) {
      // TRICKY: added license in 0.8.0
      greaterThanVersion_0_8_0 = !!manifest.license;
    }

    if (!greaterThanVersion_0_8_0 && testForCheckingData(projectDir)) {
      // if old and has some checking data, it cannot be opened
      reject(translate('project_validation.old_project_unsupported', { app: translate('_.app_name'), help_desk_email: translate('_.help_desk_email') }));
      return;
    }

    const minVersion = manifest[tc_MIN_COMPATIBLE_VERSION_KEY];

    if (minVersion && (versionCompare(APP_VERSION, minVersion) < 0)) {
      reject(tc_MIN_VERSION_ERROR);
      return;
    }

    resolve(true);
  });
}

/**
 * Checks several locations in project for old checking data
 * @param {String} projectPath
 * @return {Boolean} true if checking data found in project
 */
export function testForCheckingData(projectPath) {
  const checkingDataPath = path.join(projectPath, '.apps/translationCore/checkData/selections');
  let hasCheckingData = fs.existsSync(checkingDataPath);

  if (!hasCheckingData) {
    const oldTnotesCheckingDataPath = path.join(projectPath, 'checkdata/TranslationNotesChecker.tc');
    hasCheckingData = fs.existsSync(oldTnotesCheckingDataPath);

    if (!hasCheckingData) {
      const oldTwordsCheckingDataPath = path.join(projectPath, 'checkdata/TranslationWordsChecker.tc');
      hasCheckingData = fs.existsSync(oldTwordsCheckingDataPath);
    }
  }
  return hasCheckingData;
}
