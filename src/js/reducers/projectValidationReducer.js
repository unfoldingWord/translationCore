import types from '../actions/ActionTypes';
const initialState = {
  showProjectValidationStepper: false,
  projectValidationStepsArray: [],
  stepper: {
    stepIndex: 0,
    nextDisabled: true
  },
  onlyShowProjectInformationScreen: false
};

const projectValidationReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.ADD_PROJECT_VALIDATION_STEP:
      return {
        ...state,
        projectValidationStepsArray: [
          ...state.projectValidationStepsArray.slice(),
          {
            namespace: action.namespace,
            buttonName: action.buttonName,
            index: action.index
          }
        ]
      };
    case types.REMOVE_PROJECT_VALIDATION_STEP:
      return {
        ...state,
        projectValidationStepsArray: action.projectValidationStepsArray,
        showProjectValidationStepper: action.projectValidationStepsArray.length > 0
      };
    case types.GO_TO_PROJECT_VALIDATION_STEP:
      return {
        ...state,
        showProjectValidationStepper: action.stepIndex >= 0,
        stepper: {
          stepIndex: action.stepIndex,
          nextDisabled: true
        }
      };
    case types.UPDATE_PROJECT_VALIDATION_NEXT_BUTTON_STATUS:
      return {
        ...state,
        stepper: {
          ...state.stepper,
          nextDisabled: action.nextDisabled
        }
      };
    case types.TOGGLE_PROJECT_VALIDATION_STEPPER:
      return {
        ...state,
        showProjectValidationStepper: action.showProjectValidationStepper,
        projectValidationStepsArray: initialState.projectValidationStepsArray
      };
    case types.ONLY_SHOW_PROJECT_INFORMATION_SCREEN:
      return {
        ...state,
        onlyShowProjectInformationScreen: action.value
      };
    case types.RESET_PROJECT_VALIDATION_REDUCER:
      return initialState;
    default:
      return state;
  }
};

export default projectValidationReducer;
