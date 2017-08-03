import consts from './ActionTypes';
/**Names for the index of steps */
const projectValidationStepIndex = [
  'Previous',
  'Copyright',
  'Project Information',
  'Merge Conflict',
  'Missing Verses',
  'Done'
]

export function showStepper(val) {
  return {
    type: consts.TOGGLE_PROJECT_VALIDATION_STEPPER,
    showProjectValidationStepper: val
  }
}

/**
 * Wrapper function for handling the initial checking of steps before the UI is displayed.
 * @param {function} callback - Called when the checks for each step are complete, has 
 * value of true or false depending on is all checks passed
 */
export function validateProject(callback) {
  return ((dispatch) => {
    //list of actions to check for readiness of each step
    let copyRightCheck = this.copyRightCheck()
    let projectInformationCheck = this.projectInformationCheck();
    let mergeConflictCheck = this.mergeConflictCheck();
    let missingVersesCheck = this.missingVersesCheck()

    //array to send to reducer for step related information to display
    let validStepsArray = [
      copyRightCheck,
      projectInformationCheck,
      mergeConflictCheck,
      missingVersesCheck
    ]
    let validProjectIndex = validStepsArray.findIndex((check) => { return check.passed === false });
    let validProject = validProjectIndex === -1;
    dispatch({
      type: consts.VALIDATE_PROJECT_STEPS,
      projectValidationStepsArray: validStepsArray
    });
    callback(validProject);
  });
}

export function copyRightCheck() {
  return { passed: false };
}

export function projectInformationCheck() {
  return { passed: false };
}

export function mergeConflictCheck() {
  return { passed: false };
}

export function missingVersesCheck() {
  return { passed: false };
}

export function goToNextProjectValidationStep() {
  return ((dispatch, getState) => {
    let { stepIndex } = getState().projectValidationReducer.stepper;
    let nextStepName = projectValidationStepIndex[stepIndex + 2];
    let previousStepName = projectValidationStepIndex[stepIndex];
    dispatch({
      type: consts.GO_TO_PROJECT_VALIDATION_STEP,
      stepIndex: stepIndex + 1,
      nextStepName: nextStepName,
      previousStepName: previousStepName,
    });
    if (stepIndex === 4) dispatch(showStepper(false));
  })
}

export function goToPreviousProjectValidationStep() {
  return ((dispatch, getState) => {
    const { stepIndex } = getState().projectValidationReducer.stepper;
    let nextStepName = projectValidationStepIndex[stepIndex];
    let previousStepName = projectValidationStepIndex[stepIndex - 2];
    dispatch({
      type: consts.GO_TO_PROJECT_VALIDATION_STEP,
      nextStepName: nextStepName,
      previousStepName: previousStepName,
      stepIndex: stepIndex - 1,
      nextDisabled: false
    });
    if (stepIndex === 1) dispatch(showStepper(false));
  });
}

export function goToProjectValidationStep(step) {
  return ((dispatch) => {
    dispatch({ type: consts.GO_TO_PROJECT_VALIDATION_STEP, step: step })
  })
}