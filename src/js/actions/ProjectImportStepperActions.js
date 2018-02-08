import path from 'path-extra';
import consts from './ActionTypes';
import {getTranslate, getProjectSaveLocation} from '../selectors';
// actions
import * as ProjectLoadingActions from './MyProjects/ProjectLoadingActions';
import * as TargetLanguageActions from '../actions/TargetLanguageActions';
import * as CopyrightCheckActions from './CopyrightCheckActions';
import * as ProjectInformationCheckActions from './ProjectInformationCheckActions';
import * as MergeConflictActions from './MergeConflictActions';
import * as MissingVersesActions from './MissingVersesActions';
import * as MyProjectsActions from './MyProjects/MyProjectsActions';
import * as ProjectImportFilesystemActions from './Import/ProjectImportFilesystemActions';
import * as AlertModalActions from './AlertModalActions';
//Namespaces for each step to be referenced by
const MERGE_CONFLICT_NAMESPACE = 'mergeConflictCheck';
const COPYRIGHT_NAMESPACE = 'copyrightCheck';
const MISSING_VERSES_NAMESPACE = 'missingVersesCheck';
const PROJECT_INFORMATION_CHECK_NAMESPACE = 'projectInformationCheck';
let importStepperDone = () => { };

/**
 * Wrapper function for handling the initial checking of steps.
 * Calls all corresponding validation methods
 */
export function validateProject(done) {
  return ((dispatch) => {
    importStepperDone = done;
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
      TargetLanguageActions.generateTargetBibleFromProjectPath(projectSaveLocation, manifest);
      importStepperDone();
    } else {
      //Show the checks that didn't pass
      dispatch(updateStepperIndex());
    }
  });
}

/** Directly jump to a step at the specified index */
export function updateStepperIndex() {
  return ((dispatch, getState) => {
    let { projectValidationStepsArray } = getState().projectValidationReducer;
    let { projectSaveLocation, manifest } = getState().projectDetailsReducer;
    if (!projectValidationStepsArray[0]) {
      //If there are no more steps (Done)
      dispatch(toggleProjectValidationStepper(false));
      // generate target language bible
      TargetLanguageActions.generateTargetBibleFromProjectPath(projectSaveLocation, manifest);
      importStepperDone();
    } else {
      dispatch({
        type: consts.GO_TO_PROJECT_VALIDATION_STEP,
        stepIndex: projectValidationStepsArray[0].index
      });
    }
  });
}

export function toggleProjectValidationStepper(val) {
  return {
    type: consts.TOGGLE_PROJECT_VALIDATION_STEPPER,
    showProjectValidationStepper: val
  };
}

/**Disables and enables next button in project validation stepper */
export function toggleNextButton(nextDisabled) {
  return {
    type: consts.UPDATE_PROJECT_VALIDATION_NEXT_BUTTON_STATUS,
    nextDisabled: nextDisabled
  };
}

/**
 * Adds the given step to the array of steps to be checked.
 * This should be called after the check determines it did not pass.
 * @param {string} namespace - namespace of the step. Should be constant.
 */
export const addProjectValidationStep = (namespace) => {
  return (dispatch, getState) => {
    const translate = getTranslate(getState());
    switch (namespace) {
      case COPYRIGHT_NAMESPACE:
        dispatch({
          type: consts.ADD_PROJECT_VALIDATION_STEP,
          namespace,
          buttonName: translate('copy_right'),
          index: 0
        });
        break;
      case PROJECT_INFORMATION_CHECK_NAMESPACE:
        dispatch({
          type: consts.ADD_PROJECT_VALIDATION_STEP,
          namespace,
          buttonName: translate('home.project.project_information'),
          index: 1
        });
        break;
      case MERGE_CONFLICT_NAMESPACE:
        dispatch({
          type: consts.ADD_PROJECT_VALIDATION_STEP,
          namespace,
          buttonName: translate('home.project.validate.conflicts'),
          index: 2
        });
        break;
      case MISSING_VERSES_NAMESPACE:
        dispatch({
          type: consts.ADD_PROJECT_VALIDATION_STEP,
          namespace,
          buttonName: translate('home.project.validate.missing_verses'),
          index: 3
        });
        break;
    }
  };
};

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
    });
  });
}

export function cancelProjectValidationStepper() {
  return ((dispatch) => {
    dispatch(toggleProjectValidationStepper(false));
    dispatch(ProjectLoadingActions.clearLastProject());
    dispatch({ type: consts.CLEAR_COPYRIGHT_CHECK_REDUCER });
    dispatch({ type: consts.CLEAR_PROJECT_INFORMATION_REDUCER });
    dispatch({ type: consts.CLEAR_MERGE_CONFLICTS_REDUCER });
    dispatch({ type: consts.RESET_PROJECT_VALIDATION_REDUCER });
    // updating project list
    dispatch(MyProjectsActions.getMyProjects());
    dispatch(ProjectImportFilesystemActions.deleteProjectFromImportsFolder());
  });
}

/**
 * Displays an alert with to options: 'Continue Import' and 'Cancel Import'
 * and different actions are dispatches based on user response.
 */
export const confirmContinueOrCancelImportValidation = () => {
  return((dispatch, getState) => {
    const translate = getTranslate(getState());
    const projectSaveLocation = getProjectSaveLocation(getState());
    const isInProjectsFolder = projectSaveLocation.includes(path.join('translationCore', 'projects'));

    if (isInProjectsFolder) {
      dispatch(cancelProjectValidationStepper());
    } else {
      const cancelText = translate('home.project.save.cancel_import');
      const continueText = translate('home.project.save.continue_import');
      dispatch(
        AlertModalActions.openOptionDialog(translate('home.project.save.confirm_cancel_import'),
           (result) => {
            if (result === cancelText) {
              // if 'cancel import' then close
              // alert and cancel import process.
              dispatch(AlertModalActions.closeAlertDialog());
              dispatch(cancelProjectValidationStepper());
            } else {
              // if 'Continue Import' then just close alert
              dispatch(AlertModalActions.closeAlertDialog());
            }
          },
          continueText,
          cancelText
        )
      );
    }
  });
};
