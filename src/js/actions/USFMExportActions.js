/* eslint-disable no-async-promise-executor */
import React from 'react';
import usfm from 'usfm-js';
import fs from 'fs-extra';
import path from 'path-extra';
//components
import USFMExportDialog from '../components/dialogComponents/USFMExportDialog';
//actions
import * as MergeConflictActions from '../actions/MergeConflictActions';
import { setSetting } from '../actions/SettingsActions';
import migrateProject from '../helpers/ProjectMigration';
//helpers
import * as LoadHelpers from '../helpers/LoadHelpers';
import { delay } from '../common/utils';
import * as exportHelpers from '../helpers/exportHelpers';
import { getTranslate, getUsername } from '../selectors';
import * as WordAlignmentHelpers from '../helpers/WordAlignmentHelpers';
import { generateTargetBibleFromTstudioProjectPath } from '../helpers/TargetLanguageHelpers';
import * as WordAlignmentActions from './WordAlignmentActions';
import * as BodyUIActions from './BodyUIActions';
import * as AlertModalActions from './AlertModalActions';
import types from './ActionTypes';

/**
 * Action to initiate an USFM export
 * @param {string} projectPath - Path location in the filesystem for the project.
 */
export function exportToUSFM(projectPath) {
  return ((dispatch, getState) => new Promise(async (resolve, reject) => {
    // Check project for merge conflicts
    console.log('exportToUSFM(' + projectPath + ')');
    const manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
    let projectName = exportHelpers.getUsfmExportName(manifest);

    try {
      console.log('exportToUSFM() - checking for merge conflict');
      await dispatch(checkProjectForMergeConflicts(projectPath, manifest));
      console.log('exportToUSFM() - prompting for export options');
      // Will be 'usfm2' if no alignments else takes users choice
      const exportType = await dispatch(getExportType(projectPath));
      //Running migrations before exporting to attempt to fix any invalid alignments/usfm
      await migrateProject(projectPath, null, getUsername(getState()));
      let usfmExportFile;
      console.log('exportToUSFM() - loading USFM');
      dispatch(displayLoadingUSFMAlert(manifest));
      await delay(0);

      if (exportType === 'usfm2') {
        console.log('exportToUSFM() - getting USFM2');
        usfmExportFile = getUsfm2ExportFile(projectPath);
      } else if (exportType === 'usfm3') {
        console.log('exportToUSFM() - getting USFM3');
        // Exporting to usfm3 also checking for invalidated alignments
        usfmExportFile = await dispatch(WordAlignmentActions.getUsfm3ExportFile(projectPath));
      }
      dispatch(AlertModalActions.closeAlertDialog());
      // Last place the user saved usfm
      const usfmSaveLocation = getState().settingsReducer.usfmSaveLocation;
      // File path from electron file chooser
      console.log('exportToUSFM() - getting output file path');
      dispatch(BodyUIActions.dimScreen(true));
      const filePath = await exportHelpers.getFilePath(projectName, usfmSaveLocation, 'usfm');
      dispatch(BodyUIActions.dimScreen(false));
      // Getting new project name to save in case the user changed the save file name
      projectName = path.parse(filePath).base.replace('.usfm', '');
      // Saving the location for future exports
      dispatch(storeUSFMSaveLocation(filePath, projectName));
      console.log('exportToUSFM() - writing usfm to: ' + filePath);
      fs.writeFileSync(filePath, usfmExportFile);
      dispatch(displayUSFMExportFinishedDialog(projectName));
      console.log('exportToUSFM() - USFM export finished');
      resolve();
    } catch (err) {
      console.log('exportToUSFM() - ERROR:', err);
      dispatch(BodyUIActions.dimScreen(false));
      const translate = getTranslate(getState());
      const message = translate('projects.export_failed_error', { error: err.message || err });
      dispatch(AlertModalActions.openAlertDialog(message, false));
      reject(err);
    }
    dispatch(BodyUIActions.dimScreen(false));
  }));
}

/**
 * Checks given project for merge conflicts
 * @param {string} projectPath - full path to the project to be checked.
 * @param {Object} manifest - manifest of the project to be checked.
 * @returns {Promise}
 */
