import types from './ActionTypes';
import ospath from 'ospath';
import usfm from 'usfm-js';
import fs from 'fs-extra';
import Path from 'path-extra';
import { ipcRenderer } from 'electron';
//helpers
import * as LoadHelpers from '../helpers/LoadHelpers';
//actions
import * as AlertModalActions from './AlertModalActions';
import * as TargetLanguageActions from './TargetLanguageActions';
import * as BodyUIActions from './BodyUIActions';
import * as MergeConflictActions from '../actions/MergeConflictActions';
import * as ProjectImportStepperActions from '../actions/ProjectImportStepperActions';
import {getTranslate} from '../selectors';

//consts
const OSX_DOCUMENTS_PATH = Path.join(ospath.home(), 'Documents');
const WIN_DOCUMENTS_PATH = Path.join(ospath.home(), 'My Documents');

/**
 * Action to initiate an USFM export
 * @param {string} projectPath - Path location in the filesystem for the project.
 */
export function exportToUSFM(projectPath) {
  return ((dispatch, getState) => {
    const translate = getTranslate(getState());
    let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
    dispatch(MergeConflictActions.validate(projectPath, manifest));
    const { conflicts } = getState().mergeConflictReducer;
    if (conflicts) {
      dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
      return dispatch(AlertModalActions.openAlertDialog(translate('home.project.save.merge_conflicts')));
    }
    dispatch(BodyUIActions.dimScreen(true));
    setTimeout(() => {
      try {
        /**Last place the user saved usfm */
        const usfmSaveLocation = getState().settingsReducer.usfmSaveLocation;
        /**Name of project*/
        let projectName = Path.parse(projectPath).base;
        /**File path from save dialog*/
        const title = translate('home.project.save.export_usfm_as');
        let filePath = getFilePath(projectName, usfmSaveLocation, title);
        /**Getting new projet name to save incase the user changed the save file name*/
        projectName = Path.parse(filePath).base.replace('.usfm', '');
        // do not show dimmed screen
        dispatch(BodyUIActions.dimScreen(false));
        const cancelledTitle = translate('home.project.save.export_canceled');
        const loadingTitle = translate('home.project.save.exporting_file', {file: projectName});
        dispatch(displayLoadingUSFMAlert(filePath, projectName, cancelledTitle, loadingTitle));
        /**Usfm text converted to a JSON object with book/chapter/verse*/
        let usfmJSONObject = setUpUSFMJSONObject(projectPath);
        writeUSFMJSONToFS(filePath, usfmJSONObject);
        const usfmFileName = projectName + '.usfm';
        const message = translate('home.project.save.file_exported', {file: usfmFileName});
        dispatch(AlertModalActions.openAlertDialog(message, false));
      } catch (err) {
        // do not show dimmed screen
        dispatch(BodyUIActions.dimScreen(false));
        dispatch(AlertModalActions.openAlertDialog(err.message || err, false));
      }
    }, 200);
  });
}

/**
 * Wrapper function to save a USFM JSON object to the filesystem
 * @param {string} filePath - File path to the specified usfm export save location
 * @param {object} usfmJSONObject - Usfm text converted to a JSON object with book/chapter/verse
 */
export function writeUSFMJSONToFS(filePath, usfmJSONObject) {
  let usfmData = usfm.toUSFM(usfmJSONObject);
  fs.outputFileSync(filePath, usfmData);
}

/**
 * Method to set up a usfm JSON object and write it to the FS.
 * @param {string} projectPath - Path location in the filesystem for the project.
 */
