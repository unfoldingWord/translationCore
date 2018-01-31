import consts from './ActionTypes';
import usfm from 'usfm-js';
import fs from 'fs-extra';
import path from 'path-extra';
//helpers
import * as LoadHelpers from '../helpers/LoadHelpers';
//actions
import * as AlertModalActions from './AlertModalActions';
import * as TargetLanguageActions from './TargetLanguageActions';
import * as BodyUIActions from './BodyUIActions';
import * as MergeConflictActions from '../actions/MergeConflictActions';
import * as ProjectImportStepperActions from '../actions/ProjectImportStepperActions';
//helpers
import * as exportHelpers from '../helpers/exportHelpers';
import * as VerseObjectHelpers from '../helpers/VerseObjectHelpers';

/**
 * Action to initiate an USFM export
 * @param {string} projectPath - Path location in the filesystem for the project.
 */
export function exportToUSFM(projectPath) {
  return ((dispatch, getState) => {
    let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
    dispatch(MergeConflictActions.validate(projectPath, manifest));
    const { conflicts } = getState().mergeConflictReducer;
    if (conflicts) {
      dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
      return dispatch(AlertModalActions.openAlertDialog(
        `This project has merge conflicts and cannot be exported.
      Select the project to resolve merge conflicts, then try again.`));
    }
    dispatch(BodyUIActions.dimScreen(true));
    setTimeout(() => {
      try {
        /**Last place the user saved usfm */
        const usfmSaveLocation = getState().settingsReducer.usfmSaveLocation;
        /**Name of project*/
        let projectName = path.parse(projectPath).base;
        /**File path from file chooser*/
        let filePath = exportHelpers.getFilePath(projectName, usfmSaveLocation, 'usfm');
        /**Getting new projet name to save incase the user changed the save file name*/
        projectName = path.parse(filePath).base.replace('.usfm', '');
        /** Saving the location for future exports */
        dispatch(storeUSFMSaveLocation(filePath, projectName));
        // do not show dimmed screen
        dispatch(BodyUIActions.dimScreen(false));
        dispatch(AlertModalActions.openAlertDialog("Exporting " + projectName + " Please wait...", true));
        /**Usfm text converted to a JSON object with book/chapter/verse*/
        let usfmJSONObject = setUpUSFMJSONObject(projectPath);
        writeUSFMJSONToFS(filePath, usfmJSONObject);
        dispatch(AlertModalActions.openAlertDialog(projectName + ".usfm has been successfully exported.", false));
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
  if (!fs.existsSync(path.join(projectPath, bookName)))
    TargetLanguageActions.generateTargetBibleFromProjectPath(projectPath, manifest);

  let usfmJSONObject = {};
  let currentFolderChapters = fs.readdirSync(path.join(projectPath, bookName));
  for (var currentChapterFile of currentFolderChapters) {
    let currentChapter = path.parse(currentChapterFile).name;
    let chapterNumber = parseInt(currentChapter);
    /**Skipping on non-number keys*/
    if (!chapterNumber) continue;
    let verseObjects = {};
    let currentChapterObject = fs.readJSONSync(path.join(projectPath, bookName, currentChapterFile));
    Object.keys(currentChapterObject).forEach((verseNumber) => {
      verseObjects[verseNumber] = { verseObjects: [] };
      verseObjects[verseNumber].verseObjects.push({
        "text": currentChapterObject[verseNumber],
        "type": "text"
      });
    });
    usfmJSONObject[chapterNumber] = verseObjects;
  }
  return { chapters: usfmJSONObject, headers: [ getUSFMIdTag(projectPath, manifest, bookName) ] };
}

/**
 *
 * @param {string} filePath - File path to the specified usfm export save location
 * @param {string} projectName - Name of the project being exported (This can be altered by the user
 * when saving)
 */
export function storeUSFMSaveLocation(filePath, projectName) {
  return {
    type: consts.SET_USFM_SAVE_LOCATION, 
    usfmSaveLocation: filePath.split(projectName)[0]
  };
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
  let lastEdited = fs.statSync(path.join(projectPath), bookName).atime;
  let bookNameUppercase = bookName.toUpperCase();
  /**Note the indication here of tc on the end of the id. This will act as a flag to ensure the correct parsing*/
  return {
    "content": `${bookNameUppercase} ${resourceName} ${targetLanguageCode} ${lastEdited} tc`,
    "tag": "id"
  };
}
