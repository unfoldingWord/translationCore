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
};

const alertModalReducer = (state = initialState, action) => {
  switch (action.type) {
  case consts.OPEN_ALERT_DIALOG:
    return {
      ...state,
      alertDialogVisibility: true,
      alertDialogLoading: action.loading,
      alertText: action.alertMessage,
      button1: null,
      button2: null,
      buttonLink: null,
      callback: null,
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
    };
  case consts.CLOSE_ALERT_DIALOG:
    return initialState;
  default:
    return state;
  }
};

export default alertModalReducer;

/**
 * Checks if the alert dialog is open
 * @param state
 * @return {boolean}
 */
export const getAlertIsOpen = state => state === initialState;
