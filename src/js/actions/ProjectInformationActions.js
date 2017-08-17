import consts from './ActionTypes';
const PROJECT_INFORMATION_NAMESPACE = 'projectInformationCheck';
import * as ProjectValidationActions from '../actions/ProjectValidationActions';
/**
 * Wrapper action for handling project information detection, and 
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

/**
 * Called by the naviagation component on the next button click for the 
 * corresponding step. Should handle anything that happens before moving
 * on from this check
 */
export function finalize() {
  return ((dispatch, getState) => {
    dispatch(ProjectValidationActions.removeProjectValidationStep(PROJECT_INFORMATION_NAMESPACE));
  })
}