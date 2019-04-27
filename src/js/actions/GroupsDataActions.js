/**
 * @module Actions/GroupsData
 */
import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
import {showSelectionsInvalidatedWarning, validateAllSelectionsForVerse} from "./SelectionsActions";
// consts declaration
const CHECKDATA_DIRECTORY = path.join('.apps', 'translationCore', 'checkData');

/**
 * @description This action adds a groupId as a property to the
 *  groups object and assigns payload as its value.
 * @param {string} groupId - groupId of object ex. figs_metaphor.
 * @param {array} groupsData - array of objects containing group data.
 * @return {object} action object.
 */
export const addGroupData = (groupId, groupsData) => {
  return {
    type: consts.ADD_GROUP_DATA,
    groupId,
    groupsData
  };
};

/**
 * verifies all the selections for current book to make sure they are still valid
 */
export function validateBookSelections() {
  return ((dispatch, getState) => {
    // iterate through target chapters and validate selections
    const results = {selectionsChanged: false};
    const {projectDetailsReducer} = getState();
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
              verse: parseInt(verse)
            }
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
  let filteredArray = array.filter(folder => {
    return folder !== ".DS_Store";
  }).sort((a, b) => {
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
    case "comments":
      action = {
        type: consts.TOGGLE_COMMENTS_IN_GROUPDATA,
        contextId: fileObject.contextId,
        text: fileObject.text
      };
      break;
    case "reminders":
      action = {
        type: consts.SET_REMINDERS_IN_GROUPDATA,
        contextId: fileObject.contextId,
        boolean: fileObject.enabled
      };
      break;
    case "selections":
      action = {
        type: consts.TOGGLE_SELECTIONS_IN_GROUPDATA,
        contextId: fileObject.contextId,
        selections: fileObject.selections
      };
      break;
    case "verseEdits":
      action = {
        type: consts.TOGGLE_VERSE_EDITS_IN_GROUPDATA,
        contextId: fileObject.contextId
      };
      break;
    case "invalidated":
      action = {
        type: consts.SET_INVALIDATION_IN_GROUPDATA,
        contextId: fileObject.contextId,
        boolean: fileObject.invalidated
      };
      break;
    default:
      action = null;
      console.warn("Undefined label in toggleGroupDataItems switch");
      break;
  }
  return action;
}
