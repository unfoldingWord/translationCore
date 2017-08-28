/* eslint-disable no-console */
import path from 'path-extra';
import * as fs from 'fs-extra';
import usfm from 'usfm-js';
// helpers
import * as bibleHelpers from './bibleHelpers';
import * as LoadHelpers from './LoadHelpers';
import * as manifestHelpers from './manifestHelpers';


const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore', 'projects');

/**
* @description Sets up the folder in the tC save location for a USFM project
*
* @param {string} usfmFilePath - Path of the usfm file that has been loaded
*/
export function loadUSFMFile(usfmFilePath) {
  const usfmFile = fs.readFileSync(usfmFilePath).toString();
  return usfmFile
}

/**
 * @description Parses the usfm file using usfm-parse library.
 *
 * @param {string} projectPath - Path in which the USFM project is being loaded from
 */
export function getParsedUSFM(usfmFile) {
  try {
    let parsedUSFM = usfm.toJSON(usfmFile);
    return parsedUSFM;
  } catch (e) {
    console.error(e);
  }
}

/**
 * @description Checks if the folder/file specified is a usfm project
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 */
export function isUSFMProject(projectPath) {
  try {
    fs.readFileSync(projectPath);
    const ext = path.extname(projectPath).toLowerCase();
    if (ext == ".usfm" || ext == ".sfm" || ext == ".txt") return projectPath;
  } catch (e) {
    try {
      let dir = fs.readdirSync(projectPath);
      for (let i in dir) {
        const ext = path.extname(dir[i]).toLowerCase();
        if (ext == ".usfm" || ext == ".sfm" || ext == ".txt") return path.join(projectPath, dir[i]);
      }
      return false;
    } catch (err) {
      return false;
    }
  }
}

/**
* @description Set ups a tC project parameters for a usfm project
* @param {string} bookAbbr - Book abbreviation
* @param {path} projectPath - Path of the usfm project being loaded
* @param {path} direction - Reading direction of the project books
* @return {object} action object.
*/
export function getUSFMParams(projectPath, manifest) {
  let bookAbbr;
  if (manifest.project) bookAbbr = manifest.project.id;
  else if (manifest.ts_project) bookAbbr = manifest.ts_project.id;
  let direction = manifest.target_language.direction;
  let params = {
    originalLanguagePath: '',
    targetLanguagePath: projectPath,
    direction: direction,
    bookAbbr: bookAbbr
  };
  if (bibleHelpers.isOldTestament(bookAbbr)) {
    params.originalLanguage = "hebrew";
  } else {
    params.originalLanguage = "greek";
  }
  return params;
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
    if (isCommaDelimited) {
      /**i.e. TIT, gux_Gourmanchéma_ltr, EN_ULB, Thu Jul 20 2017 16:03:48 GMT-0700 (PDT), tc */
      headerIDArray = usfmObject.headers.id.split(",");
      details.book.id = headerIDArray[0].trim().toLowerCase();
    }
    else if (isSpaceDelimited) {
      /**i.e. TIT EN_ULB sw_Kiswahili_ltr Wed Jul 26 2017 22:14:55 GMT-0700 (PDT) tc */
      headerIDArray = usfmObject.headers.id.split(" ");
      details.book.id = headerIDArray[0].trim().toLowerCase();
    }
    else {
      /**i.e. EPH */
      details.book.id = usfmObject.headers.id.toLowerCase();
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

    details.book.name = bibleHelpers.convertToFullBookName(details.book.id);
  }
  return details;
}

/**
 * @description Sets up a USFM project manifest according to tC standards.
 *
 * @param {object} parsedUSFM - The object containing usfm parsed by chapters
 * @param {string} direction - Direction of the book being read for the project target language
 * @param {objet} user - The current user loaded
 */
export function setUpDefaultUSFMManifest(parsedUSFM, direction, username) {
  let usfmDetails = getUSFMDetails(parsedUSFM);
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
    },
    "checkers": [
      username
    ]
  }
  return defaultManifest;
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
 * Sets up and returns a tC project folder in ~/translationCore/{languageID_bookName}/{bookName}.usfm
 * @param {string} usfmFilePath - File path to the usfm being selected for the project
 */
export function setUpUSFMFolderPath(usfmFilePath) {
  const usfmData = loadUSFMFile(usfmFilePath);
  const parsedUSFM = getParsedUSFM(usfmData);
  const usfmDetails = getUSFMDetails(parsedUSFM);
  /**If there is no bookAbbr then ultimately the usfm import should fail */
  if (!usfmDetails.book.id) console.warn('No book abbreviation detected in USFM');
  let oldFileName = path.parse(usfmFilePath).name.toLowerCase();
  let folderNamePrefix = usfmDetails.language.id ? `${usfmDetails.language.id}_${usfmDetails.book.id}_` : `${oldFileName}_`;
  let textType = oldFileName.includes('_usfm') ? '' : '_usfm';
  let newUSFMProjectFolder = path.join(DEFAULT_SAVE, `${folderNamePrefix}${textType}`);
  const newUSFMFilePath = path.join(newUSFMProjectFolder, usfmDetails.book.id) + '.usfm';
  if (fs.existsSync(newUSFMProjectFolder)) return;
  fs.outputFileSync(newUSFMFilePath, usfmData);
  return newUSFMProjectFolder;
}


/**
 * Retrieves tC manifest and returns it or if not available creates
 * tC manifest from data available in usfm.
 * @param {string} projectPath - Path location in the filesystem for the project.
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git.
 * @param {object} parsedUSFM - USFM parsed using usfm-js module includes headers and usfm chapter content.
 * @param {string} direction - Direction of target language reading style i.e. 'ltr'.
 * @param {string} username - Current username of user logged in.
 */
export function getUSFMProjectManifest(projectPath, projectLink, parsedUSFM, direction, username) {
  let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  if (!manifest) {
    const defaultManifest = setUpDefaultUSFMManifest(parsedUSFM, direction, username);
    manifest = manifestHelpers.saveManifest(projectPath, projectLink, defaultManifest);
  }
  return manifest;
}
