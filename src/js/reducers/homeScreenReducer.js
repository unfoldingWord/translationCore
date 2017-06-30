import React from 'react';
import consts from '../actions/ActionTypes';

const initialState = {
  displayHomeView: true,
  showWelcomeSplash: true,
  homeInstructions: <div></div>,
  stepper: {
    finished: false,
    stepIndex: 0
  },
  showFABOptions: false
};

const homeScreenReducer = (state = initialState, action) => {
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
    case consts.CHANGE_HOME_INSTRUCTIONS:
      return {
        ...state,
        homeInstructions: action.instructions
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
    case consts.TOGGLE_PROJECTS_FAB:
      return {
        ...state,
        showFABOptions: !state.showFABOptions
      }
    default:
      return state;
  }
};

export default homeScreenReducer;
