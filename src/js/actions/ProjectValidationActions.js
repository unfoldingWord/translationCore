import consts from './ActionTypes';
//actions
import git from '../helpers/GitApi.js';
import * as LoadHelpers from '../helpers/LoadHelpers';
import * as ProjectSelectionActions from './ProjectSelectionActions';
import * as TargetLanguageActions from '../actions/TargetLanguageActions';
import * as ProjectDetailsActions from './projectDetailsActions';

import * as CopyrightActions from './CopyrightActions';
import * as ProjectInformationActions from './ProjectInformationActions';
import * as MergeConflictActions from './MergeConflictActions';
import * as MissingVersesActions from './MissingVersesActions';

/**Names for the index of steps */
const projectValidationStepIndex = [
  'Previous',
  'Copyright',
  'Project Information',
  'Merge Conflicts',
  'Missing Verses',
  'Done'
]

export function changeProjectValidationInstructions(instructions) {
  return {
    type: consts.CHANGE_PROJECT_VALIDATION_INSTRUCTIONS,
    instructions
  };
}
/**
 * Wrapper function for handling the initial checking of steps before the UI is displayed.
 * NOTE: All step checks must be synchronous actions
 * @param {function} callback - Called when the checks for each step are complete, has 
 * value of true or false depending on is all checks passed
 */
export function validateProject(callback) {
  return ((dispatch, getState) => {
    const state = getState();
    dispatch(CopyrightActions.validate());
    dispatch(ProjectInformationActions.validate())
    dispatch(MergeConflictActions.validate(state));
    dispatch(MissingVersesActions.validate());

    dispatch(updateCheckValidation());
  });
}

export function updateCheckValidation() {
  return ((dispatch, getState) => {
    let stepsToShowObject = {};
    let { projectSaveLocation, manifest } = getState().projectDetailsReducer;
    let { projectValidationStepsObject } = getState().projectValidationReducer;
    let isValidProjectIndex = Object.keys(projectValidationStepsObject).findIndex((stepName) => {
      return projectValidationStepsObject[stepName] !== false;
    });
    if (isValidProjectIndex === -1) {
      TargetLanguageActions.generateTargetBible(projectSaveLocation, {}, manifest);
      dispatch(ProjectSelectionActions.displayTools());
    } else {
      dispatch(goToProjectValidationStep(isValidProjectIndex + 1));
    }
  })
}

export function goToNextProjectValidationStep() {
  return ((dispatch, getState) => {
    let { stepIndex } = getState().projectValidationReducer.stepper;
    dispatch(goToProjectValidationStep(stepIndex + 1));
  })
}

export function goToPreviousProjectValidationStep() {
  return ((dispatch, getState) => {
    const { stepIndex } = getState().projectValidationReducer.stepper;
    dispatch(goToProjectValidationStep(stepIndex - 1));
  });
}


/**Directly jump to a step at the specified index */
export function goToProjectValidationStep(stepIndex) {
    let nextStepName = projectValidationStepIndex[stepIndex + 1];
    let previousStepName = projectValidationStepIndex[stepIndex - 1];
    return {
      type: consts.GO_TO_PROJECT_VALIDATION_STEP,
      stepIndex: stepIndex,
      nextStepName: nextStepName,
      previousStepName: previousStepName,
      nextDisabled: false
    }
}

/**Disables and enables next button in project validation stepper */
export function toggleNextButton(nextDisabled) {
  return {
    type: consts.UPDATE_PROJECT_VALIDATION_NEXT_BUTTON_STATUS,
    nextDisabled: nextDisabled
  }
}