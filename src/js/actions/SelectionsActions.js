import consts from '../actions/CoreActionConsts';
import {generateTimestamp} from '../helpers/index';

/**
 * @description This method adds a selection array to the selections reducer.
 * @param {Array} selection - An array of selections.
 * @param {String} userName - The username of the author of the selection.
 * @return {Object} - An action object, consiting of a timestamp, action type,
 *                    a selection array, and a username.
 ******************************************************************************/
export const addSelections = (selection, userName) => {
  return {
    type: consts.ADD_SELECTIONS,
    modifiedTimestamp: generateTimestamp(),
    selection,
    userName
  };
};

/**
 * @description This method removes the selection array from the selections reducer.
 * @param {String} userName - The username of the author of the selection.
 * @return {Object} - An action object, consiting of a timestamp, action type,
 *                    and a username.
 ******************************************************************************/
export const removeSelections = userName => {
  return {
    type: consts.REMOVE_SELECTIONS,
    modifiedTimestamp: generateTimestamp(),
    userName
  };
};
