import consts from './ActionTypes';
//actions
import git from '../helpers/GitApi.js';

import * as LoadHelpers from '../helpers/LoadHelpers';
import * as ProjectSelectionActions from './ProjectSelectionActions';
import * as ProjectDetailsActions from './projectDetailsActions';
import * as TargetLanguageActions from '../actions/TargetLanguageActions';
import * as CopyrightActions from './CopyrightActions';
import * as ProjectInformationActions from './ProjectInformationActions';
import * as MergeConflictActions from './MergeConflictActions';
import * as MissingVersesActions from './MissingVersesActions';

/**Names for the index of steps */
const projectValidationStepButtonIndex = [
  'Previous',
  'Copyright',
  'Project Information',
  'Merge Conflicts',
  'Missing Verses',
  'Done'
]

const projectValidationStepObjectIndex = {
  'copyrightCheck': 1,
  'projectInformationCheck': 2,
  'mergeConflictCheck': 3,
  'missingVersesCheck':4
}

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
export function validateProject() {
  return ((dispatch, getState) => {
    const state = getState();
    dispatch(CopyrightActions.validate(state));
    dispatch(ProjectInformationActions.validate(state));
    //dispatch(MergeConflictActions.validate(state));
    dispatch(MissingVersesActions.validate(state));

    dispatch(updateProjectValidationStepper());
  });
}

export function updateProjectValidationStepper() {
  return ((dispatch, getState) => {
    let { projectSaveLocation, manifest } = getState().projectDetailsReducer;
    let { projectValidationStepsObject } = getState().projectValidationReducer;
    let failedCheckElement = Object.keys(projectValidationStepsObject).find((stepName) => {
      return projectValidationStepsObject[stepName] !== false;
    });
    if (!failedCheckElement) {
      TargetLanguageActions.generateTargetBible(projectSaveLocation, {}, manifest);
      dispatch(ProjectSelectionActions.displayTools());
    } else {
      dispatch(goToProjectValidationStep(failedCheckElement));
    }
  })
}

export function goToNextProjectValidationStep() {
  return ((dispatch, getState) => {
    let { stepIndex } = getState().projectValidationReducer.stepper;
    switch (stepIndex) {
      case 1:
        //Do action related to copyright check finish
        break;
      case 2:
        //Do action related to project information check finish
        break;
      case 3:
        dispatch(MergeConflictActions.finalizeMerge());
        break;
      case 4:
        //Do action related to missing verses check finish
        dispatch(ProjectSelectionActions.displayTools())
        return dispatch({
          type: consts.GO_TO_PROJECT_VALIDATION_STEP,
          stepIndex: 0,
        })
    }
    dispatch(updateProjectValidationStepper())
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
  return ((dispatch) => {
    if (isNaN(stepIndex)) stepIndex = projectValidationStepObjectIndex[stepIndex];
    let nextStepName = projectValidationStepButtonIndex[stepIndex + 1];
    let previousStepName = projectValidationStepButtonIndex[stepIndex - 1];
    return dispatch({
      type: consts.GO_TO_PROJECT_VALIDATION_STEP,
      stepIndex: stepIndex,
      nextStepName: nextStepName,
      previousStepName: previousStepName,
      nextDisabled: false
    })
  });
}

/**Disables and enables next button in project validation stepper */
export function toggleNextButton(nextDisabled) {
  return {
    type: consts.UPDATE_PROJECT_VALIDATION_NEXT_BUTTON_STATUS,
    nextDisabled: nextDisabled
  }
}
