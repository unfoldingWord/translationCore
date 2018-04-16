import types from './ActionTypes';
import isEqual from 'deep-equal';
// actions
import * as AlertModalActions from './AlertModalActions';
// helpers
import {generateTimestamp} from '../helpers/index';
import {checkSelectionOccurrences} from '../helpers/selectionHelpers';
import {getTranslate, getUsername, getSelections} from '../selectors';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';
import {generateLoadPath, readJsonDataFromFolder} from "./CheckDataLoadActions";

/**
 * This method adds a selection array to the selections reducer.
 * @param {Array} selections - An array of selections.
 * @param {String} userName - The username of the author of the selection.
 * @param {Boolean} invalidated - if true then selection if flagged as invalidated, otherwise it is not flagged as invalidated
 * @return {Object} - An action object, consisting of a timestamp, action type,
 *                    a selection array, and a username.
 */
export const changeSelections = (selections, userName, invalidated = false) => {
  return ((dispatch, getState) => {
    const contextId = getState().contextIdReducer.contextId;
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());

    dispatch({
      type: types.CHANGE_SELECTIONS,
      modifiedTimestamp: generateTimestamp(),
      gatewayLanguageCode,
      gatewayLanguageQuote,
      selections,
      userName
    });
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

    dispatch(validateAllSelectionsForVerse(targetVerse, results));
    if (results.selectionsChanged) {
      const translate = getTranslate(getState());
      dispatch(AlertModalActions.openAlertDialog(translate('tools.selections_invalidated')));

    }
  };
}

export const validateAllSelectionsForVerse = (targetVerse, results) => {
  return (dispatch, getState) => {
    const state = getState();
    const username = getUsername(state);
    const contextId = state.contextIdReducer.contextId;
    const groupsDataForVerse = getGroupDataForVerse(state, contextId);

    for (let groupItemKey of Object.keys(groupsDataForVerse)) {
      const groupItem = groupsDataForVerse[groupItemKey];
      for (let occurrenceKey of Object.keys(groupItem)) {
        const checkingOccurrence = groupItem[occurrenceKey];
        const selections = checkingOccurrence.selections;
        let validSelections = checkSelectionOccurrences(targetVerse, selections);
        if (selections.length !== validSelections.length) {
          results.selectionsChanged = true;
          dispatch(changeSelections(validSelections, username, true));
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
  for (let groupItemKey of Object.keys(groupsData)) {
    const groupItem = groupsData[groupItemKey];
    for (let occurrenceKey of Object.keys(groupItem)) {
      const checkingOccurrence = groupItem[occurrenceKey];
      if (isEqual(checkingOccurrence.contextId.reference, contextId.reference)) {
        if (!filteredGroupData[groupItemKey]) {
          filteredGroupData[groupItemKey] = [];
        }
        filteredGroupData[groupItemKey].push(checkingOccurrence);
      }
    }
  }
  return filteredGroupData;
};

