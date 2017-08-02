import consts from './ActionTypes';

export function showStepper(val) {
    return {
        type:consts.TOGGLE_PROJECT_VALIDATION_STEPPER,
        showProjectValidationStepper: val
    }
}

export function validateProject(callback) {
    return ((dispatch) => {
        //list of actions to check for readiness of each step
        let copyRightCheck = this.copyRightCheck()
        let projectInformationCheck = this.projectInformationCheck();
        let mergeConflictCheck = this.mergeConflictCheck();
        let missingVersesCheck = this.missingVersesCheck()

        //array to send to reducer for step related information to display
        let validStepsArray = [
            copyRightCheck,
            projectInformationCheck,
            mergeConflictCheck,
            missingVersesCheck
        ]
        let validProjectIndex = validStepsArray.findIndex((check) => { return check.passed === false });
        let validProject = validProjectIndex === -1;
        dispatch({
            type: consts.VALIDATE_PROJECT_STEPS,
            projectValidationStepsArray: validStepsArray
        });
        callback(validProject);
    });
}

export function copyRightCheck() {
    return { passed: false };
}

export function projectInformationCheck() {
    return { passed: false };
}

export function mergeConflictCheck() {
    return { passed: false };
}

export function missingVersesCheck() {
    return { passed: false };
}

