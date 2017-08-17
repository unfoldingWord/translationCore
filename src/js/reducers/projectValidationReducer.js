import consts from '../actions/ActionTypes';
const initialState = {
  showProjectValidationStepper: false,
  projectValidationStepsArray: [],
  instructions: null,
  stepper: {
    stepIndex: 1,
    nextStepName: 'Project Information',
    previousStepName: 'Cancel',
    nextDisabled: false
  },
}

const projectValidationReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_PROJECT_VALIDATION_STEP:
      return {
        ...state,
        projectValidationStepsArray: [
          ...state.projectValidationStepsArray.slice(),
          action.stepObject
        ]
      }
    case consts.REMOVE_PROJECT_VALIDATION_STEP:
      return {
        ...state,
        projectValidationStepsArray: action.projectValidationStepsArray
      }
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
    case consts.TOGGLE_PROJECT_VALIDATION_STEPPER:
      return {
        ...state,
        showProjectValidationStepper: action.showProjectValidationStepper,
        projectValidationStepsArray: initialState.projectValidationStepsArray
      }
    default:
      return state
  }
}

export default projectValidationReducer;