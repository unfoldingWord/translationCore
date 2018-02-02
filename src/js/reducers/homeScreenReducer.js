import types from '../actions/ActionTypes';

const initialState = {
  displayHomeView: true,
  showWelcomeSplash: true,
  stepper: {
    stepIndex: 0,
    nextStepName: 'Go To User', // deprecated
    previousStepName: '', // deprecated
    nextDisabled: false
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
          stepIndex: action.stepIndex,
          previousStepName: action.previousStepName,
          nextStepName: action.nextStepName,
          nextDisabled: action.nextDisabled
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
    case types.UPDATE_NEXT_BUTTON_STATUS:
      return {
        ...state,
        stepper: {
          ...state.stepper,
          nextDisabled: action.nextDisabled
        }
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
 * @return {bool}
 */
export const getIsNextStepDisabled = (state) =>
  state.stepper.nextDisabled;

/**
 * Returns an array of steps that are enabled
 * @param {bool} isLoggedIn indicates if the user is logged in
 * @param {string} projectSaveLocation the project save path
 * @return {boolean[]}
 */
export const getActiveSteps = (isLoggedIn, projectSaveLocation) => {
  let availableSteps = [true, true, false, false];
  availableSteps[2] = isLoggedIn;
  availableSteps[3] = !!projectSaveLocation;
  return availableSteps;
};
