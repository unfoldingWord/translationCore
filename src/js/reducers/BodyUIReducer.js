import consts from '../actions/CoreActionConsts';

const initialState = {
  displayHomeView: true,
  showWelcomeSplash: true
};

const BodyUIReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_HOME_VIEW:
      return {
        ...state,
        displayHomeView: !state.displayHomeView
      };
    case consts.TOGGLE_WELCOME_SPLASH:
      return {
        ...state,
        showWelcomeSplash: !state.displayHomeView
      };
    default:
      return state;
  }
};

export default BodyUIReducer;
