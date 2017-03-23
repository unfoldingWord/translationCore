import consts from '../actions/CoreActionConsts';
import {generateTimestamp} from '../helpers/index';

export const toggleReminder = (userName) => {
    return {
        type: consts.TOGGLE_REMINDER,
        modifiedTimestamp: generateTimestamp(),
        userName
    }
}