export function checkProjectForMergeConflicts(projectPath, manifest) {
  return ((dispatch, getState) => new Promise((resolve, reject) => {
    const translate = getTranslate(getState());
    //Using the validate function to run requred processes to check for merge conflicts
    dispatch(MergeConflictActions.validate(projectPath, manifest));
    const { conflicts } = getState().mergeConflictReducer;

    if (conflicts) {
      /** Clearing merge conflicts for future import */
      dispatch({ type: types.CLEAR_MERGE_CONFLICTS_REDUCER });
      dispatch({ type: types.RESET_PROJECT_VALIDATION_REDUCER });
      /** If project has merge conflicts it cannot be imported */
      reject(translate('projects.merge_export_error'));
    } else {
      resolve();
    }
  }));
}

/**
 * @param {string} projectName - Name of project being exported i.e. en_tit_ulb
 */
export function displayUSFMExportFinishedDialog(projectName) {
  return ((dispatch, getState) => {
    const translate = getTranslate(getState());
    const usfmFileName = projectName + '.usfm';
    const message = translate('projects.exported_alert', { project_name: projectName, file_path: usfmFileName });
    dispatch(AlertModalActions.openAlertDialog(message, false));
  });
}

/**
 * Checks the given project for which type to be exported
 * If the given project has no alignments then it will return usfm2
 * Else it is up to the user to choose.
 * @param {string} projectPath - Path of the project to check for type while being exported.
 * @returns {'usfm' | 'usfm3'}
 */
export function getExportType(projectPath) {
  return ((dispatch, getState) => new Promise((resolve, reject) => {
    const { wordAlignmentDataPath, chapters } = WordAlignmentHelpers.getAlignmentPathsFromProject(projectPath);
    const projectHasAlignments = WordAlignmentHelpers.checkProjectForAlignments(wordAlignmentDataPath, chapters);

    if (!projectHasAlignments) {
      return resolve('usfm2');
    } else {
      const onSelect = (choice) => dispatch(setSetting('usfmExportType', choice));

      dispatch(AlertModalActions.openOptionDialog(
        <USFMExportDialog
          onSelect={onSelect}
          translate={getTranslate(getState())}
          selected={projectHasAlignments ? 'usfm3' : 'usfm2'}
        />,
        (res) => {
          if (res === 'Export') {
            const { usfmExportType } = getState().settingsReducer.currentSettings;
            resolve(usfmExportType);
          } else {
            //used to cancel the entire process
            reject();
          }
          dispatch(AlertModalActions.closeAlertDialog());
        }, 'Export', 'Cancel'));
    }
  }));
}

/**
 * Wrapper function to convert a USFM JSON object to usfm 2
 * @param {string} projectPath - Path location in the filesystem for the project.
 */
export function getUsfm2ExportFile(projectPath) {
  const usfmJSONObject = setUpUSFMJSONObject(projectPath);
  return usfm.toUSFM(usfmJSONObject, { forcedNewLines: true });
}

/**
 * Method to set up a usfm JSON object and write it to the FS.
 * @param {string} projectPath - Path location in the filesystem for the project.
 */
export function setUpUSFMJSONObject(projectPath) {
  let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  exportHelpers.makeSureUsfm3InHeader(projectPath, manifest);
  let bookName = manifest.project.id;

  if (!fs.existsSync(path.join(projectPath, bookName))) {
    generateTargetBibleFromTstudioProjectPath(projectPath, manifest);
  }

  let usfmJSONObject = {};
  let currentFolderChapters = fs.readdirSync(path.join(projectPath, bookName));

  for (let currentChapterFile of currentFolderChapters) {
    let currentChapter = path.parse(currentChapterFile).name;
    let chapterNumber = parseInt(currentChapter);

    /**Skipping on non-number keys*/
    if (!chapterNumber) {
      continue;
    }

    let verseObjects = {};
    let currentChapterObject = fs.readJSONSync(path.join(projectPath, bookName, currentChapterFile));

    Object.keys(currentChapterObject).forEach((verseNumber) => {
      verseObjects[verseNumber] = { verseObjects: [] };
      verseObjects[verseNumber].verseObjects.push({
        'text': currentChapterObject[verseNumber] + '\n',
        'type': 'text',
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
    usfmSaveLocation: filePath.split(projectName)[0],
  };
}

/**
 * @param {Object} manifest - The manifest for the project being exported
 */
export function displayLoadingUSFMAlert(manifest) {
  return ((dispatch, getState) => {
    const translate = getTranslate(getState());
    /** Name of project i.e. 57-TIT.usfm */
    let projectName = exportHelpers.getUsfmExportName(manifest);
    const loadingTitle = translate('projects.exporting_file_alert', { file_name: projectName });
    dispatch(AlertModalActions.openAlertDialog(loadingTitle, true));
  });
}
