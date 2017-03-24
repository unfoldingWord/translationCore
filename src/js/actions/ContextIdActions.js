import consts from '../actions/CoreActionConsts';
import {generateTimestamp} from '../helpers/index';
/**
 * @description this action changes the contextId to the current check.
 * @param {object} contextId - the contextId object.
 * @return {object} New state for contextId reducer.
 */
export const changeContextId = (contextId) => {
  return {
    type: consts.CHANGE_CONTEXT_ID,
    contextId
  };
};
