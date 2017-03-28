import consts from '../actions/CoreActionConsts';
import {generateTimestamp} from '../helpers/index';
/**
 * @description this action changes the contextId to the current check.
 * @param {object} contextId - the contextId object.
 * @return {object} New state for contextId reducer.
 */
export const changeCurrentContextId = (contextId) => {
  return {
    type: consts.CHANGE_CURRENT_CONTEXT_ID,
    contextId
  };
};
