import consts from './ActionTypes';
const homeStepperIndex = [
  'Go Home',
  'Go to User',
  'Go To Projects',
  'Go to Tools'
];
/**
 * @description toggles the home view based on param.
 * @param {boolean} boolean - true or false either shows or hides it.
 */
export const toggleHomeView = boolean => {
  return {
    type: consts.TOGGLE_HOME_VIEW,
    boolean
  };
};

export const toggleWelcomeSplash = () => {
  return {
    type: consts.TOGGLE_WELCOME_SPLASH
  };
};

export const changeHomeInstructions = instructions => {
  return {
    type: consts.CHANGE_HOME_INSTRUCTIONS,
    instructions
  };
};

export const goToNextStep = () => {
  return ((dispatch, getState) => {
    const { stepIndex } = getState().homeScreenReducer.stepper;
    dispatch(goToStep(stepIndex + 1));
  });
};

export const goToPrevStep = () => {
  return ((dispatch, getState) => {
    const { stepIndex } = getState().homeScreenReducer.stepper;
    dispatch(goToStep(stepIndex - 1));
  });
};

/**
 * Goes to specified step
 * @param {number} stepNumber - Number of step to go to in home stepper
 */
export const goToStep = stepNumber => {
  return ((dispatch, getState) => {
    let nextStepName = homeStepperIndex[stepNumber + 1];
    let previousStepName = homeStepperIndex[stepNumber - 1];
    if (stepNumber >= 0 && stepNumber <= 3) {
      let stepIndexAvailable = canGoToIndex(stepNumber, getState());
      if (!stepIndexAvailable[stepNumber]) return;
      dispatch({
        type: consts.GO_TO_STEP,
        stepIndex: stepNumber,
        nextStepName: nextStepName,
        previousStepName: previousStepName,
        stepIndexAvailable: stepIndexAvailable,
        nextDisabled: false
      });
    } else if (stepNumber < 0) {
      console.error("The min number of steps is 0. (0-3)");
    } else {
      console.error("The max number of steps is 3. (0-3)");
    }
  });
};

export const toggleProjectsFAB = () => {
  return {
    type: consts.TOGGLE_PROJECTS_FAB
  };
};

export const openOnlineImportModal = () => {
  return {
    type: consts.OPEN_ONLINE_IMPORT_MODAL
  };
};

export const closeOnlineImportModal = () => {
  return {
    type: consts.CLOSE_ONLINE_IMPORT_MODAL
  };
};

/**
 * Determines if the next button is disabled or not, dispatches result based on 
 * user completed actions relevant to step
 */
export const getStepperNextButtonIsDisabled = () => {
  return ((dispatch, getState) => {
    let state = getState();
    let { nextDisabled, stepIndex } = state.homeScreenReducer.stepper;
    let currentNextButtonStatus = canGoToIndex(stepIndex + 1, state);
    if (nextDisabled != !currentNextButtonStatus[stepIndex + 1]) {
      dispatch({ type: consts.UPDATE_NEXT_BUTTON_STATUS, nextDisabled: !currentNextButtonStatus[stepIndex + 1] });
    }
  });
};

/**
 * Determines if the home stepper can go to the index specified based on the 
 * requirements a user must have already completed in order to advance to selected step
 * @param {number} stepIndex - The index of the step that is being checked for met requirements
 * @param {object} state - Entire state object of the store
 * @returns [...bool]
 */
export const canGoToIndex = (stepIndex, state) => {
  let { loggedInUser } = state.loginReducer;
  let { projectSaveLocation } = state.projectDetailsReducer;
  let availableArray = [true, true, false, false];
  availableArray[2] = !!loggedInUser;
  availableArray[3] = !!projectSaveLocation;
  return availableArray;
};

export const openLicenseModal = () => {
  return {
    type: consts.OPEN_LICENSE_MODAL
  };
};

export const closeLicenseModal = () => {
  return {
    type: consts.CLOSE_LICENSE_MODAL
  };
};

export const updateStepLabel = (index, label) => {
  return {
    type: consts.UPDATE_STEPPER_LABEL,
    index,
    label
  };
};

/**
 * This action resets all the header labels to a certain index.
 * i.e. headers are => ['Home', 'royalsix', 'a_project_name']
 * Then passing 1 as index would cause them to be ['Home', 'User', 'Project']
 * @param {number} indexToStop - Index to reset label up until
 */
export const resetStepLabels = (indexToStop) => {
    return {
      type: consts.RESET_STEPPER_LABELS,
      indexToStop
    };
};