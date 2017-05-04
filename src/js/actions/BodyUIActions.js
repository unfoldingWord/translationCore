import consts from '../actions/CoreActionConsts';

/**
 * @description toggles the home view based on param.
 * @param {boolean} boolean - true or false either shows or hides it.
 */
export const toggleHomeView = boolean => {
  return {
    type: consts.TOGGLE_HOME_VIEW,
    boolean
  };
};

export const toggleWelcomeSplash = () => {
  return {
    type: consts.TOGGLE_WELCOME_SPLASH
  };
};

export const goToNextStep = () => {
  return ((dispatch, getState) => {
    const {stepIndex} = getState().BodyUIReducer.stepper;
    dispatch({
      type: consts.GO_TO_NEXT_STEP,
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2
    });
  });
};

export const goToPrevStep = () => {
  return ((dispatch, getState) => {
    const {stepIndex} = getState().BodyUIReducer.stepper;
    if (stepIndex > 0) {
      dispatch({
        type: consts.GO_TO_PREVIOUS_STEP,
        stepIndex: stepIndex - 1
      });
    }
  });
};
