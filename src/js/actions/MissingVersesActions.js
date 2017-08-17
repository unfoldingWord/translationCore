import consts from './ActionTypes';
const MISSING_VERSES_NAMESPACE = 'missingVersesCheck';
import * as ProjectValidationActions from '../actions/ProjectValidationActions';
/**
 * Wrapper action for handling missing verse detection, and 
 * storing result in reducer. Returns false under step namespace
 * if check is passed
 */
export function validate() {
  return ((dispatch) => {
    dispatch({
      type: consts.MISSING_VERSES_CHECK
    })
  })
}

/**
 * 
 */
export function finalize() {
  return ((dispatch, getState) => {
    dispatch(ProjectValidationActions.removeProjectValidationStep(MISSING_VERSES_NAMESPACE));
  })
}