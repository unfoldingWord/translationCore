import consts from './ActionTypes';
const MISSING_VERSES_NAMESPACE = 'missingVersesCheck';
import * as ProjectValidationActions from '../actions/ProjectValidationActions';
import * as MissingVersesHelpers from '../helpers/MissingVersesHelpers';

/**
 * Wrapper action for handling missing verse detection, and 
 * storing result in reducer. Returns false under step namespace
 * if check is passed
 */
export function validate() {
  return ((dispatch, getState) => {
    let { projectSaveLocation, manifest } = getState().projectDetailsReducer;
    let missingVerses = MissingVersesHelpers.findMissingVerses(projectSaveLocation, manifest.project.id);
    if (missingVerses) {
      dispatch({
        type: consts.MISSING_VERSES_CHECK,
        verses: missingVerses
      })
      dispatch(ProjectValidationActions.addProjectValidationStep(MISSING_VERSES_NAMESPACE));
    }
  })
}

/**
 * Called by the naviagation component on the next button click for the 
 * corresponding step. Should handle anything that happens before moving
 * on from this check
 */
export function finalize() {
  return ((dispatch, getState) => {
    dispatch(ProjectValidationActions.removeProjectValidationStep(MISSING_VERSES_NAMESPACE));
  })
}