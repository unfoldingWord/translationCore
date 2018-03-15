import React from 'react';
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
import * as WordAlignmentActions from './WordAlignmentActions';
import { setSetting } from '../actions/SettingsActions';
//helpers
import * as exportHelpers from '../helpers/exportHelpers';
import { getTranslate } from '../selectors';
import * as WordAlignmentHelpers from '../helpers/WordAlignmentHelpers';
//components
import USFMExportDialog from '../components/dialogComponents/USFMExportDialog';

/**
 * Action to initiate an USFM export
 * @param {string} projectPath - Path location in the filesystem for the project.
 */
export function exportToUSFM(projectPath) {
  return (async (dispatch, getState) => {
    const translate = getTranslate(getState());
    /** Check project for merge conflicts */
    const manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
    dispatch(MergeConflictActions.validate(projectPath, manifest));
    const { conflicts } = getState().mergeConflictReducer;
    if (conflicts) {
      /** If project has merge conflicts it cannot be imported */
      dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
      return dispatch(AlertModalActions.openAlertDialog(translate('home.project.save.merge_conflicts')));
    }
    try {
      const exportType = await dispatch(getExportTypeFromProject(projectPath));
      dispatch(BodyUIActions.dimScreen(true));
      setTimeout(async () => {
        /**Last place the user saved usfm */
        const usfmSaveLocation = getState().settingsReducer.usfmSaveLocation;
        /**Name of project*/
        let projectName = exportHelpers.getUsfmExportName(manifest);
        /**File path from electron file chooser*/
        const filePath = exportHelpers.getFilePath(projectName, usfmSaveLocation, 'usfm');
        if (filePath) {
          /**Getting new project name to save incase the user changed the save file name*/
          projectName = path.parse(filePath).base.replace('.usfm', '');
          const loadingTitle = translate('home.project.save.exporting_file', { file: projectName });
          dispatch(displayLoadingUSFMAlert(filePath, projectName, loadingTitle));
          /** Saving the location for future exports */
          dispatch(storeUSFMSaveLocation(filePath, projectName));
          if (exportType === 'usfm2') {
            /**Usfm text converted to a JSON object with book/chapter/verse*/
            const usfmJSONObject = setUpUSFMJSONObject(projectPath);
            writeUSFMJSONToFSSync(filePath, usfmJSONObject);
          } else if (exportType === 'usfm3') {
            await WordAlignmentActions.exportWordAlignmentData(projectPath, filePath);
          }
          dispatch(displayUSFMExportFinishedDialog(projectName));
        }
      }, 200);
    } catch (err) {
      debugger;
      if (err) dispatch(AlertModalActions.openAlertDialog(err.message || err, false));
    }
    dispatch(BodyUIActions.dimScreen(false));
  });
}

export function displayUSFMExportFinishedDialog(projectName) {
  return ((dispatch, getState) => {
    const translate = getTranslate(getState());
    const usfmFileName = projectName + '.usfm';
    const message = translate('home.project.save.file_exported', { file: usfmFileName });
    dispatch(AlertModalActions.openAlertDialog(message, false));
  });
}

export function getExportTypeFromProject(projectPath) {
  return ((dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const { wordAlignmentDataPath, projectTargetLanguagePath, chapters } = WordAlignmentHelpers.getAlignmentPathsFromProject(projectPath);
      if (!wordAlignmentDataPath || !projectTargetLanguagePath || !chapters) return 'usfm2';
      else {
        const onSelect = (choice) => dispatch(setSetting('usfmExportType', choice));
        dispatch(AlertModalActions.openOptionDialog(<USFMExportDialog onSelect={onSelect} />, (res) => {
          if (res === 'Export') {
            const { usfmExportType } = getState().settingsReducer.currentSettings;
            resolve(usfmExportType);
          } else {
            reject();
          }
          dispatch(AlertModalActions.closeAlertDialog());
        }, 'Cancel', 'Export'));
      }
    });
  });
}

/**
 * Wrapper function to save a USFM JSON object to the filesystem
 * @param {string} filePath - File path to the specified usfm export save location
 * @param {object} usfmJSONObject - Usfm text converted to a JSON object with book/chapter/verse
 */
export function writeUSFMJSONToFSSync(filePath, usfmJSONObject) {
  const usfmData = usfm.toUSFM(usfmJSONObject);
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
  if (projectName)
    return {
      type: types.SET_USFM_SAVE_LOCATION,
      usfmSaveLocation: filePath.split(projectName)[0]
    };
}

export function displayLoadingUSFMAlert(filePath, projectName, loadingTitle) {
  return ((dispatch) => {
    dispatch({ type: types.SET_USFM_SAVE_LOCATION, usfmSaveLocation: filePath.split(projectName)[0] });
    dispatch(AlertModalActions.openAlertDialog(loadingTitle, true));
  });
}
