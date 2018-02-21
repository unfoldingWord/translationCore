import {
  getHomeScreenStep,
  getActiveHomeScreenSteps
} from '../selectors';
import types from './ActionTypes';

/**
 * @description toggles the home view based on param.
 * @param {boolean} boolean - true or false either shows or hides it.
 */
export const toggleHomeView = boolean => ({
  type: types.TOGGLE_HOME_VIEW,
  boolean
});

export const toggleWelcomeSplash = () => ({
  type: types.TOGGLE_WELCOME_SPLASH
});

export const goToNextStep = () => {
  return ((dispatch, getState) => {
    const stepIndex = getHomeScreenStep(getState());
    dispatch(goToStep(stepIndex + 1));
  });
};

export const goToPrevStep = () => {
  return ((dispatch, getState) => {
    const stepIndex = getHomeScreenStep(getState());
    dispatch(goToStep(stepIndex - 1));
  });
};

/**
 * Goes to specified step
 * @param {number} stepNumber - Number of step to go to in home stepper
 */
export const goToStep = stepNumber => {
  return ((dispatch, getState) => {
    if (stepNumber >= 0 && stepNumber <= 3) {
      const activeSteps = getActiveHomeScreenSteps(getState());
      if (!activeSteps[stepNumber]) return;
      dispatch({
        type: types.GO_TO_STEP,
        stepIndex: stepNumber
      });
    } else if (stepNumber < 0) {
      console.error('The min number of steps is 0. (0-3)');
    } else {
      console.error('The max number of steps is 3. (0-3)');
    }
  });
};

export const toggleProjectsFAB = () => ({
  type: types.TOGGLE_PROJECTS_FAB
});

export const openOnlineImportModal = () => ({
  type: types.OPEN_ONLINE_IMPORT_MODAL
});

export const closeOnlineImportModal = () => {
  return {
    type: types.CLOSE_ONLINE_IMPORT_MODAL
  };
};

export const openLicenseModal = () => ({
  type: types.OPEN_LICENSE_MODAL
});

export const closeLicenseModal = () => ({
  type: types.CLOSE_LICENSE_MODAL
});

/**
 * @description show or not show dimmed screen.
 * @param {bool} enable dims the screen if enabled otherwise removes the dim
 */
export const dimScreen = (enable=true) => ({
  type: types.SHOW_DIMMED_SCREEN,
  bool: enable
});
