import types from '../actions/ActionTypes';

const initialState = {
  displayHomeView: true,
  showWelcomeSplash: true,
  stepper: { stepIndex: 0 },
  showFABOptions: false,
  showLicenseModal: false,
  onlineImportModalVisibility: false,
  dimmedScreen: false,
  errorFeedbackMessage: '',
  errorFeedbackDetails: '',
  errorFeedbackCategory: '',
  feedbackCloseCallback: null,
};

const homeScreenReducer = (state = initialState, action) => {
  switch (action.type) {
  case types.TOGGLE_HOME_VIEW:
    return {
      ...state,
      displayHomeView: action.boolean,
    };
  case types.TOGGLE_WELCOME_SPLASH:
    return {
      ...state,
      showWelcomeSplash: !state.showWelcomeSplash,
    };
  case types.GO_TO_STEP:
    return {
      ...state,
      stepper: {
        ...state.stepper,
        stepIndex: action.stepIndex,
      },
    };
  case types.OPEN_PROJECTS_FAB:
    return {
      ...state,
      showFABOptions: true,
    };
  case types.CLOSE_PROJECTS_FAB:
    return {
      ...state,
      showFABOptions: false,
    };
  case types.OPEN_ONLINE_IMPORT_MODAL:
    return {
      ...state,
      onlineImportModalVisibility: true,
    };
  case types.CLOSE_ONLINE_IMPORT_MODAL:
    return {
      ...state,
      onlineImportModalVisibility: false,
    };
  case types.OPEN_LICENSE_MODAL:
    return {
      ...state,
      showLicenseModal: true,
    };
  case types.CLOSE_LICENSE_MODAL:
    return {
      ...state,
      showLicenseModal: false,
    };
  case types.SHOW_DIMMED_SCREEN:
    return {
      ...state,
      dimmedScreen: action.bool,
    };
  case types.ERROR_FEEDBACK_MESSAGE:
    return {
      ...state,
      errorFeedbackMessage: action.val,
    };
  case types.ERROR_FEEDBACK_DETAILS:
    return {
      ...state,
      errorFeedbackDetails: action.val,
    };
  case types.ERROR_FEEDBACK_CATEGORY:
    return {
      ...state,
      errorFeedbackCategory: action.val,
    };
  case types.FEEDBACK_CALLBACK_ON_CLOSE:
    return {
      ...state,
      feedbackCloseCallback: action.val,
    };
  case types.RESET_HOME_SCREEN:
    return {
      ...initialState,
      showWelcomeSplash: false,
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
 * gets the error message to attach to feedback dialog (also used as flag to show feedback dialog)
 * @param {object} state
 * @return {String}
 */
export const getErrorFeedbackMessage = (state) =>
  state.errorFeedbackMessage;

/**
 * gets the error extra details to attach to feedback dialog
 * @param {object} state
 * @return {String}
 */
export const getErrorFeedbackExtraDetails = (state) =>
  state.errorFeedbackDetails;

/**
 * gets the error feedback category to use for feedback dialog
 * @param {object} state
 * @return {String}
 */
export const getErrorFeedbackCategory = (state) =>
  state.errorFeedbackCategory;

/**
 * gets the function to call when feedback dialog closes
 * @param {object} state
 * @return {String}
 */
export const getFeedbackCloseCallback = (state) =>
  state.feedbackCloseCallback;

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

/**
 * Checks if the home screen is visible
 * @param state
 * @return {boolean}
 */
export const getIsHomeVisible = state => state.displayHomeView;
