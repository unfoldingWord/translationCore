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
    let validSelections = checkSelectionOccurrences(targetVerse, selections);
    let results = {
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

export function validateAllSelectionsForVerse(targetVerse, results) {
  return (dispatch, getState) => {
    const state = getState();
    const username = getUsername(state);
    const loadPath = generateLoadPath(state.projectDetailsReducer, state.contextIdReducer, 'selections');
    const selectionData = readJsonDataFromFolder(loadPath);
    const recentSelections = {};
    for (let selection of selectionData) {
      const contextID = selection.contextId;
      if (!recentSelections[contextID.groupId]) {
        recentSelections[contextID.groupId] = {};
      }
      if (!recentSelections[contextID.groupId][contextID.occurrence]) {
        recentSelections[contextID.groupId][contextID.occurrence] = selection;
      }
    }
    for (let key in recentSelections) {
      const checkingItem = recentSelections[key];
      for (let occurrenceKey of Object.keys(checkingItem)) {
        const checkingOccurrence = checkingItem[occurrenceKey];
        const selections = checkingOccurrence.selections;
        let validSelections = checkSelectionOccurrences(targetVerse, selections);
        if (selections.length !== validSelections.length) {
          results.selectionsChanged = true;
          dispatch(changeSelections(validSelections, username, true));
        }
      }
    }
  };
}
