import types from '../actions/ActionTypes';

const initialState = {
  displayHomeView: true,
  showWelcomeSplash: true,
  stepper: {
    stepIndex: 0
  },
  showFABOptions: false,
  showLicenseModal: false,
  onlineImportModalVisibility: false,
  dimmedScreen: false
};

const homeScreenReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.TOGGLE_HOME_VIEW:
      return {
        ...state,
        displayHomeView: action.boolean
      };
    case types.TOGGLE_WELCOME_SPLASH:
      return {
        ...state,
        showWelcomeSplash: !state.showWelcomeSplash
      };
    case types.GO_TO_STEP:
      return {
        ...state,
        stepper: {
          ...state.stepper,
          stepIndex: action.stepIndex
        }
      };
    case types.TOGGLE_PROJECTS_FAB:
      return {
        ...state,
        showFABOptions: !state.showFABOptions
      };
    case types.OPEN_ONLINE_IMPORT_MODAL:
      return {
        ...state,
        onlineImportModalVisibility: true
      };
    case types.CLOSE_ONLINE_IMPORT_MODAL:
      return {
        ...state,
        onlineImportModalVisibility: false
      };
    case types.OPEN_LICENSE_MODAL:
      return {
        ...state,
        showLicenseModal: true
      };
    case types.CLOSE_LICENSE_MODAL:
      return {
        ...state,
        showLicenseModal: false
      };
    case types.SHOW_DIMMED_SCREEN:
      return {
        ...state,
        dimmedScreen: action.bool
      };
    default:
      return state;
  }
};

export default homeScreenReducer;

/**
 * Returns the step index of the home screen
 * @param {object} state the home screen reducer state slice
 * @return {int}
 */
export const getStep = (state) =>
  state.stepper.stepIndex;

/**
 * Checks if the next step of the home screen is disabled
 * @param {object} state the home screen reducer state slice
 * @param {boolean} isLoggedIn
 * @param {string} isProjectLoaded
 * @return {boolean}
 */
export const getIsNextStepDisabled = (state, isLoggedIn, isProjectLoaded) => {
  const steps = getActiveSteps(isLoggedIn, isProjectLoaded);
  const stepIndex = getStep(state);
  return !steps[stepIndex + 1];
};

/**
 * Returns an array of steps that are enabled
 * @param {bool} isLoggedIn indicates if the user is logged in
 * @param {bool} isProjectLoaded indicates if the project is loaded
 * @return {boolean[]}
 */
export const getActiveSteps = (isLoggedIn, isProjectLoaded) => {
  let availableSteps = [true, true, false, false];
  availableSteps[2] = isLoggedIn;
  availableSteps[3] = isProjectLoaded;
  return availableSteps;
};
