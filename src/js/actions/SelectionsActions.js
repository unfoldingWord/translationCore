import types from './ActionTypes';
// actions
import * as AlertModalActions from './AlertModalActions';
// helpers
import {generateTimestamp} from '../helpers/index';
import {checkSelectionOccurrences} from '../helpers/selectionHelpers';
import {getTranslate, getUsername, getSelections} from '../selectors';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';

/**
 * This method adds a selection array to the selections reducer.
 * @param {Array} selections - An array of selections.
 * @param {String} userName - The username of the author of the selection.
 * @return {Object} - An action object, consiting of a timestamp, action type,
 *                    a selection array, and a username.
 */
export const changeSelections = (selections, userName) => {
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
    const translate = getTranslate(getState());
    const username = getUsername(getState());
    const selections = getSelections(getState());
    let validSelections = checkSelectionOccurrences(targetVerse, selections);
    if (selections.length !== validSelections.length) {
      dispatch(changeSelections(validSelections, username));
      dispatch(AlertModalActions.openAlertDialog(translate('tools.selections_invalidated')));
    }
  };
}
