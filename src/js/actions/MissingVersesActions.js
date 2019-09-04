import path from 'path-extra';
import fs from 'fs-extra';
import * as ProjectImportStepperActions from '../actions/ProjectImportStepperActions';
import * as MissingVersesHelpers from '../helpers/ProjectValidation/MissingVersesHelpers';
import * as BibleHelpers from '../helpers/bibleHelpers';
import consts from './ActionTypes';
const MISSING_VERSES_NAMESPACE = 'missingVersesCheck';

/**
 * Wrapper action for handling missing verse detection, and
 * storing result in reducer. Returns false under step namespace
 * if check is passed
 */
export function validate() {
  return ((dispatch, getState) => {
    let { projectSaveLocation, manifest } = getState().projectDetailsReducer;

    if (!manifest.project || !manifest.project.id || !projectSaveLocation) {
      return;
    }

    let missingVerses = MissingVersesHelpers.findMissingVerses(projectSaveLocation, manifest.project.id);

    if (Object.keys(missingVerses).length > 0) {
      dispatch({
        type: consts.MISSING_VERSES_CHECK,
        verses: missingVerses,
        bookName: BibleHelpers.convertToFullBookName(manifest.project.id),
      });
      dispatch(ProjectImportStepperActions.addProjectValidationStep(MISSING_VERSES_NAMESPACE));
    }
  });
}

/**
 * Called by the naviagation component on the next button click for the
 * corresponding step. Should handle anything that happens before moving
 * on from this check
 */
export function finalize() {
  return ((dispatch, getState) => {
    let { projectSaveLocation, manifest } = getState().projectDetailsReducer;
    let missingVerses = MissingVersesHelpers.findMissingVerses(projectSaveLocation, manifest.project.id);

    if (Object.keys(missingVerses).length > 0) {
      const bookAbbr = manifest.project.id;

      for ( let chapterNum of Object.keys(missingVerses)) {
        const chapterPath = path.join(projectSaveLocation, bookAbbr, chapterNum + '.json');
        let chapterJSONObject = {};

        if (fs.existsSync(chapterPath)) {
          try {
            chapterJSONObject = fs.readJSONSync(chapterPath);
          } catch (e) {
            console.error(`Failed to parse chapter json from ${chapterPath}`, e);
          }
        }

        for (let missingVerse of missingVerses[chapterNum]) {
          chapterJSONObject[missingVerse.toString()] = '';
        }
        fs.outputJsonSync(chapterPath, chapterJSONObject, { spaces: 2 });
      }
    }
    dispatch(ProjectImportStepperActions.removeProjectValidationStep(MISSING_VERSES_NAMESPACE));
    dispatch(ProjectImportStepperActions.updateStepperIndex());
  });
}
