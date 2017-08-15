import consts from '../actions/ActionTypes';
const initialState = {
  showProjectValidationStepper: false,
  projectValidationStepsObject: {
    copyrightCheck: false,
    projectInformationCheck: false,
    mergeConflictCheck: false,
    missingVersesCheck: false
  },
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
    case consts.MERGE_CONFLICTS_CHECK:
      return {
        ...state,
        projectValidationStepsObject: {
          ...state.projectValidationStepsObject,
          mergeConflictCheck: action.payload
        }
      }
    case consts.MISSING_VERSES_CHECK:
      return {
        ...state,
        projectValidationStepsObject: {
          ...state.projectValidationStepsObject,
          missingVersesCheck: action.payload
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
    default:
      return state
  }
}

export default projectValidationReducer;