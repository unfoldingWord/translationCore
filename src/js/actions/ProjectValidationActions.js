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
    dispatch(CopyrightActions.validate());
    dispatch(ProjectInformationActions.validate());
    dispatch(MergeConflictActions.validate());
    dispatch(MissingVersesActions.validate());

    dispatch(updateProjectValidationStepper());
  });
}


export function updateProjectValidationStepper() {
  return ((dispatch, getState) => {
    let { projectSaveLocation, manifest } = getState().projectDetailsReducer;
    let { projectValidationStepsArray } = getState().projectValidationReducer;
    if (projectValidationStepsArray.length === 0) {
      TargetLanguageActions.generateTargetBible(projectSaveLocation, {}, manifest);
      dispatch(ProjectSelectionActions.displayTools());
    } else {
      dispatch(updateStepperIndex(projectValidationStepsArray[0].index));
    }
  })
}

export function goToNextProjectValidationStep() {
  return ((dispatch, getState) => {
    let { stepIndex } = getState().projectValidationReducer.stepper;
    dispatch(updateStepperIndex(stepIndex + 1));
  })
}

export function goToPreviousProjectValidationStep() {
  return ((dispatch, getState) => {
    const { stepIndex } = getState().projectValidationReducer.stepper;
    dispatch(updateStepperIndex(stepIndex - 1));
  });
}


/**Directly jump to a step at the specified index */
export function updateStepperIndex(stepIndex) {
  return ((dispatch, getState) => {
    let { projectValidationStepsArray } = getState().projectValidationReducer;
    let nextStepName = projectValidationStepsArray[1] ? projectValidationStepsArray[1].buttonName : 'Done';
    let previousStepName = 'Cancel';
    if (stepIndex > projectValidationStepsArray[projectValidationStepsArray.length - 1].index) {
      dispatch({
        type: consts.TOGGLE_PROJECT_VALIDATION_STEPPER,
        showProjectValidationStepper: false
      })
      return dispatch(ProjectSelectionActions.displayTools());
    } else if (stepIndex < projectValidationStepsArray[0].index) {
      dispatch({
        type: consts.TOGGLE_PROJECT_VALIDATION_STEPPER,
        showProjectValidationStepper: false
      })
    } else return dispatch({
      type: consts.GO_TO_PROJECT_VALIDATION_STEP,
      stepIndex: stepIndex,
      nextStepName: nextStepName,
      previousStepName: previousStepName
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

export function showProjectValidationStepper(val) {
  return {
    type: consts.TOGGLE_PROJECT_VALIDATION_STEPPER,
    showProjectValidationStepper: val
  }
}