export function setUpUSFMJSONObject(projectPath) {
  let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  let bookName = manifest.project.id;
  if (!fs.existsSync(Path.join(projectPath, bookName)))
    TargetLanguageActions.generateTargetBibleFromProjectPath(projectPath, manifest);

  let usfmJSONObject = {};
  let currentFolderChapters = fs.readdirSync(Path.join(projectPath, bookName));
  for (var currentChapterFile of currentFolderChapters) {
    let currentChapter = Path.parse(currentChapterFile).name;
    let chapterNumber = parseInt(currentChapter);
    /**Skipping on non-number keys*/
    if (!chapterNumber) continue;
    let currentChapterObject = fs.readJSONSync(Path.join(projectPath, bookName, currentChapterFile));
    Object.keys(currentChapterObject).forEach((ele) => { currentChapterObject[ele] = [currentChapterObject[ele]] });
    usfmJSONObject[chapterNumber] = currentChapterObject;
  }
  return { chapters: usfmJSONObject, headers: { id: getUSFMIdTag(projectPath, manifest, bookName) } };
}

/**
 *
 * @param {string} filePath - File path to the specified usfm export save location
 * @param {string} projectName - Name of the project being exported (This can be altered by the user
 * @param {string} cancelledTitle
 * @param {string} loadingTitle
 * when saving)
 */
export function displayLoadingUSFMAlert(filePath, projectName, cancelledTitle, loadingTitle) {
  return ((dispatch) => {
    if (!filePath) {
      dispatch(AlertModalActions.openAlertDialog(cancelledTitle, false));
      return;
    } else {
      dispatch({ type: types.SET_USFM_SAVE_LOCATION, usfmSaveLocation: filePath.split(projectName)[0] });
    }
    dispatch(AlertModalActions.openAlertDialog(loadingTitle, true));
  });
}

/**
 * Prompts the user to enter a location/name to save the usfm project.
 * Returns the path to save.
 * @param {string} projectName - Name of the project being exported (This can be altered by the user
 * when saving)
 * @param {string} usfmSaveLocation - The last save loccation from the user. Coming from the settings reducer.
 * @param {string} title the title of the save dialog
 */
export function getFilePath(projectName, usfmSaveLocation, title) {
  /**Path to save the usfm file @type {string}*/
  let defaultPath;
  if (usfmSaveLocation) {
    /**trys default save location first then trys different OS's */
    defaultPath = Path.join(usfmSaveLocation, projectName + '.usfm');
  }
  else if (fs.existsSync(OSX_DOCUMENTS_PATH)) {
    defaultPath = Path.join(OSX_DOCUMENTS_PATH, projectName + '.usfm');
  } else if (fs.existsSync(WIN_DOCUMENTS_PATH)) {
    defaultPath = Path.join(WIN_DOCUMENTS_PATH, projectName + '.usfm');
  }
  else {
    defaultPath = Path.join(ospath.home(), projectName + '.usfm');
  }
  return ipcRenderer.sendSync('save-as', { options: { defaultPath: defaultPath, filters: [{ extensions: ['usfm'] }], title: title } });
}

/**
 * This function uses the manifest to populate the usfm JSON object id key in preparation
 * of usfm to JSON conversion
 * @param {string} projectPath - Path location in the filesystem for the project.
 * @param {object} manifest - Metadata of the project details
 * @param {string} bookName - Book abbreviation for book to be converted
 */
export function getUSFMIdTag(projectPath, manifest, bookName) {
  /**Has fields such as "language_id": "en" and "resource_id": "ulb" and "direction":"ltr"*/
  let sourceTranslation = manifest.source_translations[0];
  let resourceName = sourceTranslation && sourceTranslation.language_id && sourceTranslation.resource_id ?
    `${sourceTranslation.language_id.toUpperCase()}_${sourceTranslation.resource_id.toUpperCase()}` :
    'N/A';
  /**This will look like: ar_العربية_rtl to be included in the usfm id.
   * This will make it easier to read for tC later on */
  let targetLanguageCode = manifest.target_language ?
    `${manifest.target_language.id}_${manifest.target_language.name}_${manifest.target_language.direction}` :
    'N/A';
  /**Date object when project was las changed in FS */
  let lastEdited = fs.statSync(Path.join(projectPath), bookName).atime;
  let bookNameUppercase = bookName.toUpperCase();
  /**Note the indication here of tc on the end of the id. This will act as a flag to ensure the correct parsing*/
  return `${bookNameUppercase} ${resourceName} ${targetLanguageCode} ${lastEdited} tc`;
}
