/* eslint-disable no-console */
import Path from 'path-extra';
import * as fs from 'fs-extra';
import ManifestGenerator from '../components/createProject/ProjectManifest';
import BooksOfBible from '../components/BooksOfBible';
import usfm from 'usfm-js';

const USER_RESOURCES_DIR = Path.join(Path.homedir(), 'translationCore/resources');
const PACKAGE_SUBMODULE_LOCATION = Path.join(window.__base, 'tC_apps');
const DEFAULT_SAVE = Path.join(Path.homedir(), 'translationCore', 'projects');

/**
 *
 * @param {string} projectBook - Book abbreviation
 */
export function isOldTestament(projectBook) {
  var passedBook = false;
  for (var book in BooksOfBible) {
    if (book == projectBook) passedBook = true;
    if (BooksOfBible[book] == "Malachi" && passedBook) {
      return true;
    }
  }
  return false;
}

/**
 *
 * @param {string} path - Directorty of the file to load, not the file name.
 * @param {string} file - The file name to load.
 */
export function loadFile(path, file) {
  try {
    var manifest = fs.readJsonSync(Path.join(path, file));
    return manifest;
  }
  catch (e) {
    return null
  }
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
    var manifestLocation = Path.join(projectSaveLocation, 'manifest.json');
    if (oldManifest.package_version == '3') {
      //some older versions of ts-manifest have to be tweaked to work
      manifest = this.fixManifestVerThree(oldManifest);
    } else {
      manifest = ManifestGenerator(data, oldManifest);
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
 *
 * @param {string} bookAbbr - The book abbreviation to convert
 */
export function convertToFullBookName(bookAbbr) {
  if (!bookAbbr) return;
  return BooksOfBible[bookAbbr.toString().toLowerCase()];
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
  const verifiedManifest = verifyChunks(projectPath, manifest);
  let newManifest = saveManifest(projectPath, projectLink, verifiedManifest, currentUser);
  return newManifest;
}

/**
 * @description Stores the project path loaded into the default tC folder
 * location. If the project is exists in the default save location and it is
 * loaded from some place else, user will be prompted to overwrite it. Which results
 * in a deletion of the non-tC folder loaction project.
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 */
export function saveProjectInHomeFolder(projectPath) {
  const parsedPath = Path.parse(projectPath);
  const tCProjectsSaveLocation = Path.join(DEFAULT_SAVE, parsedPath.name);

  if (!fs.existsSync(projectPath)) {
    return false;
  }
  if (fs.existsSync(tCProjectsSaveLocation)) {
    return tCProjectsSaveLocation;
  } else {
    let newPath = tCProjectsSaveLocation
    if (isUSFMProject(projectPath) !== false) {
      newPath = Path.join(tCProjectsSaveLocation, parsedPath.name);
    }
    fs.copySync(projectPath, newPath);
    return tCProjectsSaveLocation;
  }
}

/**
 * @description Sets up the folder in the tC save location for a USFM project
 *
 * @param {string} usfmFilePath - Path of the usfm file that has been loaded
 */
export function loadUSFMData(usfmFilePath) {
  const parsedPath = Path.parse(usfmFilePath);
  const usfmData = fs.readFileSync(usfmFilePath).toString();
  return usfmData
}


/**
 * @description Sets up a USFM project manifest according to tC standards.
 *
 * @param {object} parsedUSFM - The object containing usfm parsed by chapters
 * @param {string} direction - Direction of the book being read for the project target language
 * @param {objet} user - The current user loaded
 */
export function setUpDefaultUSFMManifest(parsedUSFM, direction, username) {
  let { id, name, bookAbbr, bookName } = getIDsFromUSFM(parsedUSFM);
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
      direction: direction,
      id,
      name
    },
    project: {
      id: bookAbbr,
      name: bookName
    },
    "checkers": [
      username
    ]
  }
  return defaultManifest;
}

/**
 * @description Parses the usfm file using usfm-parse library.
 *
 * @param {string} projectPath - Path in which the USFM project is being loaded from
 */
