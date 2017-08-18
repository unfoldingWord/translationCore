import consts from './ActionTypes';
//actions
import * as ProjectSelectionActions from './ProjectSelectionActions';
import * as TargetLanguageActions from '../actions/TargetLanguageActions';
import * as CopyrightCheckActions from './CopyrightCheckActions';
import * as ProjectInformationCheckActions from './ProjectInformationCheckActions';
import * as MergeConflictActions from './MergeConflictActions';
import * as MissingVersesActions from './MissingVersesActions';

//Namespaces for each step to be referenced by
const MERGE_CONFLICT_NAMESPACE = 'mergeConflictCheck';
const COPYRIGHT_NAMESPACE = 'copyrightCheck';
const MISSING_VERSES_NAMESPACE = 'missingVersesCheck';
const PROJECT_INFORMATION_NAMESPACE = 'projectInformationCheck';

/**
 * 
 * @param {object || string} instructions - string or react component to
 * replace the old instructions in the project validation stepper 
 */
export function changeProjectValidationInstructions(instructions) {
  return {
    type: consts.CHANGE_PROJECT_VALIDATION_INSTRUCTIONS,
    instructions
  };
}

/**
 * Wrapper function for handling the initial checking of steps.
 * Calls all corresponding validation methods
 */
export function validateProject() {
  return ((dispatch, getState) => {
    dispatch(CopyrightCheckActions.validate());
    dispatch(ProjectInformationCheckActions.validate());
    dispatch(MergeConflictActions.validate());
    dispatch(MissingVersesActions.validate());

    dispatch(initiateProjectValidationStepper());
  });
}

/**
 * Determines whether to show the stepper or the tools
 */
export function initiateProjectValidationStepper() {
  return ((dispatch, getState) => {
    let { projectSaveLocation, manifest } = getState().projectDetailsReducer;
    let { projectValidationStepsArray } = getState().projectValidationReducer;
    if (projectValidationStepsArray.length === 0) {
      //If there are no invalid checks
      TargetLanguageActions.generateTargetBible(projectSaveLocation, {}, manifest);
      dispatch(ProjectSelectionActions.displayTools());
    } else {
      //Show the checks that didn't pass
      dispatch(updateStepperIndex(projectValidationStepsArray[0].index));
    }
  })
}

/** Simply go to the next stepper check */
export function goToNextProjectValidationStep() {
  return ((dispatch, getState) => {
    let { stepIndex } = getState().projectValidationReducer.stepper;
    dispatch(updateStepperIndex(stepIndex + 1));
  })
}

/** Simply go to the previous stepper check */
export function goToPreviousProjectValidationStep() {
  return ((dispatch, getState) => {
    const { stepIndex } = getState().projectValidationReducer.stepper;
    dispatch(updateStepperIndex(stepIndex - 1));
  });
}


/** Directly jump to a step at the specified index */
export function updateStepperIndex(stepIndex) {
  return ((dispatch, getState) => {
    let { projectValidationStepsArray } = getState().projectValidationReducer;
    /** The next step name is always the one after the first because we are not allow back naviagtion */
    let nextStepName = projectValidationStepsArray[1] ? projectValidationStepsArray[1].buttonName : 'Done';
    let previousStepName = 'Cancel';
    if (!projectValidationStepsArray[0] || stepIndex > projectValidationStepsArray[projectValidationStepsArray.length - 1].index) {
      //If the stepIndex is > the last step in the stepper arrays' index (Done)
      dispatch({
        type: consts.TOGGLE_PROJECT_VALIDATION_STEPPER,
        showProjectValidationStepper: false
      })
      dispatch(ProjectSelectionActions.displayTools());
    } else if (stepIndex < projectValidationStepsArray[0].index) {
      //If stepIndex is less than the first steps' index (Cancelled)
      dispatch({
        type: consts.TOGGLE_PROJECT_VALIDATION_STEPPER,
        showProjectValidationStepper: false
      })
      dispatch(ProjectSelectionActions.clearLastProject())
    } else
      dispatch({
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

/**
 * Adds the given step to the array of steps to be checked. 
 * This should be called after the check deteremines it did not pass.
 * @param {string} namespace - namespace of the step. Should be constant.
 */
export function addProjectValidationStep(namespace) {
  switch (namespace) {
    case COPYRIGHT_NAMESPACE:
      return {
        type: consts.ADD_PROJECT_VALIDATION_STEP,
        namespace,
        buttonName: 'Copy Right',
        index: 1
      }
    case PROJECT_INFORMATION_NAMESPACE:
      return {
        type: consts.ADD_PROJECT_VALIDATION_STEP,
        namespace,
        buttonName: 'Project Information',
        index: 2
      }
    case MERGE_CONFLICT_NAMESPACE:
      return {
        type: consts.ADD_PROJECT_VALIDATION_STEP,
        namespace,
        buttonName: 'Merge Conflicts',
        index: 3
      }
    case MISSING_VERSES_NAMESPACE:
      return {
        type: consts.ADD_PROJECT_VALIDATION_STEP,
        namespace,
        buttonName: 'Missing Verses',
        index: 4
      }

  }
}
/**
 * Removes the given step from the array of steps to be checked.
 * This should be called after the check finalizes
 * @param {string} namespace - namespace of the step. Should be constant.
 */
export function removeProjectValidationStep(namespace) {
  return ((dispatch, getState) => {
    let projectValidationStepsArray = getState().projectValidationReducer.projectValidationStepsArray.slice();
    //Checking which step namespace matches the one provided to remove
    dispatch({
      type: consts.REMOVE_PROJECT_VALIDATION_STEP,
      projectValidationStepsArray: projectValidationStepsArray.filter((stepObject) => stepObject.namespace !== namespace)
    })
  })
}
