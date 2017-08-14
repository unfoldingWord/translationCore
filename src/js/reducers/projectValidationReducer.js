import consts from '../actions/ActionTypes';
const initialState = {
  showProjectValidationStepper: false,
  projectValidationStepsArray: [],
  instructions: null,
  stepper: {
    stepIndex: 1,
    nextStepName: 'Project Information',
    previousStepName: 'Previous',
    nextDisabled: false
  },
}

const projectValidationReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.VALIDATE_PROJECT_STEPS:
      return {
        ...state,
        projectValidationStepsArray: action.projectValidationStepsArray
      }
    case consts.TOGGLE_PROJECT_VALIDATION_STEPPER:
      return {
        ...state,
        showProjectValidationStepper: action.showProjectValidationStepper,
        stepper: {
          ...initialState.stepper
        }
      }
    case consts.CHANGE_PROJECT_VALIDATION_INSTRUCTIONS:
      return {
        ...state,
        instructions: action.instructions
      };
    case consts.GO_TO_PROJECT_VALIDATION_STEP:
      return {
        ...state,
        stepper: {
          stepIndex: action.stepIndex,
          previousStepName: action.previousStepName,
          nextStepName: action.nextStepName
        }
      };
    case consts.UPDATE_PROJECT_VALIDATION_NEXT_BUTTON_STATUS:
      return {
        ...state,
        stepper: {
          ...state.stepper,
          nextDisabled: action.nextDisabled
        }
      }
    default:
      return state
  }
}

export default projectValidationReducer;