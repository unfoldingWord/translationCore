import types from './ActionTypes';
import isEqual from 'deep-equal';
import path from 'path-extra';
import fs from 'fs-extra';
import {checkSelectionOccurrences} from 'selections';
// actions
import * as AlertActions from './AlertActions';
import * as InvalidatedActions from './InvalidatedActions';
import * as CheckDataLoadActions from './CheckDataLoadActions';
import {batchActions} from "redux-batched-actions";
// helpers
import {getTranslate, getUsername, getSelectedToolName} from '../selectors';
import {generateTimestamp} from '../helpers/index';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';
import * as saveMethods from "../localStorage/saveMethods";
import usfm from "usfm-js";

/**
 * This method adds a selection array to the selections reducer.
 * @param {Array} selections - An array of selections.
 * @param {String} userName - The username of the author of the selection.
 * @param {Boolean} invalidated - if true then selection if flagged as invalidated, otherwise it is not flagged as invalidated
 * @param {Object} contextId - optional contextId to use, otherwise will use current
 * @param {Array|null} batchGroupData - if present then add group data actions to this array for later batch operation
 * @return {Object} - An action object, consisting of a timestamp, action type,
 *                    a selection array, and a username.
 */
export const changeSelections = (selections, userName, invalidated = false, contextId = null,
                                 batchGroupData = null) => {
  return ((dispatch, getState) => {
    let state = getState();
    if (getSelectedToolName(state) === 'translationWords' || getSelectedToolName(state) === 'translationNotes') {
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

      const actionsBatch = Array.isArray(batchGroupData) ? batchGroupData  : []; // if batch array passed in then use it, otherwise create new array
      actionsBatch.push({
        type: types.TOGGLE_SELECTIONS_IN_GROUPDATA,
        contextId,
        selections
      });
      actionsBatch.push({
        type: types.SET_INVALIDATION_IN_GROUPDATA,
        contextId,
        boolean: invalidated
      });
      if (!Array.isArray(batchGroupData)) { // if we are not returning batch, then process actions now
        dispatch(batchActions(actionsBatch));
      }
    }
  });
};

/**
 * displays warning that selections have been invalidated
 * @param {Function|Null} callback - optional callback after OK button clicked
 * @return {Function}
 */
export const showSelectionsInvalidatedWarning = (callback = null) => {
  return showInvalidatedWarnings(true, false, callback);
};

/**
 * displays warning that selections, alignments, or both have been invalidated
 * @param {boolean} showSelectionInvalidated
 * @param {boolean} showAlignmentsInvalidated
 * @param {Function|Null} callback - optional callback after OK button clicked
 * @return {Function}
 */
export const showInvalidatedWarnings = (showSelectionInvalidated, showAlignmentsInvalidated,
                                        callback = null) => {
  return (dispatch, getState) => {
    let message = null;
    if (showSelectionInvalidated && showAlignmentsInvalidated) {
      message = 'tools.invalid_verse_alignments_and_selections';
    } else if (showSelectionInvalidated) {
      message = 'tools.selections_invalidated';
    } else { // (showAlignmentsInvalidated)
      message = 'tools.alignments_reset_wa_tool';
    }
    const translate = getTranslate(getState());
    dispatch(AlertActions.openIgnorableAlert('alignments_reset', translate(message), {onConfirm: callback}));
  };
};

/**
 * populates groupData with all groupData entries for groupId and chapter/verse
 * @param {Object} groupsDataReducer
 * @param {String} groupId
 * @param {Number} chapterNumber - optional chapter number of verse text being edited
 * @param {Number} verseNumber - optional verse number of verse text being edited
 * @return {Array} - group data items that match
 */
export const getGroupDataForGroupIdChapterVerse = (groupsDataReducer, groupId, chapterNumber, verseNumber) => {
  const matchedGroupData = [];
  const groupData = groupId &&
    groupsDataReducer && groupsDataReducer.groupsData &&
    groupsDataReducer.groupsData[groupId];
  if (groupData && groupData.length) {
    for (let i = 0, l = groupData.length; i < l; i++) {
      const groupObject = groupData[i];
      if (isEqual(groupObject.contextId.reference.chapter, chapterNumber) &&
        isEqual(groupObject.contextId.reference.verse, verseNumber)) {
        matchedGroupData.push(groupObject);
      }
    }
  }
  return matchedGroupData;
};

