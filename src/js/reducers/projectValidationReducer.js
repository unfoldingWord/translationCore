import consts from '../actions/ActionTypes';
const initialState = {
    showProjectValidationStepper: false,
    projectValidationStepsArray: []
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
                showProjectValidationStepper: action.showProjectValidationStepper
            }
        default:
            return state
    }
}

export default projectValidationReducer;