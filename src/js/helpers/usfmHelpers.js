/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import usfm from 'usfm-js';
// helpers
import * as bibleHelpers from './bibleHelpers';
import * as LoadHelpers from './LoadHelpers';
// constants
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore', 'projects');

/**
 * @description Sets up the folder in the tC save location for a USFM project
 * @param {String} usfmFilePath - Path of the usfm file that has been loaded
 */
export function loadUSFMFile(usfmFilePath) {
  let usfmFile;
  try {
    usfmFile = fs.readFileSync(usfmFilePath).toString();
  } catch (e) {
    return null;
  }
  return usfmFile;
}

/**
 * @description Parses the usfm file using usfm-parse library.
 * @param {string} usfmFile - Path in which the USFM project is being loaded from
 */
export function getParsedUSFM(usfmFile) {
  try {
    if (usfmFile)
      return usfm.toJSON(usfmFile);
  } catch (e) {
    console.error(e);
  }
}

/**
* Most important funciton for creating a project from a USFM file alone. This function gets the
* book name, id, language name and direction for starting a tC project.
*
* @param {object} usfmObject - Object created by USFM to JSON module. Contains information
* for parsing and using in tC such as book name.
*/
export function getUSFMDetails(usfmObject) {
  let details = {
    book: {
      id: undefined,
      name: undefined
    },
    language: {
      id: undefined,
      name: undefined,
      direction: 'ltr'
    }
  };

  let headerIDArray = [];
  if (usfmObject.headers && usfmObject.headers.id) {
    /** Conditional to determine how USFM should be parsed*/
    let isSpaceDelimited = usfmObject.headers.id.split(" ").length > 1;
    let isCommaDelimited = usfmObject.headers.id.split(",").length > 1;
    if (isSpaceDelimited) {
      /**i.e. TIT EN_ULB sw_Kiswahili_ltr Wed Jul 26 2017 22:14:55 GMT-0700 (PDT) tc */
      //Could have attached commas if both comma delimited and space delimited
      headerIDArray = usfmObject.headers.id.split(" ");
      headerIDArray.forEach((element, index) => {
        headerIDArray[index] = element.replace(',', '');
      });
      details.book.id = headerIDArray[0].trim().toLowerCase();
    } else if (isCommaDelimited) {
      /**i.e. TIT, gux_Gourmanchéma_ltr, EN_ULB, Thu Jul 20 2017 16:03:48 GMT-0700 (PDT), tc */
      headerIDArray = usfmObject.headers.id.split(",");
      details.book.id = headerIDArray[0].trim().toLowerCase();
    }
    else {
      /**i.e. EPH */
      details.book.id = usfmObject.headers.id.toLowerCase();
    }

    let fullBookName = bibleHelpers.convertToFullBookName(details.book.id);
    if (fullBookName) details.book.name = fullBookName;
    else {
      fullBookName = bibleHelpers.convertToFullBookName(usfmObject.book);
      if (fullBookName)
        details.book.name = fullBookName;
      else {
        details.book.id = null;
      }
    }

    let tcField = headerIDArray[headerIDArray.length - 1] || '';
    if (tcField.trim() == 'tc') {
      /**Checking for tC field to parse with more information than standard usfm */
      for (var index in headerIDArray) {
        /**The language code and resource name field were wrongly parsed in
        * the first implementation. In order to account for usfm files exported
        * from tC with this format this is checking for the string that
        * contains three pieces of information delimited with underscores
        * Therefore deeming it as the langauge code field i.e. 'sw_Kiswahili_ltr'
        * rather than the resource field i.e. 'EN_ULB'
        */
        let languageCodeArray = headerIDArray[index].trim().split('_');
        if (languageCodeArray.length == 3) {
          details.language.id = languageCodeArray[0].toLowerCase();
          details.language.name = languageCodeArray[1];
          details.language.direction = languageCodeArray[2].toLowerCase();
        }
      }
    }
  }
  return details;
}

/**
 * Gets neccesarry details in order to load a project from usfm that are not available
 * through the standard loading process.
 * @param {string} usfmFilePath - File path to the usfm being selected for the project
 * @return
 */
export function getProjectDetailsFromUSFM(usfmFilePath) {
  const usfmFile = loadUSFMFile(usfmFilePath);
  const parsedUSFM = getParsedUSFM(usfmFile);
  /** hard coded due to unknown direction type from usfm */
  const direction = 'ltr';
  return { parsedUSFM, direction };
}

/**
 * Changes the folder name to one specified by tC in order to match convention.
 * Removes old folder reference.
 * @param {object} manifest - Current project manifest
 * @param {string} projectSaveLocation - Old project file path
 */
export function updateUSFMFolderName(manifest, projectSaveLocation, callback) {
  let fileName = `${manifest.target_language.id}_${manifest.project.id}`;
  let destinationPath = path.join(DEFAULT_SAVE, fileName);
  let alreadyExists = LoadHelpers.projectTypeExists(manifest.target_language.id, manifest.project.id, projectSaveLocation);
  try {
    if (!alreadyExists) {
      fs.copySync(projectSaveLocation, destinationPath);
    }
    fs.remove(projectSaveLocation, (err) => {
      if (!err) callback();
    });
    return { destinationPath, alreadyExists, fileName };
  } catch (e) {
    console.warn(e);
  }
}