/**
 * @description This method validates the current selections to see if they are still valid.
 * @param {String} targetVerse - target bible verse.
 * @param {Object} contextId - optional contextId to use, otherwise will use current
 * @param {Number} chapterNumber - optional chapter number of verse text being edited, if not given will use contextId
 * @param {Number} verseNumber - optional verse number of verse text being edited, if not given will use contextId
 * @param {Boolean} showInvalidation - if true then selections invalidation warning is shown - otherwise just set flag in results
 * @param {object} results - returns state of validations
 * @param {Array|null} batchGroupData - if present then add group data actions to this array for later batch operation
 * @return {Object} - dispatches the changeSelections action.
 */
export const validateSelections = (targetVerse, contextId = null, chapterNumber, verseNumber,
                                   showInvalidation = true, results = {}, batchGroupData = null) => {
  return (dispatch, getState) => {
    const state = getState();
    contextId = contextId || state.contextIdReducer.contextId;
    const { projectSaveLocation, manifest: { project } } = state.projectDetailsReducer;
    const { chapter, verse } = contextId.reference;
    chapterNumber = chapterNumber || chapter;
    verseNumber = verseNumber || verse;
    let selectionInvalidated = false;
    const actionsBatch = Array.isArray(batchGroupData) ? batchGroupData  : []; // if batch array passed in then use it, otherwise create new array

    if (getSelectedToolName(state) === 'translationWords') {
      const username = getUsername(state);
      // for this groupId, find every check for this chapter/verse
      const matchedGroupData = getGroupDataForGroupIdChapterVerse(state.groupsDataReducer, contextId.groupId, chapterNumber, verseNumber);
      for (let i = 0, l = matchedGroupData.length; i < l; i++) {
        const groupObject = matchedGroupData[i];
        const selections = getSelectionsForContextID(projectSaveLocation, groupObject.contextId);
        const validSelections = checkSelectionOccurrences(targetVerse, selections);
        const selectionsChanged = (selections.length !== validSelections.length);
        if (selectionsChanged) {
          dispatch(changeSelections([], username, true, groupObject.contextId, actionsBatch)); // clear selections
        }
        selectionInvalidated = selectionInvalidated || selectionsChanged;
      }
      const results_ = {selectionsChanged: selectionInvalidated};
      dispatch(validateAllSelectionsForVerse(targetVerse, results_, true, contextId, false, actionsBatch));
      selectionInvalidated = selectionInvalidated || results_.selectionsChanged; // if new selections invalidated
    } else if (getSelectedToolName(state) === 'wordAlignment') {
      const bibleId = project.id;
      const selectionsPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'checkData', 'selections', bibleId, chapter.toString(), verse.toString());
      if (fs.existsSync(selectionsPath)) {
        let files = fs.readdirSync(selectionsPath);
        files = files.filter(file => { // filter the filenames to only use .json
          return path.extname(file) === '.json';
        }).sort();

        // load all files keeping the latest for each context
        const latestContext = {};
        for (let i = 0, l = files.length; i < l; i++) {
          const selectionsData = fs.readJsonSync(path.join(selectionsPath, files[i]));
          const contextId = selectionsData.contextId;
          if (contextId) {
            const key = contextId.groupId + ":" + contextId.occurrence + ":" + contextId.quote;
            latestContext[key] = selectionsData;
          }
        }
        const userName = getUsername(state);
        const modifiedTimestamp = generateTimestamp();
        const keys = Object.keys(latestContext);
        for (let j = 0, l = keys.length; j < l; j++) {
          const selectionsData = latestContext[keys[j]];
          const validSelections = checkSelectionOccurrences(targetVerse, selectionsData.selections);
          if (!isEqual(selectionsData.selections, validSelections)) { // if true found invalidated check

            // add invalidation entry
            const newInvalidation = {
              contextId: selectionsData.contextId,
              invalidated: true,
              userName,
              modifiedTimestamp: modifiedTimestamp,
              gatewayLanguageCode: selectionsData.gatewayLanguageCode,
              gatewayLanguageQuote: selectionsData.gatewayLanguageQuote
            };
            const newFilename = modifiedTimestamp + '.json';
            const invalidatedCheckPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'checkData', 'invalidated', bibleId, chapter.toString(), verse.toString());
            fs.ensureDirSync(invalidatedCheckPath);
            fs.outputJSONSync(path.join(invalidatedCheckPath, newFilename.replace(/[:"]/g, '_')), newInvalidation);

            selectionInvalidated = true;
          }
        }
      }
    }
    if (!Array.isArray(batchGroupData)) { // if we are not returning batch, then process actions now
      dispatch(batchActions(actionsBatch));
    }
    results.selectionsChanged = selectionInvalidated;
    if (showInvalidation && selectionInvalidated) {
      dispatch(showSelectionsInvalidatedWarning());
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
 * @param {Array|null} batchGroupData - if present then add group data actions to this array for later batch operation
 * @return {Function}
 */
export const validateAllSelectionsForVerse = (targetVerse, results, skipCurrent = false, contextId = null,
                                              warnOnError = false, batchGroupData = null) => {
  return (dispatch, getState) => {
    const state = getState();
    const username = getUsername(state);
    const initialSelectionsChanged = results.selectionsChanged;
    contextId = contextId || state.contextIdReducer.contextId;
    const groupsDataForVerse = getGroupDataForVerse(state, contextId);
    let filtered = null;
    results.selectionsChanged = false;
    const actionsBatch = Array.isArray(batchGroupData) ? batchGroupData  : []; // if batch array passed in then use it, otherwise create new array

    const groupsDataKeys = Object.keys(groupsDataForVerse);
    for (let i = 0, l = groupsDataKeys.length; i < l; i++) {
      const groupItemKey = groupsDataKeys[i];
      const groupItem = groupsDataForVerse[groupItemKey];
      for (let j = 0, lenGI = groupItem.length; j < lenGI; j++) {
        const checkingOccurrence = groupItem[j];
        const selections = checkingOccurrence.selections;
        if (!skipCurrent || !sameContext(contextId, checkingOccurrence.contextId)) {
          if (selections && selections.length) {
            if (!filtered) {  // for performance, we filter the verse only once and only if there is a selection
              filtered = usfm.removeMarker(targetVerse); // remove USFM markers
            }
            const validSelections = checkSelectionOccurrences(filtered, selections);
            if (selections.length !== validSelections.length) {
              results.selectionsChanged = true;
              dispatch(changeSelections([], username, true,
                                        checkingOccurrence.contextId, actionsBatch)); // clear selection
            }
          }
        }
      }
    }

    if (!Array.isArray(batchGroupData)) { // if we are not returning batch, then process actions now
      dispatch(batchActions(actionsBatch));
    }
    if (warnOnError && (initialSelectionsChanged || results.selectionsChanged)) {
      dispatch(showSelectionsInvalidatedWarning());
    }
  };
};

/**
 * @description gets the group data for the verse reference in contextId from groupsDataReducer
 * @param {Object} state
 * @param {Object} contextId
 * @return {object} group data object.
 */
export const getGroupDataForVerse = (state, contextId) => {
  const {groupsData} = state.groupsDataReducer;
  const filteredGroupData = {};
  if (groupsData) {
    const groupsDataKeys = Object.keys(groupsData);
    for (let i = 0, l = groupsDataKeys.length; i < l; i++) {
      const groupItemKey = groupsDataKeys[i];
      const groupItem = groupsData[groupItemKey];
      if (groupItem) {
        for (let j = 0, l = groupItem.length; j < l; j++) {
          const check = groupItem[j];
          try {
            if (isEqual(check.contextId.reference, contextId.reference)) {
              if (!filteredGroupData[groupItemKey]) {
                filteredGroupData[groupItemKey] = [];
              }
              filteredGroupData[groupItemKey].push(check);
            }
          } catch (e) {
            console.warn(`Corrupt check found in group "${groupItemKey}"`, check);
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
    return isEqual(contextId1.reference, contextId2.reference)
      && (contextId1.groupId === contextId2.groupId)
      && (contextId1.occurrence === contextId2.occurrence);
  }
  return false;
};

/**
 * get selections for context ID
 * @param {Object} contextId - contextId to use in lookup
 * @param {String} projectSaveLocation
 * @return {Array} - selections
 */
export const getSelectionsForContextID = (projectSaveLocation, contextId) => {
  let selections = [];
  let loadPath = CheckDataLoadActions.generateLoadPath({projectSaveLocation}, {contextId}, 'selections');
  let selectionsObject = CheckDataLoadActions.loadCheckData(loadPath, contextId);
  if (selectionsObject) {
    selections = selectionsObject.selections;
  }
  return selections;
};

/**
 * get selections for context ID and return as string
 * @param {Object} contextId - contextId to use in lookup
 * @param {String} projectSaveLocation
 * @return {string}
 */
//  TODO: this is not an action and should be moved elsewhere
export const getSelectionsFromContextId = (contextId, projectSaveLocation) => {
  const selections = getSelectionsForContextID(projectSaveLocation, contextId);
  const selectionsArray = [];
  for (let i = 0, len = selections.length; i < len; i++) {
    const selection = selections[i];
    selectionsArray.push(selection.text);
  }
  return selectionsArray.join(" ");
};

