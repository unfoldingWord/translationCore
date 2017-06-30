import consts from './ActionTypes';
// actions
import * as AlertModalActions from './AlertModalActions';

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
    const {stepIndex} = getState().homeScreenReducer.stepper;
    if (stepIndex < 3) {
      dispatch({
        type: consts.GO_TO_NEXT_STEP,
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 2
      });
    } else {
      dispatch(AlertModalActions.openAlertDialog("You're at the last step"));
    }
  });
};

export const goToPrevStep = () => {
  return ((dispatch, getState) => {
    const {stepIndex} = getState().homeScreenReducer.stepper;
    if (stepIndex > 0) {
      dispatch({
        type: consts.GO_TO_PREVIOUS_STEP,
        stepIndex: stepIndex - 1
      });
    }
  });
};

export const toggleProjectsFAB = () => {
  return {
    type: consts.TOGGLE_PROJECTS_FAB,
  };
} 
