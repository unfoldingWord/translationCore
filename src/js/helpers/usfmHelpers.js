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
 *
 * @param {string} usfmFile - Path in which the USFM project is being loaded from
 */
export function getParsedUSFM(usfmFile) {
  try {
    return usfm.toJSON(usfmFile);
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
  let usfmProjectPath = false;
  let isProjectFolder = fs.lstatSync(projectPath).isDirectory();
  if (isProjectFolder) {
    fs.readdirSync(projectPath).forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (ext === ".usfm" || ext === ".sfm" || ext === ".txt") {
        let usfmData = loadUSFMFile(path.join(projectPath, file));
        if (usfmData.includes('\\h') || usfmData.includes('\\id') || usfmData.includes('\\v')) usfmProjectPath = path.join(projectPath, file);
      }
    });
  } else {
    let file = path.basename(projectPath);
    const ext = path.extname(file).toLowerCase();
    if (ext === ".usfm" || ext === ".sfm" || ext === ".txt") {
      let usfmData = loadUSFMFile(path.join(projectPath));
      if (usfmData.includes('\\h') || usfmData.includes('\\id') || usfmData.includes('\\v')) usfmProjectPath = path.join(projectPath);
    }
  }
  return usfmProjectPath;
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
        console.warn('could not get book name from usfm, book id must be entered in project verification');
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
 * Sets up and returns a tC project folder in ~/translationCore/{languageID_bookName}/{bookName}.usfm
 * @param {string} usfmFilePath - File path to the usfm being selected for the project
 */
export function setUpUSFMFolderPath(usfmFilePath) {
  const usfmData = loadUSFMFile(usfmFilePath);
  const parsedUSFM = getParsedUSFM(usfmData);
  const usfmDetails = getUSFMDetails(parsedUSFM);
  let oldFolderName = path.parse(usfmFilePath).name.toLowerCase();
  let newUSFMFilePath;
  let newUSFMProjectFolder;
  if (usfmDetails.book.id) {
    let newFolderName = usfmDetails.language.id ? `${usfmDetails.language.id}_${usfmDetails.book.id}` : oldFolderName;
    newUSFMProjectFolder = path.join(DEFAULT_SAVE, newFolderName);
    newUSFMFilePath = path.join(newUSFMProjectFolder, usfmDetails.book.id) + '.usfm';
    if (fs.existsSync(newUSFMProjectFolder) || LoadHelpers.projectTypeExists(usfmDetails.language.id, usfmDetails.book.id)) return { homeFolderPath: newUSFMProjectFolder, alreadyImported: true };
  } else {
    newUSFMFilePath = path.join(DEFAULT_SAVE, oldFolderName, oldFolderName + '.usfm');
    newUSFMProjectFolder = path.join(DEFAULT_SAVE, oldFolderName);
  }
  fs.outputFileSync(newUSFMFilePath, usfmData);
  return { homeFolderPath: newUSFMProjectFolder, alreadyImported: false };
}


/**
 * Retrieves tC manifest and returns it or if not available creates
 * tC manifest from data available in usfm.
 * @param {string} projectPath - Path location in the filesystem for the project.
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git.
 * @param {object} parsedUSFM - USFM parsed using usfm-js module includes headers and usfm chapter content.
 */
export function getUSFMProjectManifest(projectPath, projectLink, parsedUSFM) {
  let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  if (!manifest) {
    const defaultManifest = manifestHelpers.setUpDefaultUSFMManifest(parsedUSFM);
    manifest = manifestHelpers.setUpManifest(projectPath, projectLink, defaultManifest);
  }
  return manifest;
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
  let alreadyExists = LoadHelpers.projectTypeExists(manifest.target_language.id, manifest.project.id);
  try {
    if (!alreadyExists) {
      fs.copySync(projectSaveLocation, destinationPath);
    }
    fs.remove(projectSaveLocation, (err)=>{
      if (!err) callback();
    });
    return { destinationPath, alreadyExists, fileName };
  } catch (e) {
    console.warn(e);
  }
}