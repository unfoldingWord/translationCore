import consts from './ActionTypes';
// actions
import * as AlertModalActions from './AlertModalActions';
const homeStepperIndex = [
  'Go Home',
  'Go to User',
  'Go To Projects',
  'Go to Tools'
]
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
    if (stepIndex < 3) {
      let nextStepName = homeStepperIndex[stepIndex + 2];
      let previousStepName = homeStepperIndex[stepIndex];
      dispatch({
        type: consts.GO_TO_NEXT_STEP,
        stepIndex: stepIndex + 1,
        nextStepName: nextStepName,
        previousStepName: previousStepName,
        finished: stepIndex >= 2
      });
    } else {
      dispatch(AlertModalActions.openAlertDialog("You're at the last step"));
    }
  });
};

export const goToPrevStep = () => {
  return ((dispatch, getState) => {
    const { stepIndex } = getState().homeScreenReducer.stepper;
    let nextStepName = homeStepperIndex[stepIndex];
    let previousStepName = homeStepperIndex[stepIndex - 2];
    if (stepIndex > 0) {
      dispatch({
        type: consts.GO_TO_PREVIOUS_STEP,
        nextStepName: nextStepName,
        previousStepName: previousStepName,
        stepIndex: stepIndex - 1
      });
    }
  });
};

export const goToStep = stepNumber => {
  return ((dispatch) => {
    let nextStepName = homeStepperIndex[stepNumber + 1];
    let previousStepName = homeStepperIndex[stepNumber - 1];
    if (stepNumber >= 0 && stepNumber <= 3) {
      dispatch({
        type: consts.GO_TO_PREVIOUS_STEP,
        stepIndex: stepNumber,
        nextStepName: nextStepName,
        previousStepName: previousStepName
      });
    } else if (stepNumber < 0) {
      console.error("The min number of steps is 0. (0-3)")
    } else {
      console.error("The max number of steps is 3. (0-3)")
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
 * Determines if the next button is diabled or not, dispatches result based on 
 * user completed actions relevant to step
 */
export const getStepperNextButtonIsDisabled = () => {
  return ((dispatch, getState) => {
    let state = getState();
    let { stepIndex, nextDisabled } = state.homeScreenReducer.stepper;
    let { loggedInUser } = state.loginReducer;
    let {projectSaveLocation} = state.projectDetailsReducer;
    let lastNextButtonStatus = nextDisabled;
    let currentNextButtonStatus;
    switch (stepIndex) {
      case 0:
      //home
        currentNextButtonStatus = false;
        if (lastNextButtonStatus != currentNextButtonStatus) {
          dispatch({ type: consts.UPDATE_NEXT_BUTTON_STATUS, nextDisabled: currentNextButtonStatus });
        }
        return;
      case 1:
      //user
        currentNextButtonStatus = !loggedInUser;
        if (lastNextButtonStatus != currentNextButtonStatus) {
          dispatch({ type: consts.UPDATE_NEXT_BUTTON_STATUS, nextDisabled: currentNextButtonStatus });
        }
        return;
      case 2:
      //projects
        currentNextButtonStatus = !projectSaveLocation;
        if (lastNextButtonStatus != currentNextButtonStatus) {
          dispatch({ type: consts.UPDATE_NEXT_BUTTON_STATUS, nextDisabled: currentNextButtonStatus });
        }
        return;
      case 3:
      //tools
        currentNextButtonStatus = true;
        if (lastNextButtonStatus != currentNextButtonStatus) {
          dispatch({ type: consts.UPDATE_NEXT_BUTTON_STATUS, nextDisabled: currentNextButtonStatus });
        }
        return;
      default:
        currentNextButtonStatus = false;
        if (lastNextButtonStatus != currentNextButtonStatus) {
          dispatch({ type: consts.UPDATE_NEXT_BUTTON_STATUS, nextDisabled: currentNextButtonStatus });
        }
        return;
    }
  })
}

export const openLicenseModal = () => {
  return {
    type: consts.OPEN_LICENSE_MODAL
  }
}

export const closeLicenseModal = () => {
  return {
    type: consts.CLOSE_LICENSE_MODAL
  }
}
