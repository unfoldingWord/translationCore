/**
 * @module Actions/GroupsData
 */
import { batchActions } from 'redux-batched-actions';
import fs from 'fs-extra';
import path from 'path-extra';
import isEqual from 'deep-equal';
import { getSelectedToolName } from '../selectors';
import { readLatestChecks } from '../helpers/groupDataHelpers';
import { TRANSLATION_NOTES, TRANSLATION_WORDS } from '../common/constants';
import consts from './ActionTypes';
import { showSelectionsInvalidatedWarning, validateAllSelectionsForVerse } from './SelectionsActions';
import { ensureCheckVerseEditsInGroupData } from './VerseEditActions';
// consts declaration
const CHECKDATA_DIRECTORY = path.join('.apps', 'translationCore', 'checkData');

/**
 * @description This action adds a groupId as a property to the
 *  groups object and assigns payload as its value.
 * @param {string} groupId - groupId of object ex. figs_metaphor.
 * @param {array} groupsData - array of objects containing group data.
 * @return {object} action object.
 */
export const addGroupData = (groupId, groupsData) => ({
  type: consts.ADD_GROUP_DATA,
  groupId,
  groupsData,
});

/**
 * make sure context IDs are for same verse.  Optimized over isEqual()
 * @param {Object} contextId1
 * @param {Object} contextId2
 * @return {boolean} returns true if context IDs are for same verse
 */
export function isSameVerse(contextId1, contextId2) {
  return (contextId1.reference.chapter === contextId2.reference.chapter) &&
    (contextId1.reference.verse === contextId2.reference.verse);
}

/**
 * searches groupData for a match for contextId (groupData must be for same groupId)
 * @param {Object} contextId
 * @param {Array} groupData for same groupId as contextId
 * @return {number} - returns index of match or -1
 */
export const findGroupDataItem = (contextId, groupData) => {
  let index = -1;
  const isQuoteString = typeof contextId.quote === 'string';

  for (let i = groupData.length - 1; i >= 0; i--) {
    const grpContextId = groupData[i].contextId;

    if (isSameVerse(grpContextId, contextId) &&
      (grpContextId.occurrence === contextId.occurrence) &&
      (isQuoteString ? (grpContextId.quote === contextId.quote) :
        isEqual(grpContextId.quote, contextId.quote))) {
      index = i;
      break;
    }
  }
  return index;
};

/**
 * get value for check attribute and compare with old value - tricky because there is no consistency in field names and representation of value for checks
 * @param {Object} object
 * @param {String} checkAttr
 * @param {Object} oldGroupObject
 * @return {Boolean} true if value has changed
 */
export function isAttributeChanged(object, checkAttr, oldGroupObject) {
  const oldValue = oldGroupObject[checkAttr];
  let value;

  switch (checkAttr) {
  case 'reminders':
    value = !!object['enabled']; // just want true if enabled
    return value !== !!oldValue; // compare boolean equivalents
  case 'comments':
    value = object['text'];
    return value ? (value !== oldValue) : (!value !== !oldValue); // if text set, do exact match.  Otherwise compare boolean equivalents
  case 'invalidated':
    value = !!object[checkAttr]; // just want true if set
    return value !== !!oldValue; // compare boolean equivalents
  case 'selections': {
    // first check for changes in nothingToSelect
    const oldSelectNothing = oldGroupObject['nothingToSelect'];
    const newSelectNothing = object['nothingToSelect'];
    let changed = (!oldSelectNothing !== !newSelectNothing); // compare boolean equivalents

    if (!changed) { // if no change in nothingToSelect, then compare selections
      value = object[checkAttr];
      const hasSelection = value && value.length;

      if (hasSelection) {
        changed = !isEqual(value, oldValue);
      } else {
        const hasOldSelection = oldValue && oldValue.length;
        changed = (!hasSelection !== !hasOldSelection); // compare boolean equivalents of has selections
      }
    }

    return changed;
  }
  case 'verseEdits':
    return true !== !!oldValue; // TRICKY: verse edit is special case since its value is always true
  default: // put warning in log that this check attribute is not supported
    console.log(`isValueChanged() - unsupported check attribute: ${checkAttr}`);
    return false;
  }
}

/**
 * @description verifies that the data in the checkdata folder is reflected in the menu.
 * @return {object} action object.
 */
