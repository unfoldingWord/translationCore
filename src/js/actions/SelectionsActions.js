import types from './ActionTypes';
import isEqual from 'deep-equal';
import path from 'path-extra';
import fs from 'fs-extra';
import { checkSelectionOccurrences } from 'selections';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as InvalidatedActions from './InvalidatedActions';
import * as CheckDataLoadActions from './CheckDataLoadActions';
// helpers
import {getTranslate, getUsername, getCurrentToolName} from '../selectors';
import { generateTimestamp } from '../helpers/index';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';
import * as saveMethods from "../localStorage/saveMethods";

/**
 * This method adds a selection array to the selections reducer.
 * @param {Array} selections - An array of selections.
 * @param {String} userName - The username of the author of the selection.
 * @param {Boolean} invalidated - if true then selection if flagged as invalidated, otherwise it is not flagged as invalidated
 * @param {Object} contextId - optional contextId to use, otherwise will use current
 * @return {Object} - An action object, consisting of a timestamp, action type,
 *                    a selection array, and a username.
 */
export const changeSelections = (selections, userName, invalidated = false, contextId = null) => {
  return ((dispatch, getState) => {
    let state = getState();
    if (getCurrentToolName(state) === 'translationWords') {
      const currentContextId = state.contextIdReducer.contextId;
      contextId = contextId || currentContextId; // use current if contextId is not passed
      const {
        gatewayLanguageCode,
        gatewayLanguageQuote
      } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState(), contextId);
      if (sameContext(currentContextId, contextId)) { // see if we need to update current selection
        const modifiedTimestamp = generateTimestamp();
        dispatch({
          type: types.CHANGE_SELECTIONS,
          modifiedTimestamp: modifiedTimestamp,
          gatewayLanguageCode,
          gatewayLanguageQuote,
          selections,
          userName
        });

        dispatch(InvalidatedActions.set(userName, modifiedTimestamp, invalidated));
      } else {
        saveMethods.saveSelectionsForOtherContext(getState(), gatewayLanguageCode, gatewayLanguageQuote, selections, invalidated, userName, contextId);
      }

      dispatch({
        type: types.TOGGLE_SELECTIONS_IN_GROUPDATA,
        contextId,
        selections
      });
      dispatch({
        type: types.SET_INVALIDATION_IN_GROUPDATA,
        contextId,
        boolean: invalidated
      });
    }
  });
};

/**
 * displays warning that selections have been invalidated
 * @return {Function}
 */
export const showSelectionsInvalidatedWarning = () => {
  return (dispatch, getState) => {
    const translate = getTranslate(getState());
    dispatch(AlertModalActions.openAlertDialog(translate('tools.selections_invalidated')));
  };
};

/**
 * @description This method validates the current selections to see if they are still valid.
 * @param {String} targetVerse - target bible verse.
 * @param {Object} contextId - optional contextId to use, otherwise will use current
 * @param {String} chapterNumber - chapter number of verse text being edited
 * @param {String} verseNumber - verse number of verse text being edited
 * @return {Object} - dispatches the changeSelections action.
 */
