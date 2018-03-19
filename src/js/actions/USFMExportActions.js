import types from './ActionTypes';
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
import {getTranslate} from '../selectors';

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
      return dispatch(AlertModalActions.openAlertDialog(translate('projects.merge_export_error')));
    }
    dispatch(BodyUIActions.dimScreen(true));
    setTimeout(() => {
      try {
        /**Last place the user saved usfm */
        const usfmSaveLocation = getState().settingsReducer.usfmSaveLocation;
        /**Name of project*/
        let projectName = exportHelpers.getUsfmExportName(manifest);
        /**File path from file chooser*/
        let filePath = exportHelpers.getFilePath(projectName, usfmSaveLocation, 'usfm');
        /**Getting new project name to save incase the user changed the save file name*/
        projectName = path.parse(filePath).base.replace('.usfm', '');
        /** Saving the location for future exports */
        dispatch(storeUSFMSaveLocation(filePath, projectName));
        // do not show dimmed screen
        dispatch(BodyUIActions.dimScreen(false));
        const cancelledTitle = translate('home.project.save.export_canceled');
        const loadingTitle = translate('projects.exporting_file_alert', {file_name: projectName});
        dispatch(displayLoadingUSFMAlert(filePath, projectName, cancelledTitle, loadingTitle));
        /**Usfm text converted to a JSON object with book/chapter/verse*/
        let usfmJSONObject = setUpUSFMJSONObject(projectPath);
        writeUSFMJSONToFS(filePath, usfmJSONObject);
        const usfmFileName = projectName + '.usfm';
        const message = translate('projects.exported_alert', {project_name: projectName, file_path: usfmFileName});
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
  if (!fs.existsSync(path.join(projectPath, bookName)))
    TargetLanguageActions.generateTargetBibleFromTstudioProjectPath(projectPath, manifest);

  let usfmJSONObject = {};
  let currentFolderChapters = fs.readdirSync(path.join(projectPath, bookName));
  for (let currentChapterFile of currentFolderChapters) {
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
  return { chapters: usfmJSONObject, headers: exportHelpers.getHeaderTags(projectPath) };
}

/**
 *
 * @param {string} filePath - File path to the specified usfm export save location
 * @param {string} projectName - Name of the project being exported (This can be altered by the user
 * when saving)
 */
export function storeUSFMSaveLocation(filePath, projectName) {
  return {
    type: types.SET_USFM_SAVE_LOCATION,
    usfmSaveLocation: filePath.split(projectName)[0]
  };
}

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
