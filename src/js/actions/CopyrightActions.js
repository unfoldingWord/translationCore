import consts from './ActionTypes';
/**
 * Wrapper action for handling copyright detection, and 
 * storing result in reducer. Returns false under step namespace
 * if check is passed
 */
export function validate() {
  return {
    type:consts.COPYRIGHT_CHECK
  }
}