//fs modules
import * as fs from 'fs-extra';
import Path from 'path-extra';
//constants
const DEFAULT_SAVE = Path.join(Path.homedir(), 'translationCore', 'projects');
//helpers
import * as LoadHelpers from './LoadHelpers';

/**
 * Retrieves tC manifest and returns it or if not available looks for tS manifest. 
 * If neither are available tC has no way to load the project, unless its a usfm project.
 * @param {string} projectPath - Path location in the filesystem for the project.
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 * @param {string} username - Current username of user logged in.
 */
export function getProjectManifest(projectPath, projectLink, username) {
  let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  let tCManifest = LoadHelpers.loadFile(projectPath, 'tc-manifest.json');
  manifest = manifest || tCManifest;
  if (!manifest || !manifest.tcInitialized) {
    manifest = LoadHelpers.setUpManifest(projectPath, projectLink, manifest, username);
  }
  return manifest;
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
    const defaultManifest = LoadHelpers.setUpDefaultUSFMManifest(parsedUSFM, direction, username);
    manifest = LoadHelpers.saveManifest(projectPath, projectLink, defaultManifest);
  }
  return manifest;
}

/**
 * Gets neccesarry details in order to load a project from usfm that are not available
 * through the standard loading process.
 * @param {string} usfmFilePath - File path to the usfm being selected for the project
 * @return
 */
export function getProjectDetailsFromUSFM(usfmFilePath) {
  const usfmData = LoadHelpers.loadUSFMData(usfmFilePath);
  const parsedUSFM = LoadHelpers.getParsedUSFM(usfmData);
  /** hard coded due to unknown direction type from usfm */
  const direction = 'ltr';
  return { parsedUSFM, direction };
}

/**
 * Sets up and returns a tC project folder in ~/translationCore/{languageID_bookName}/{bookName}.usfm
 * @param {string} usfmFilePath - File path to the usfm being selected for the project
 */
export function setUpUSFMFolderPath(usfmFilePath) {
  const usfmData = LoadHelpers.loadUSFMData(usfmFilePath);
  const parsedUSFM = LoadHelpers.getParsedUSFM(usfmData);
  const {id, bookName, bookAbbr} = LoadHelpers.getIDsFromUSFM(parsedUSFM);
  /**If there is no bookAbbr then ultimately the usfm import should fail */
  if (!bookAbbr) console.warn('No book abbreviation detected in USFM');
  let oldFileName = Path.parse(usfmFilePath).name.toLowerCase();
  let folderNamePrefix = id ? `${id}_${bookAbbr}_` : `${oldFileName}_`;
  let textType = oldFileName.includes('_usfm') ? '' : '_usfm';
  let newUSFMProjectFolder = Path.join(DEFAULT_SAVE, `${folderNamePrefix}${textType}`);
  const newUSFMFilePath = Path.join(newUSFMProjectFolder, bookAbbr) + '.usfm';
  fs.outputFileSync(newUSFMFilePath, usfmData);
  return newUSFMProjectFolder;
}