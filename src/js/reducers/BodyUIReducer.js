import consts from '../actions/ActionTypes';

const initialState = {
  displayHomeView: true,
  showWelcomeSplash: true,
  homeDisplayMode: 'Overview',
  stepper: {
    finished: false,
    stepIndex: 0
  }
};

const BodyUIReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_HOME_VIEW:
      return {
        ...state,
        displayHomeView: action.boolean
      };
    case consts.TOGGLE_WELCOME_SPLASH:
      return {
        ...state,
        showWelcomeSplash: !state.showWelcomeSplash
      };
    case consts.CHANGE_HOME_DISPLAY_MODE:
      return {
        ...state,
        homeDisplayMode: action.mode
      };
    case consts.GO_TO_NEXT_STEP:
      return {
        ...state,
        stepper: {
          finished: action.finished,
          stepIndex: action.stepIndex
        }
      };
    case consts.GO_TO_PREVIOUS_STEP:
      return {
        ...state,
        stepper: {
          finished: false,
          stepIndex: action.stepIndex
        }
      };
    default:
      return state;
  }
};

export default BodyUIReducer;
