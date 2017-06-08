import consts from './ActionTypes';
import {generateTimestamp} from '../helpers/index';
import {checkSelectionOccurrences} from '../helpers/selectionHelpers';
import * as AlertModalActions from './AlertModalActions';

/**
 * @description This method adds a selection array to the selections reducer.
 * @param {Array} selections - An array of selections.
 * @param {String} userName - The username of the author of the selection.
 * @return {Object} - An action object, consiting of a timestamp, action type,
 *                    a selection array, and a username.
 */
export const changeSelections = (selections, userName) => {
  return ((dispatch, getState) => {
    let state = getState()
    let contextId = state.contextIdReducer.contextId

    dispatch({
      type: consts.CHANGE_SELECTIONS,
      modifiedTimestamp: generateTimestamp(),
      selections,
      userName
    });
    dispatch({
      type: consts.TOGGLE_SELECTIONS_IN_GROUPDATA,
      contextId,
      selections
    });
  });
};
/**
 * @description This method validates the current selections to see if they are still valid.
 * @param {String} targetVerse - target bible verse.
 * @return {Object} - dipatches the changeSelections action.
 */
export function validateSelections(targetVerse) {
  return ((dispatch, getState) => {
    const state = getState();
    let {username} = state.loginReducer.userdata;
    let {selections} = state.selectionsReducer;
    let validSelections = checkSelectionOccurrences(targetVerse, selections);
    if (selections.length !== validSelections.length) {
      dispatch(changeSelections(validSelections, username));
      dispatch(AlertModalActions.openAlertDialog('Some selections are no longer valid and are removed.'));
    }
  });
}
