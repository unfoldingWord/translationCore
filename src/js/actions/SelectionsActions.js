import types from './ActionTypes';
import isEqual from 'deep-equal';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as InvalidatedActions from './InvalidatedActions';
// helpers
import {generateTimestamp} from '../helpers/index';
import {checkSelectionOccurrences} from '../helpers/selectionHelpers';
import {getTranslate, getUsername, getSelections} from '../selectors';
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
    const currentContextId = getState().contextIdReducer.contextId;
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
      saveMethods.saveSelectionsForOtherContext(gatewayLanguageCode, gatewayLanguageQuote, selections, invalidated, userName, contextId);
    }

    dispatch({
      type: types.TOGGLE_SELECTIONS_IN_GROUPDATA,
      contextId,
      selections
    });
    dispatch({
      type: types.SET_INVALIDATION_IN_GROUPDATA,
      contextId,
      invalidated
    });
  });
};
/**
 * @description This method validates the current selections to see if they are still valid.
 * @param {String} targetVerse - target bible verse.
 * @return {Object} - dispatches the changeSelections action.
 */
export function validateSelections(targetVerse) {
  return (dispatch, getState) => {
    const username = getUsername(getState());
    const selections = getSelections(getState());
    const validSelections = checkSelectionOccurrences(targetVerse, selections);
    const results = {
      selectionsChanged: (selections.length !== validSelections.length)
    };
    if (results.selectionsChanged) {
      dispatch(changeSelections(validSelections, username, true));
    }

    dispatch(validateAllSelectionsForVerse(targetVerse, results, true));
    if (results.selectionsChanged) {
      const translate = getTranslate(getState());
      dispatch(AlertModalActions.openAlertDialog(translate('tools.selections_invalidated')));
    }
  };
}

/**
 * verify all selections for current verse
 * @param {string) targetVerse - new text for verse
 * @param {object) results - keeps state of
 * @param {Boolean} skipCurrent - if true, then skip over validation of current contextId
 * @return {Function}
 */
export const validateAllSelectionsForVerse = (targetVerse, results, skipCurrent) => {
  return (dispatch, getState) => {
    const state = getState();
    const username = getUsername(state);
    const contextId = state.contextIdReducer.contextId;
    const groupsDataForVerse = getGroupDataForVerse(state, contextId);

    for (let groupItemKey of Object.keys(groupsDataForVerse)) {
      const groupItem = groupsDataForVerse[groupItemKey];
      for (let checkingOccurrence of groupItem) {
        const selections = checkingOccurrence.selections;
        if (!skipCurrent || !sameContext(contextId, checkingOccurrence.contextId)) {
          if (selections && selections.length) {
            const validSelections = checkSelectionOccurrences(targetVerse, selections);
            if (selections.length !== validSelections.length) {
              results.selectionsChanged = true;
              dispatch(changeSelections(validSelections, username, true, checkingOccurrence.contextId));
            }
          }
        }
      }
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
  const  { groupsData } = state.groupsDataReducer;
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
  return isEqual(contextId1.reference, contextId2.reference) &&
    (contextId1.groupId === contextId2.groupId);
};

