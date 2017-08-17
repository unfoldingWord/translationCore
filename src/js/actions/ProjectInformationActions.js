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

export function finalize() {
  return ((dispatch, getState) => {
    dispatch(ProjectValidationActions.removeProjectValidationStep(PROJECT_INFORMATION_NAMESPACE));
  })
}