export function getParsedUSFM(usfmData) {
  try {
    let parsedUSFM = usfm.toJSON(usfmData);
    return parsedUSFM;
  } catch (e) {
    console.error(e);
  }
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
 * @description Formats a default manifest according to tC standards
 *
 * @param {string} path - Path in which the project is being loaded from, also should contain
 * the target language.
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function getParams(path, manifest) {
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
  const UDBPath = Path.join(window.__base, 'static', 'taggedUDB');
  params.targetLanguagePath = path;
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
    if (isOldTestament(params.bookAbbr)) {
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
 * @description Checks if the folder/file specified is a usfm project
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 */
export function isUSFMProject(projectPath) {
  try {
    fs.readFileSync(projectPath);
    const ext = Path.extname(projectPath).toLowerCase();
    if (ext == ".usfm" || ext == ".sfm" || ext == ".txt") return projectPath;
  } catch (e) {
    try {
      let dir = fs.readdirSync(projectPath);
      for (let i in dir) {
        const ext = Path.extname(dir[i]).toLowerCase();
        if (ext == ".usfm" || ext == ".sfm" || ext == ".txt") return Path.join(projectPath, dir[i]);
      }
      return false;
    } catch (err) {
      return false;
    }
  }
}


/**
 * @description Verifies that the manifest given has an accurate count of finished chunks.
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function verifyChunks(projectPath, manifest) {
  if (!projectPath || !manifest) return null;
  const chunkChapters = fs.readdirSync(projectPath);
  let finishedChunks = [];
  for (const chapter in chunkChapters) {
    if (!isNaN(chunkChapters[chapter])) {
      const chunkVerses = fs.readdirSync(projectPath + '/' + chunkChapters[chapter]);
      for (let chunk in chunkVerses) {
        const currentChunk = chunkVerses[chunk].replace(/(?:\(.*\))?\.txt/g, '');
        const chunkString = chunkChapters[chapter].trim() + '-' + currentChunk.trim();
        if (!finishedChunks.includes(chunkString)) {
          finishedChunks.push(chunkString);
        }
      }
    }
  }
  manifest.finished_chunks = finishedChunks;
  manifest.tcInitialized = true;
  return manifest;
}


/**
 * @description creates an array that has the data of each included tool and 'subtool'
 *
 * @param {object} dataObject - Package json of the tool being loaded,
 * meta data of what the tool needs to load.
 * @param {string} moduleFolderName - Folder path of the tool being loaded.
 */
export function createCheckArray(dataObject, moduleFolderName) {
  let modulePaths = [];
  try {
    if (!dataObject.name || !dataObject.version || !dataObject.title || !dataObject.main) {
      return;
    } else {
      modulePaths.push({ name: dataObject.name, location: moduleFolderName });
      for (let childFolderName in dataObject.include) {
        //If a developer hasn't defined their module in the corret way, this'll probably throw an error
        if (Array.isArray(dataObject.include)) {
          modulePaths.push({
            name: dataObject.include[childFolderName],
            location: Path.join(PACKAGE_SUBMODULE_LOCATION, dataObject.include[childFolderName])
          });
        } else {
          modulePaths.push({
            name: childFolderName,
            location: Path.join(PACKAGE_SUBMODULE_LOCATION, childFolderName)
          });
        }
      }
      return modulePaths;
    }
  } catch (e) {
    console.error(e)
  }
}
/**
 * This method reads in all the chunks of a project, and determines if there are any missing verses
 * @param {String} book - Full name of the book
 * @param {String} projectSaveLocation - The current save location of the project
 * @returns {Boolean} True if there is any missing verses, false if the project does not contain any
 */
export function projectIsMissingVerses(projectSaveLocation, bookAbbr) {
  try {
    let languageId = 'en';
    let indexLocation = Path.join(USER_RESOURCES_DIR, languageId, 'bibles', 'ulb', 'v10', 'index.json');
    let expectedVerses = fs.readJSONSync(indexLocation);
    let actualVersesObject = {};
    let currentFolderChapters = fs.readdirSync(Path.join(projectSaveLocation, bookAbbr));
    let chapterLength = 0;
    actualVersesObject = {};
    for (var currentChapterFile of currentFolderChapters) {
      let currentChapter = Path.parse(currentChapterFile).name;
      if (!parseInt(currentChapter)) continue;
      chapterLength++;
      let verseLength = 0;
      try {
        let currentChapterObject = fs.readJSONSync(Path.join(projectSaveLocation, bookAbbr, currentChapterFile));
        for (var verseIndex in currentChapterObject) {
          let verse = currentChapterObject[verseIndex];
          if (verse && verseIndex > 0) verseLength++;
        }
      } catch (e) { }
      actualVersesObject[currentChapter] = verseLength;
    }
    actualVersesObject.chapters = chapterLength;
    let currentExpectedVerese = expectedVerses[bookAbbr];
    return JSON.stringify(currentExpectedVerese) !== JSON.stringify(actualVersesObject);
  } catch (e) {
    console.warn('ulb index file not found missing verse detection is invalid. Please delete ~/translationCore/resources folder');
    return false;
  }
}

/**
 * This method reads in all the chunks of a project, and determines if there is any merge conflicts.
 * @param {Array} projectChunks - An array of finished chunks, as defined by the manfest
 * @param {String} projectPath - The current save location of the project
 * @returns {Boolean} True if there is any merge conflicts, false if the project does not contain any
 */
export function projectHasMergeConflicts(projectPath, bookAbbr) {
  let currentFolderChapters = fs.readdirSync(Path.join(projectPath, bookAbbr));
  for (var currentChapterFile of currentFolderChapters) {
    let currentChapter = Path.parse(currentChapterFile).name;
    if (!parseInt(currentChapter)) continue;
    try {
      let currentChapterObject = fs.readJSONSync(Path.join(projectPath, bookAbbr, currentChapterFile));
      let fileContents = JSON.stringify(currentChapterObject);
      if (~fileContents.indexOf('<<<<<<<')) {
        return true;
      }
    } catch (e) { }
  }
  return false;
}

export function migrateAppsToDotApps(projectPath) {
  let projectDir = fs.readdirSync(projectPath);
  if (projectDir.includes('apps') && projectDir.includes('.apps')) {
    fs.removeSync(Path.join(projectPath, '.apps'))
  }
  if (projectDir.includes('apps')) {
    fs.renameSync(Path.join(projectPath, 'apps'), Path.join(projectPath, '.apps'));
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
  if (isOldTestament(bookAbbr)) {
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
export function getIDsFromUSFM(usfmObject) {
  let bookAbbr, bookName, id, name, direction;
  bookAbbr = bookName = id = name = '';
  direction = 'ltr';
  let headerIDArray = [];
  try {
    /** Conditional to determine how USFM should be parsed*/
    let isSpaceDelimited = usfmObject.headers.id.split(" ").length > 1;
    let isCommaDelimited = usfmObject.headers.id.split(",").length > 1;
    if (isCommaDelimited) {
      /**i.e. TIT, gux_Gourmanchéma_ltr, EN_ULB, Thu Jul 20 2017 16:03:48 GMT-0700 (PDT), tc */
      headerIDArray = usfmObject.headers.id.split(",");
    }
    else if (isSpaceDelimited) {
      /**i.e. TIT EN_ULB sw_Kiswahili_ltr Wed Jul 26 2017 22:14:55 GMT-0700 (PDT) tc */
      headerIDArray = usfmObject.headers.id.split(" ");
    }
    else {
      /**i.e. EPH */
      bookAbbr = usfmObject.headers.id.toLowerCase();
      bookName = convertToFullBookName(bookAbbr);
      return { bookAbbr, bookName, id, name, direction };
    }

    bookAbbr = headerIDArray[0].trim().toLowerCase();
    bookName = convertToFullBookName(bookAbbr);

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
          id = languageCodeArray[0].toLowerCase();
          name = languageCodeArray[1];
          direction = languageCodeArray[2].toLowerCase();
        }
      }
    }
  } catch (e) {
    /** Suspecting error to be caught on non-standard formatting.
     * Cannot do much here expect for deem USFM unusable
     */
    console.warn(e);
    return null;
  }
  return { bookAbbr, bookName, id, name, direction };
}