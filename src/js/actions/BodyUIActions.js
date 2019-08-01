import { batchActions } from 'redux-batched-actions';
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
    }
  });
};

export const openProjectsFAB = () => ({
  type: types.OPEN_PROJECTS_FAB
});

export const closeProjectsFAB = () => ({
  type: types.CLOSE_PROJECTS_FAB
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
export const dimScreen = (enable = true) => ({
  type: types.SHOW_DIMMED_SCREEN,
  bool: enable
});

export const resetReducers = () => {
  return ((dispatch) => {
    const actions = [
      { type: types.RESET_PROJECT_DETAIL },
      { type: types.CLEAR_PREVIOUS_GROUPS_DATA },
      { type: types.CLEAR_PREVIOUS_GROUPS_INDEX },
      { type: types.CLEAR_CONTEXT_ID },
      { type: types.CLOSE_TOOL },
      { type: types.CLEAR_RESOURCES_REDUCER },
      { type: types.CLEAR_PREVIOUS_FILTERS},
      { type: types.RESET_LOCAL_IMPORT_REDUCER},
      { type: types.RESET_HOME_SCREEN },
      { type: types.GO_TO_STEP, stepIndex: 2 }
    ];

    dispatch(batchActions(actions));
  });
};
