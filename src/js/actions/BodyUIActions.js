import consts from '../actions/CoreActionConsts';

export const toggleHomeView = () => {
  return {
    type: consts.TOGGLE_HOME_VIEW
  };
};

export const toggleWelcomeSplash = () => {
  return {
    type: consts.TOGGLE_WELCOME_SPLASH
  };
};
