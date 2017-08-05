import consts from './ActionTypes';
import * as fs from 'fs-extra';
import Path from 'path-extra';
import usfmParser from 'usfm-js';
//actions
import * as ProjectSelectionActions from './ProjectSelectionActions';
import * as TargetLanguageActions from './TargetLanguageActions';

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

export function mergeConflictCheck(state) {
  const { projectSaveLocation, manifest } = state.projectDetailsReducer;
  let passed = true;
  let mergeConflicts = [];
  let usfmData = fs.readFileSync(Path.join(projectSaveLocation, manifest.project.id + '.usfm')).toString();
  if (usfmData.includes('<<<<<<<')) {
    let matches = (/<<<<<<<\s?\w+:\w+([\s\S]*)=======([\s\S]*)>>>>>>>/gm).exec(usfmData);
    //<<<<<<<\s?(.*)([\s\S]*)=======([\s\S]*)>>>>>>>\s?(.*) // not matching commit and branch currently
    matches.shift();
    let mergeArray = [];
    for (var mergeText of matches) {
      let textObject = usfmParser.toJSON(mergeText.trim());
      let text = '';
      for (var textString in textObject) {
        text += textObject[textString];
      }
      let verseKeysArray = Object.keys(textObject);
      let verses = `${verseKeysArray[0]}-${verseKeysArray[verseKeysArray.length - 1]}`;
      let allUsfmParsedObject = usfmParser.toJSON(usfmData);
      let chapter;
      for (var chapterNum in allUsfmParsedObject) {
        if (!parseInt(chapterNum)) continue;
        let chapterObject = allUsfmParsedObject[chapterNum];
        for (var verseNum in chapterObject) {
          let verseObject = chapterObject[verseNum];
          if (verseObject.includes(textObject[verseKeysArray[0]])) {
            chapter = chapterNum;
          }
        }
      }
      mergeArray.push({
        chapter,
        verses,
        text
      })
    }
    mergeConflicts.push(mergeArray)
    return {
      passed: false,
      conflicts: mergeConflicts
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
      dispatch(showStepper(false));
      let projectDetails = getState().projectDetailsReducer;
      TargetLanguageActions.generateTargetBible(projectDetails.projectSaveLocation, {}, projectDetails.manifest);
      dispatch(ProjectSelectionActions.displayTools());
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