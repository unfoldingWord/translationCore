/* eslint-disable no-async-promise-executor */
import fs from 'fs-extra';
import path from 'path-extra';
import { batchActions } from 'redux-batched-actions';
import { getTranslate, getCurrentToolName } from '../selectors';
import {
  loadToolsInDir,
  getInvalidCountForTool,
  isInvalidationAlertDisplaying,
} from '../helpers/toolHelper';
import {
  WORD_ALIGNMENT,
  TRANSLATION_WORDS,
  TRANSLATION_NOTES,
  PROJECT_CHECKDATA_DIRECTORY,
  ALERT_SELECTIONS_INVALIDATED_ID,
  ALERT_SELECTIONS_INVALIDATED_MSG,
  ALERT_ALIGNMENTS_RESET_ID,
  ALERT_ALIGNMENTS_RESET_MSG,
  ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG,
} from '../common/constants';
import {
  filterAndSort,
  generatePathToDataItems,
} from '../helpers/checkDataHelpers';
import { readLatestChecks } from '../helpers/groupDataHelpers';
import types from './ActionTypes';
// actions
import * as ModalActions from './ModalActions';
import { openAlertDialog, closeAlertDialog } from './AlertModalActions';
import * as AlertActions from './AlertActions';
import * as BodyUIActions from './BodyUIActions';
import { loadOlderOriginalLanguageResource } from './OriginalLanguageResourcesActions';

/**
 * Registers a tool that has been loaded from the disk.
 * @param {object} tool - a tc-tool.
 */
const registerTool = tool => ({
  type: types.ADD_TOOL,
  name: tool.name,
  tool,
});

/**
 * Loads the app tools.
 * This puts the tools into redux for later use.
 * @param {string} toolsDir - path to the tools directory
 * @returns {Function}
 */
export const loadTools = (toolsDir) => (dispatch) => {
  // TRICKY: push this off the render thread just for a moment to simulate threading.
  setTimeout(() => {
    loadToolsInDir(toolsDir).then((tools) => {
      for (let i = 0, len = tools.length; i < len; i++) {
        dispatch(registerTool(tools[i]));
      }
    });
  }, 500);
};

/**
 * This function prepares the data needed to load a tool, also
 *  useful for checking the progress of a tool
 * @param {String} name - Name of the tool
 */
export function prepareToolForLoading(name) {
  return async (dispatch) => {
    // Load older version of OL resource if needed by tN tool
    dispatch(loadOlderOriginalLanguageResource(name));
    // wait for filesystem calls to finish
    await dispatch(verifyGroupDataMatchesWithFs(name));
  };
}

/**
 * Opens a tool
 * @param {string} name - the name of the tool to open
 * @returns {Function}
 */
export const openTool = (name) => (dispatch, getData) => new Promise(async (resolve, reject) => {
  console.log('openTool(' + name + ')');
  const translate = getTranslate(getData());
  dispatch(ModalActions.showModalContainer(false));
  dispatch(openAlertDialog(translate('tools.loading_tool_data'), true));

  try {
    dispatch({ type: types.OPEN_TOOL, name });
    await dispatch(prepareToolForLoading(name));
    dispatch(batchActions([
      closeAlertDialog(),
      BodyUIActions.toggleHomeView(false),
    ]));
    dispatch(warnOnInvalidations(name));
  } catch (e) {
    console.warn('openTool()', e);
    dispatch(openAlertDialog(translate('projects.error_setting_up_project', { email: translate('_.help_desk_email') })));
    reject(e);
  }
  resolve();
});

/**
 * check for invalidations in tool and show appropriate warning for tool if there is not already a warning
 * @param {String} toolName
 * @return {Function}
 */
export const warnOnInvalidations = (toolName) => (dispatch, getState) => {
  try {
    const state = getState();
    const alertAlreadyDisplayed = isInvalidationAlertDisplaying(state, toolName);

    if (!alertAlreadyDisplayed) {
      const numInvalidChecks = getInvalidCountForTool(state, toolName);

      if (numInvalidChecks) {
        console.log(`warnOnInvalidations(${toolName}) - numInvalidChecks: ${numInvalidChecks} - showing alert`);
        const showAlignmentsInvalidated = toolName === WORD_ALIGNMENT;
        dispatch(showInvalidatedWarnings(!showAlignmentsInvalidated, showAlignmentsInvalidated));
      }
    } else {
      console.log(`warnOnInvalidations(${toolName}) - already showing alert`);
    }
  } catch (e) {
    console.warn('warnOnInvalidations() - error getting invalid checks', e);
  }
};

