import { batchActions } from 'redux-batched-actions';
import {
  getHomeScreenStep,
  getActiveHomeScreenSteps,
} from '../selectors';
import types from './ActionTypes';

/**
 * @description toggles the home view based on param.
 * @param {boolean} boolean - true or false either shows or hides it.
 */
export const toggleHomeView = boolean => ({
  type: types.TOGGLE_HOME_VIEW,
  boolean,
});

export const toggleWelcomeSplash = () => ({ type: types.TOGGLE_WELCOME_SPLASH });

export const goToNextStep = () => ((dispatch, getState) => {
  const stepIndex = getHomeScreenStep(getState());
  dispatch(goToStep(stepIndex + 1));
});

export const goToPrevStep = () => ((dispatch, getState) => {
  const stepIndex = getHomeScreenStep(getState());
  dispatch(goToStep(stepIndex - 1));
});

/**
 * Goes to specified step
 * @param {number} stepNumber - Number of step to go to in home stepper
 */
export const goToStep = stepNumber => ((dispatch, getState) => {
  if (stepNumber >= 0 && stepNumber <= 3) {
    const activeSteps = getActiveHomeScreenSteps(getState());

    if (!activeSteps[stepNumber]) {
      return;
    }
    dispatch({
      type: types.GO_TO_STEP,
      stepIndex: stepNumber,
    });
  }
});

export const openProjectsFAB = () => ({ type: types.OPEN_PROJECTS_FAB });

export const closeProjectsFAB = () => ({ type: types.CLOSE_PROJECTS_FAB });

export const openOnlineImportModal = () => ({ type: types.OPEN_ONLINE_IMPORT_MODAL });

export const closeOnlineImportModal = () => ({ type: types.CLOSE_ONLINE_IMPORT_MODAL });

export const openLicenseModal = () => ({ type: types.OPEN_LICENSE_MODAL });

export const closeLicenseModal = () => ({ type: types.CLOSE_LICENSE_MODAL });

/**
 * Dims the screen.
 * @param {bool} enable dims the screen if enabled otherwise removes the dim.
 */
export const dimScreen = (enable = true) => ({
  type: types.SHOW_DIMMED_SCREEN,
  bool: enable,
});

export const resetReducers = () => ((dispatch) => {
  const actions = [
    { type: types.RESET_PROJECT_DETAIL },
    { type: types.CLOSE_TOOL },
    { type: types.CLEAR_RESOURCES_REDUCER },
    { type: types.RESET_LOCAL_IMPORT_REDUCER },
    { type: types.RESET_HOME_SCREEN },
    { type: types.GO_TO_STEP, stepIndex: 2 },
  ];

  dispatch(batchActions(actions));
});
