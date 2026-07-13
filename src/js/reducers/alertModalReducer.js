import consts from '../actions/ActionTypes';

const initialState = {
  alertDialogVisibility: false,
  alertDialogLoading: false,
  alertText: null,
  button1: null,
  button2: null,
  buttonLink: null,
  callback: null,
  callback2: null,
  notCloseableAlert: false,
  button3: null,
};

/**
 * Redux reducer for managing alert modal state.
 * Handles displaying alert dialogs with various button configurations and callbacks.
 *
 * @param {Object} state - Current state (defaults to initialState)
 * @param {Object} action - Action object with type and payload
 * @returns {Object} Updated state
 */
const alertModalReducer = (state = initialState, action) => {
  switch (action.type) {
  case consts.OPEN_ALERT_DIALOG:
    return {
      ...state,
      alertDialogVisibility: true,
      alertDialogLoading: action.loading,
      alertText: action.alertMessage,
      button1: action.buttonText,
      button2: null,
      buttonLink: null,
      callback: action.callback,
    };
  case consts.OPEN_OPTION_DIALOG:
    return {
      ...state,
      alertDialogVisibility: true,
      alertDialogLoading: false,
      alertText: action.alertMessage,
      button1: action.button1Text,
      button2: action.button2Text,
      buttonLink: action.buttonLinkText,
      callback: action.callback,
      callback2: action.callback2,
      notCloseableAlert: action.notCloseableAlert,
      button3: action.button3Text,
    };
  case consts.CLOSE_ALERT_DIALOG:
    return initialState;
  default:
    return state;
  }
};

export default alertModalReducer;

/**
 * Checks if the alert dialog is currently closed (state matches initial state).
 *
 * @param {Object} state - The alert modal reducer state
 * @returns {boolean} True if the state matches initialState (dialog is closed), false otherwise
 */
export const getAlertIsOpen = state => state === initialState;
