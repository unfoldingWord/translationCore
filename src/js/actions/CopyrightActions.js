import consts from './ActionTypes';
const COPYRIGHT_NAMESPACE = 'copyrightCheck';
import * as ProjectValidationActions from '../actions/ProjectValidationActions';
/**
 * Wrapper action for handling copyright detection, and 
 * storing result in reducer. Returns false under step namespace
 * if check is passed
 */
export function validate() {
  return ((dispatch) => {
    dispatch({
      type: consts.COPYRIGHT_CHECK
    })
  })
}

export function finalize() {
  return ((dispatch, getState) => {
    dispatch(ProjectValidationActions.removeProjectValidationStep(COPYRIGHT_NAMESPACE));
  })
}