export function verifyGroupDataMatchesWithFs(toolName) {
  console.log('verifyGroupDataMatchesWithFs()');
  return (async (dispatch, getState) => {
    const state = getState();
    toolName = toolName || getSelectedToolName(state);
    const PROJECT_SAVE_LOCATION = state.projectDetailsReducer.projectSaveLocation;
    let checkDataPath;

    if (PROJECT_SAVE_LOCATION) {
      checkDataPath = path.join(
        PROJECT_SAVE_LOCATION,
        CHECKDATA_DIRECTORY
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
              } else if (contextId.tool === toolName) {
                // TRICKY: make sure item is in reducer before trying to set.  In case of tN different GLs
                //  may have different checks
                const currentGroupData = state.groupsDataReducer.groupsData[object.contextId.groupId];

                if (currentGroupData) {
                  const index = findGroupDataItem(object.contextId, currentGroupData);
                  const oldGroupObject = (index >= 0) ? currentGroupData[index] : null;

                  if (oldGroupObject) {
                    // only toggle if attribute values are different (folderName contains check attribute such as 'selections`)
                    const isChanged = isAttributeChanged(object, folderName, oldGroupObject);

                    if (isChanged) {
                      // TRICKY: we are using the contextId of oldGroupObject here because sometimes
                      //            there are slight differences with the contextIds of the checkData due to build
                      //            changes (such as quoteString) and getToggledGroupData() requires exact match
                      object.contextId = oldGroupObject.contextId;
                      const action = toggleGroupDataItems(folderName, object);

                      if (action) {
                        actionsBatch.push(action);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (Object.keys(checkVerseEdits).length) {
        await dispatch(ensureCheckVerseEditsInGroupData(checkVerseEdits));
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
 * verifies all the selections for current book to make sure they are still valid
 */
export function validateBookSelections() {
  return ((dispatch, getState) => {
    // iterate through target chapters and validate selections
    const results = { selectionsChanged: false };
    const { projectDetailsReducer } = getState();
    const targetBiblePath = path.join(projectDetailsReducer.projectSaveLocation, projectDetailsReducer.manifest.project.id);
    const files = fs.readdirSync(targetBiblePath);

    for (let file of files) {
      const chapter = parseInt(file); // get chapter number

      if (chapter) {
        dispatch(validateChapterSelections(chapter, results));
      }
    }

    if (results.selectionsChanged) {
      dispatch(showSelectionsInvalidatedWarning());
    }
  });
}

/**
 * verifies all the selections for chapter to make sure they are still valid.
 * This expects the book resources to have already been loaded.
 * Books are loaded when a project is selected.
 * @param {String} chapter
 * @param {Object} results - for keeping track if any selections have been reset.
 */
function validateChapterSelections(chapter, results) {
  return ((dispatch, getState) => {
    let changed = results.selectionsChanged; // save initial state
    const state = getState();

    if (state.resourcesReducer && state.resourcesReducer.bibles && state.resourcesReducer.bibles.targetLanguage && state.resourcesReducer.bibles.targetLanguage.targetBible) {
      const bibleChapter = state.resourcesReducer.bibles.targetLanguage.targetBible[chapter];

      if (bibleChapter) {
        for (let verse of Object.keys(bibleChapter)) {
          const verseText = bibleChapter[verse];
          const contextId = {
            reference: {
              bookId: state.projectInformationCheckReducer.bookId,
              chapter: parseInt(chapter),
              verse: parseInt(verse),
            },
          };
          results.selectionsChanged = false;
          dispatch(validateAllSelectionsForVerse(verseText, results, false, contextId));
          changed = changed || results.selectionsChanged;
        }
      }
    }
    results.selectionsChanged = changed;
  });
}

/**
 * @description generates a path to a check data item.
 * @param {object} state - redux store state.
 * @param {string} PROJECT_SAVE_LOCATION - project path/directory.
 * @param {string} checkDataName - comments, reminders, selections and verseEdits folders.
 * @return {string} path/directory to be use to load a file.
 */
export function generatePathToDataItems(state, PROJECT_SAVE_LOCATION, checkDataName) {
  if (PROJECT_SAVE_LOCATION && state) {
    let bookAbbreviation = state.projectDetailsReducer.manifest.project.id;
    let loadPath = path.join(
      PROJECT_SAVE_LOCATION,
      CHECKDATA_DIRECTORY,
      checkDataName,
      bookAbbreviation
    );
    return loadPath;
  }
}
/**
 * @description filters and sorts an array.
 * @param {array} array - array to be filtered and sorted.
 * @return {array} filtered and sorted array.
 */
export function filterAndSort(array) {
  let filteredArray = array.filter(folder => folder !== '.DS_Store').sort((a, b) => {
    a = parseInt(a, 10);
    b = parseInt(b, 10);
    return a - b;
  });
  return filteredArray;
}

/**
 * @description dispatches appropiate action based on label string.
 * @param {string} label - string to be use to determine which action to dispatch.
 * @param {object} fileObject - checkdata object.
 * @param {function} dispatch - redux action dispatcher.
 */
export function toggleGroupDataItems(label, fileObject) {
  let action;

  switch (label) {
  case 'comments':
    action = {
      type: consts.TOGGLE_COMMENTS_IN_GROUPDATA,
      contextId: fileObject.contextId,
      text: fileObject.text,
    };
    break;
  case 'reminders':
    action = {
      type: consts.SET_REMINDERS_IN_GROUPDATA,
      contextId: fileObject.contextId,
      boolean: fileObject.enabled,
    };
    break;
  case 'selections':
    action = {
      type: consts.TOGGLE_SELECTIONS_IN_GROUPDATA,
      contextId: fileObject.contextId,
      selections: fileObject.selections,
      nothingToSelect: fileObject.nothingToSelect,
    };
    break;
  case 'verseEdits':
    action = {
      type: consts.TOGGLE_VERSE_EDITS_IN_GROUPDATA,
      contextId: fileObject.contextId,
    };
    break;
  case 'invalidated':
    action = {
      type: consts.SET_INVALIDATION_IN_GROUPDATA,
      contextId: fileObject.contextId,
      boolean: fileObject.invalidated,
    };
    break;
  default:
    action = null;
    console.warn('Undefined label in toggleGroupDataItems switch');
    break;
  }
  return action;
}
