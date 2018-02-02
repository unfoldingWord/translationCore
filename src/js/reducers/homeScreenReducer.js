import types from '../actions/ActionTypes';

const initialState = {
  displayHomeView: true,
  showWelcomeSplash: true,
  stepper: {
    stepIndex: 0,
    nextStepName: 'Go To User',
    previousStepName: '',
    nextDisabled: false,
    stepIndexAvailable: [true, true, false, false],
    stepperLabels: ['Home', 'User', 'Project', 'Tool']
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
          stepIndexAvailable: action.stepIndexAvailable,
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
    case types.UPDATE_STEPPER_LABEL:
   /** Implementation per redux docs for immutable state arrays
    * @see http://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html#inserting-and-removing-items-in-arrays */
      return {
        ...state,
        stepper: {
          ...state.stepper,
          stepperLabels: [
            ...state.stepper.stepperLabels.slice(0, action.index),
            action.label || initialState.stepper.stepperLabels[action.index],
            ...state.stepper.stepperLabels.slice(action.index + 1)
          ]
        }
      };
    case types.RESET_STEPPER_LABELS:
    /** Implementation per redux docs for immutable state arrays
    * @see http://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html#inserting-and-removing-items-in-arrays */
      return {
        ...state,
        stepper: {
          ...state.stepper,
          stepperLabels: [
            ...state.stepper.stepperLabels.slice(0, action.indexToStop + 1),
            ...initialState.stepper.stepperLabels.slice(action.indexToStop + 1)
          ]
        }
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