export const validateSelections = (targetVerse, contextId = null, chapterNumber, verseNumber) => {
  return (dispatch, getState) => {
    const state = getState();
    contextId = contextId || state.contextIdReducer.contextId;
    const { projectSaveLocation, manifest: { project } } = state.projectDetailsReducer;
    const { bookId, chapter, verse } = contextId.reference;

    if (getCurrentToolName(state) === 'translationWords') {
      const username = getUsername(state);
      const selections = getSelectionsFromChapterAndVerseCombo(
        bookId,
        chapterNumber || chapter,
        verseNumber || verse,
        projectSaveLocation
      );
      const validSelections = checkSelectionOccurrences(targetVerse, selections);
      const selectionsChanged = (selections.length !== validSelections.length);
      if (selectionsChanged) {
        dispatch(changeSelections([], username, true, contextId)); // clear selections
      }
      const results = {selectionsChanged: selectionsChanged};
      dispatch(validateAllSelectionsForVerse(targetVerse, results, true, contextId, true));
    } else if (getCurrentToolName(state) === 'wordAlignment') {
      const bibleId = project.id;
      const selectionsPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'checkData', 'selections', bibleId, chapter.toString(), verse.toString());

      if (fs.existsSync(selectionsPath)) {
        let files = fs.readdirSync(selectionsPath);
        files = files.filter(file => { // filter the filenames to only use .json
          return path.extname(file) === '.json';
        });
        const sorted = files.sort().reverse(); // sort the files to use latest
        const filename = sorted[0];
        const selectionsData = fs.readJsonSync(path.join(selectionsPath, filename));
        const validSelections = checkSelectionOccurrences(targetVerse, selectionsData.selections);

        if (!isEqual(selectionsData.selections, validSelections)) { // if true found invalidated check
          const username = getUsername(state);
          const modifiedTimestamp = generateTimestamp();
          const invalidted = {
            contextId: selectionsData.contextId,
            invalidated: true,
            userName: username,
            modifiedTimestamp: modifiedTimestamp,
            gatewayLanguageCode: selectionsData.gatewayLanguageCode,
            gatewayLanguageQuote: selectionsData.gatewayLanguageQuote
          };
          const newFilename = modifiedTimestamp + '.json';
          const invalidatedCheckPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'checkData', 'invalidated', bibleId, chapter.toString(), verse.toString());
          fs.outputJSONSync(path.join(invalidatedCheckPath, newFilename.replace(/[:"]/g, '_')), invalidted);
        }
      }
    }
  };
};

/**
 * verify all selections for current verse
 * @param {string} targetVerse - new text for verse
 * @param {object} results - keeps state of
 * @param {Boolean} skipCurrent - if true, then skip over validation of current contextId
 * @param {Object} contextId - optional contextId to use, otherwise will use current
 * @param {Boolean} warnOnError - if true, then will show message on selection change
 * @return {Function}
 */
export const validateAllSelectionsForVerse = (targetVerse, results, skipCurrent = false, contextId = null, warnOnError = false) => {
  return (dispatch, getState) => {
    const state = getState();
    const username = getUsername(state);
    const initialSelectionsChanged = results.selectionsChanged;
    contextId = contextId || state.contextIdReducer.contextId;
    const groupsDataForVerse = getGroupDataForVerse(state, contextId);
    results.selectionsChanged = false;

    for (let groupItemKey of Object.keys(groupsDataForVerse)) {
      const groupItem = groupsDataForVerse[groupItemKey];
      for (let checkingOccurrence of groupItem) {
        const selections = checkingOccurrence.selections;
        if (!skipCurrent || !sameContext(contextId, checkingOccurrence.contextId)) {
          if (selections && selections.length) {
            const validSelections = checkSelectionOccurrences(targetVerse, selections);
            if (selections.length !== validSelections.length) {
              results.selectionsChanged = true;
              dispatch(changeSelections([], username, true, checkingOccurrence.contextId)); // clear selection
            }
          }
        }
      }
    }

    if (warnOnError && (initialSelectionsChanged || results.selectionsChanged)) {
      dispatch(showSelectionsInvalidatedWarning());
    }
  };
};

/**
 * @description gets the group data for the current verse from groupsDataReducer
 * @param {Object} state
 * @param {Object} contextId
 * @return {object} group data object.
 */
export const getGroupDataForVerse = (state, contextId) => {
  const {groupsData} = state.groupsDataReducer;
  const filteredGroupData = {};
  if (groupsData) {
    for (let groupItemKey of Object.keys(groupsData)) {
      const groupItem = groupsData[groupItemKey];
      if (groupItem) {
        for (let checkingOccurrence of groupItem) {
          if (isEqual(checkingOccurrence.contextId.reference, contextId.reference)) {
            if (!filteredGroupData[groupItemKey]) {
              filteredGroupData[groupItemKey] = [];
            }
            filteredGroupData[groupItemKey].push(checkingOccurrence);
          }
        }
      }
    }
  }
  return filteredGroupData;
};

/**
 * returns true if contextIds are a match for reference and group
 * @param {Object} contextId1
 * @param {Object} contextId2
 * @return {boolean}
 */
export const sameContext = (contextId1, contextId2) => {
  if (!!contextId1 && !!contextId2) {
    return isEqual(contextId1.reference, contextId2.reference) &&
      (contextId1.groupId === contextId2.groupId);
  }
  return false;
};


export const getSelectionsFromContextId = (contextId, projectSaveLocation) => {
  let loadPath = CheckDataLoadActions.generateLoadPath({projectSaveLocation}, {contextId}, 'selections');
  let selectionsObject = CheckDataLoadActions.loadCheckData(loadPath, contextId);
  let selectionsArray = [];

  if (selectionsObject) {
    selectionsObject.selections.forEach((selection) => {
      selectionsArray.push(selection.text);
    });
  }
  return selectionsArray.join(" ");
};


export const getSelectionsFromChapterAndVerseCombo = (bookId, chapter, verse, projectSaveLocation) => {
  let selectionsArray = [];
  let selectionsObject;
  const contextId = {
    reference: {
      bookId,
      chapter,
      verse
    }
  };
  const selectionsPath = CheckDataLoadActions.generateLoadPath({projectSaveLocation}, {contextId}, 'selections');

  if (fs.existsSync(selectionsPath)) {
    let files = fs.readdirSync(selectionsPath);
    files = files.filter(file => { // filter the filenames to only use .json
      return path.extname(file) === '.json';
    });
    const sorted = files.sort().reverse(); // sort the files to use latest
    const filename = sorted[0];
    selectionsObject = fs.readJsonSync(path.join(selectionsPath, filename));
  }

  if (selectionsObject) {
    selectionsArray = selectionsObject.selections;
  }

  return selectionsArray;
};
