import consts from '../actions/ActionTypes';
const initialState = {
  showProjectValidationStepper: false,
  projectValidationStepsArray: [],
  instructions: null,
  stepper: {
    stepIndex: 1,
    nextStepName: 'Project Information',
    previousStepName: 'Cancel',
    nextDisabled: true
  },
  onlyShowProjectInformationScreen: false
};

const projectValidationReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_PROJECT_VALIDATION_STEP:
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
    case consts.REMOVE_PROJECT_VALIDATION_STEP:
      return {
        ...state,
        projectValidationStepsArray: action.projectValidationStepsArray,
        showProjectValidationStepper: action.projectValidationStepsArray.length > 0
      };
    case consts.CHANGE_PROJECT_VALIDATION_INSTRUCTIONS:
      return {
        ...state,
        instructions: action.instructions
      };
    case consts.GO_TO_PROJECT_VALIDATION_STEP:
      return {
        ...state,
        showProjectValidationStepper: !!action.stepIndex,
        stepper: {
          stepIndex: action.stepIndex,
          previousStepName: action.previousStepName,
          nextStepName: action.nextStepName,
          nextDisabled: true
        }
      };
    case consts.UPDATE_PROJECT_VALIDATION_NEXT_BUTTON_STATUS:
      return {
        ...state,
        stepper: {
          ...state.stepper,
          nextDisabled: action.nextDisabled
        }
      };
    case consts.TOGGLE_PROJECT_VALIDATION_STEPPER:
      return {
        ...state,
        showProjectValidationStepper: action.showProjectValidationStepper,
        projectValidationStepsArray: initialState.projectValidationStepsArray
      };
    case consts.ONLY_SHOW_PROJECT_INFORMATION_SCREEN:
      return {
        ...state,
        onlyShowProjectInformationScreen: action.value
      };
    default:
      return state;
  }
};

export default projectValidationReducer;