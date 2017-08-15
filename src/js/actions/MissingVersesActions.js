import consts from './ActionTypes';
import * as MissingVersesHelpers from '../helpers/MissingVersesHelpers'

export function validate(state) {
  let { projectSaveLocation, manifest } = state.projectDetailsReducer;
  let missingVerses = MissingVersesHelpers.findMissingVerses(projectSaveLocation, manifest.project.id);
  if (missingVerses) {
    return {
      type: consts.MISSING_VERSES_CHECK,
      payload: {
        verses: missingVerses
      }
    }
  } else return {
    type: consts.MISSING_VERSES_CHECK,
    payload:false
  }
}