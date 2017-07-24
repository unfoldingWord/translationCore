import React from 'react';
import consts from '../actions/ActionTypes';

const initialState = {
  displayHomeView: true,
  showWelcomeSplash: true,
  homeInstructions: <div></div>,
  stepper: {
    finished: false,
    stepIndex: 0,
    nextStepName: 'Go To User',
    previousStepName: '',
    nextDisabled: false
  },
  showFABOptions: false,
  showLicenseModal: false,
  onlineImportModalVisibility: false
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
          stepIndex: action.stepIndex,
          previousStepName: action.previousStepName,
          nextStepName: action.nextStepName
        }
      };
    case consts.GO_TO_PREVIOUS_STEP:
      return {
        ...state,
        stepper: {
          finished: false,
          stepIndex: action.stepIndex,
          previousStepName: action.previousStepName,
          nextStepName: action.nextStepName
        }
      };
    case consts.TOGGLE_PROJECTS_FAB:
      return {
        ...state,
        showFABOptions: !state.showFABOptions
      }
    case consts.OPEN_ONLINE_IMPORT_MODAL:
      return {
        ...state,
        onlineImportModalVisibility: true
      }
    case consts.CLOSE_ONLINE_IMPORT_MODAL:
      return {
        ...state,
        onlineImportModalVisibility: false
      }
    case consts.UPDATE_NEXT_BUTTON_STATUS:
      return {
        ...state,
        stepper: {
          ...state.stepper,
          nextDisabled: action.nextDisabled
        }
      }
    case consts.OPEN_LICENSE_MODAL:
      return {
        ...state,
        showLicenseModal: true
      }
    case consts.CLOSE_LICENSE_MODAL:
      return {
        ...state,
        showLicenseModal: false
      }
    default:
      return state;
  }
};

export default homeScreenReducer;
