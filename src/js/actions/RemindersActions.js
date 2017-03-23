import consts from '../actions/CoreActionConsts';
import {generateTimestamp} from '../helpers/index';

/**
 * @description Toggles the reminder to true or false
 * @param {String} userName - The username of who toggled the reminder 
 */
export const toggleReminder = (userName) => {
    return {
        type: consts.TOGGLE_REMINDER,
        modifiedTimestamp: generateTimestamp(),
        userName
    }
}