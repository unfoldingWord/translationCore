import consts from '../actions/CoreActionConsts';
import {generateTimestamp} from '../helpers/index';

/**
 * @description This method adds a selection array to the selections reducer.
 * @param {Array} selection - An array of selections.
 * @param {String} userName - The username of the author of the selection.
 * @return {Object} - An action object, consiting of a timestamp, action type,
 *                    a selection array, and a username.
 ******************************************************************************/
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
