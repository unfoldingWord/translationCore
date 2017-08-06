import consts from './ActionTypes';
import * as fs from 'fs-extra';
import Path from 'path-extra';
//actions
import * as ProjectSelectionActions from './ProjectSelectionActions';
import * as TargetLanguageActions from './TargetLanguageActions';
import * as MergeConflictHelpers from '../helpers/MergeConflictHelpers';

/**Names for the index of steps */
const projectValidationStepIndex = [
  'Previous',
  'Copyright',
  'Project Information',
  'Merge Conflicts',
  'Missing Verses',
  'Done'
]

export function showStepper(val) {
  return {
    type: consts.TOGGLE_PROJECT_VALIDATION_STEPPER,
    showProjectValidationStepper: val
  }
}

export function changeProjectValidationInstructions(instructions) {
  return {
    type: consts.CHANGE_PROJECT_VALIDATION_INSTRUCTIONS,
    instructions
  };
}
/**
 * Wrapper function for handling the initial checking of steps before the UI is displayed.
 * @param {function} callback - Called when the checks for each step are complete, has 
 * value of true or false depending on is all checks passed
 */
export function validateProject(callback) {
  return ((dispatch, getState) => {
    //list of actions to check for readiness of each step
    let copyRightCheck = this.copyRightCheck()
    let projectInformationCheck = this.projectInformationCheck();
    let mergeConflictCheck = this.mergeConflictCheck(getState());
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

/**
 * Wrapper action for handling merge conflict detection
 * @param {object} state - State object from reducers to get usfm data
 */
export function mergeConflictCheck(state) {
  const { projectSaveLocation, manifest } = state.projectDetailsReducer;
  /**
   * Object that will be sent back to reducers with the chapter, 
   * verse and text info  of each merge conflict version.
   * An array of arrays of an object.
   * */
  let parsedAllMergeConflictsFoundArray = [];
  let usfmFilePath = Path.join(projectSaveLocation, manifest.project.id + '.usfm');
  let usfmData = fs.readFileSync(usfmFilePath).toString();
  /**Searching for string as indication of a merge conflict present in the text */
  if (usfmData.includes('<<<<<<<')) {
    /**
     * @example ["1 this is the first version", "1 This is the second version"]
     * @type {[string]}
     * extracting merge conflicts from usfm data
    */
    let allMergeConflictsFoundArray = MergeConflictHelpers.getMergeConflicts(usfmData);
    for (let matchIndex in allMergeConflictsFoundArray) {
      /** Array representing the diffferent versions for a merge conflict parsedinto a more consumable format */
      let parsedMergeConflictVersionsArray = [];
      /** Array representing current versions to be parsed*/
      let mergeConflictVersionsArray = [];
      /**
       * Getting the first to matched elements from all merge conflicts array
       * These elements are paired because they represent one 'merge conflict'
       * They are the two different version histories of the conflict
       */
      mergeConflictVersionsArray.push(allMergeConflictsFoundArray.shift());
      mergeConflictVersionsArray.push(allMergeConflictsFoundArray.shift());
      for (var versionText of mergeConflictVersionsArray) {
        /**
         * Parsing the merge conflict version text in an object more easily
         * consumable for the displaying container
         * @type {{chapter,verses,text}}
         */
        let parsedMergeConflictVersionObject = MergeConflictHelpers.parseMergeConflictVersion(versionText, usfmData);
        parsedMergeConflictVersionsArray.push(parsedMergeConflictVersionObject);
      }
      parsedAllMergeConflictsFoundArray.push(parsedMergeConflictVersionsArray)
    }
    return {
      passed: false,
      conflicts: parsedAllMergeConflictsFoundArray,
      filePath:usfmFilePath
    }
  } else {
    return {
      passed: true,
      conflicts: []
    }
  }
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
    if (stepIndex === 4) {
      dispatch(finishStepper())
    }
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

export function finishStepper() {
  return ((dispatch, getState) => {
    const projectValidationStepsArray = getState().projectValidationReducer.projectValidationStepsArray;
    dispatch(MergeConflictHelpers.merge(projectValidationStepsArray[2]))
    dispatch(showStepper(false));
    let projectDetails = getState().projectDetailsReducer;
    TargetLanguageActions.generateTargetBible(projectDetails.projectSaveLocation, {}, projectDetails.manifest);
    dispatch(ProjectSelectionActions.displayTools());
  })
}

export function toggleNextButton(nextDisabled) {
  return {
    type: consts.UPDATE_PROJECT_VALIDATION_NEXT_BUTTON_STATUS,
    nextDisabled: nextDisabled
  }
}

export function updateStepData(stepIndex, data) {
  return ((dispatch, getState) => {
    let newStepsArray = getState().projectValidationReducer.projectValidationStepsArray.splice();
    newStepsArray[stepIndex] = data;
    dispatch({
      type: consts.VALIDATE_PROJECT_STEPS,
      projectValidationStepsArray: newStepsArray
    });
  });
}