/**
 * Verifies that the data in the checkdata folder is reflected in the menu.
 * @return {object} action object.
 */
export function verifyGroupDataMatchesWithFs(toolName) {
  console.log('verifyGroupDataMatchesWithFs()');
  return ((dispatch, getState) => {
    const state = getState();
    toolName = toolName || getCurrentToolName(state);
    const PROJECT_SAVE_LOCATION = state.projectDetailsReducer.projectSaveLocation;
    let checkDataPath;

    if (PROJECT_SAVE_LOCATION) {
      checkDataPath = path.join(
        PROJECT_SAVE_LOCATION,
        PROJECT_CHECKDATA_DIRECTORY
      );
    }

    const checkVerseEdits = {};

    // build the batch
    let actionsBatch = [];

    if (fs.existsSync(checkDataPath)) {
      let folders = fs.readdirSync(checkDataPath).filter(folder => folder !== '.DS_Store');
      const isCheckTool = (toolName === TRANSLATION_WORDS || toolName === TRANSLATION_NOTES);

      for (let i = 0, lenF = folders.length; i < lenF; i++) {
        const folderName = folders[i];
        const isVerseEdit = folderName === 'verseEdits';
        const isCheckVerseEdit = isCheckTool && isVerseEdit;
        let dataPath = generatePathToDataItems(state, PROJECT_SAVE_LOCATION, folderName);

        if (!fs.existsSync(dataPath)) {
          continue;
        }

        let chapters = fs.readdirSync(dataPath);
        chapters = filterAndSort(chapters);

        for (let j = 0, lenC = chapters.length; j < lenC; j++) {
          const chapterFolder = chapters[j];
          const chapterDir = path.join(dataPath, chapterFolder);

          if (!fs.existsSync(chapterDir)) {
            continue;
          }

          let verses = fs.readdirSync(chapterDir);
          verses = filterAndSort(verses);

          for (let k = 0, lenV = verses.length; k < lenV; k++) {
            const verseFolder = verses[k];
            let filePath = path.join(dataPath, chapterFolder, verseFolder);
            let latestObjects = readLatestChecks(filePath);

            for (let l = 0, lenO = latestObjects.length; l < lenO; l++) {
              const object = latestObjects[l];
              const contextId = object.contextId;

              if (isCheckVerseEdit) {
                // special handling for check external verse edits, save edit verse
                const chapter = (contextId && contextId.reference && contextId.reference.chapter);

                if (chapter) {
                  const verse = contextId.reference.verse;

                  if (verse) {
                    const verseKey = chapter + ':' + verse; // save by chapter:verse to remove duplicates

                    if (!checkVerseEdits[verseKey]) {
                      const reference = {
                        bookId: contextId.reference.bookId,
                        chapter,
                        verse,
                      };
                      checkVerseEdits[verseKey] = { reference };
                    }
                  }
                }
              }
            }
          }
        }
      }

      // run the batch of queue actions
      if (actionsBatch.length) {
        console.log('verifyGroupDataMatchesWithFs() - processing batch size: ' + actionsBatch.length);
        dispatch(batchActions(actionsBatch));
      }
      console.log('verifyGroupDataMatchesWithFs() - done');
    }
  });
}

/**
 * displays warning that selections, alignments, or both have been invalidated
 * @param {boolean} showSelectionInvalidated
 * @param {boolean} showAlignmentsInvalidated
 * @param {Function|Null} callback - optional callback after OK button clicked
 * @return {Function}
 */
export const showInvalidatedWarnings = (showSelectionInvalidated, showAlignmentsInvalidated,
  callback = null) => (dispatch, getState) => {
  let message = null;
  let id = null;

  if (showSelectionInvalidated && showAlignmentsInvalidated) {
    message = ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG;
    id = ALERT_ALIGNMENTS_RESET_ID;
  } else if (showSelectionInvalidated) {
    message = ALERT_SELECTIONS_INVALIDATED_MSG;
    id = ALERT_SELECTIONS_INVALIDATED_ID;
  } else { // (showAlignmentsInvalidated)
    message = ALERT_ALIGNMENTS_RESET_MSG;
    id = ALERT_ALIGNMENTS_RESET_ID;
  }

  const translate = getTranslate(getState());
  dispatch(AlertActions.openIgnorableAlert(id, translate(message), { onConfirm: callback }));
};
