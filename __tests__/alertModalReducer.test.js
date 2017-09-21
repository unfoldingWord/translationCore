/* eslint-env jest */

import alertModalReducer from '../src/js/reducers/alertModalReducer';
import consts from '../src/js/actions/ActionTypes';

const initialState = {
  alertDialogVisibility: false,
  alertDialogLoading: false,
  alertText: null,
  button1: null,
  button2: null,
  callback: null
};

describe('alertModalReducer', () => {
  test('should return the initial state', () => {
    expect(
      alertModalReducer(undefined, {})
    ).toEqual(initialState);
  });

  test('should handle OPEN_ALERT_DIALOG', () => {
    expect(
      alertModalReducer({}, {
        type: consts.OPEN_ALERT_DIALOG,
        alertMessage: "alert message",
        loading: true
      })
    ).toEqual({
      alertDialogVisibility: true,
      alertDialogLoading: true,
      alertText: "alert message",
      button1: null,
      button2: null,
      callback: null
    });

    expect(
      alertModalReducer(
        initialState,
        {
          type: consts.OPEN_ALERT_DIALOG,
          alertMessage: "alert message",
          loading: true
        }
      )
    ).toEqual({
      alertDialogVisibility: true,
      alertDialogLoading: true,
      alertText: "alert message",
      button1: null,
      button2: null,
      callback: null
    });
  });

  test('should handle OPEN_OPTION_DIALOG', () => {
    const callback = () => {};
    expect(
      alertModalReducer(
        initialState,
        {
          type: consts.OPEN_OPTION_DIALOG,
          alertMessage: "alert message",
          button1Text: "button1 Text",
          button2Text: "button2 Text",
          callback
        }
      )
    ).toEqual({
      alertDialogVisibility: true,
      alertDialogLoading: false,
      alertText: "alert message",
      button1: "button1 Text",
      button2: "button2 Text",
      callback
    });
  });

  test('should handle CLOSE_ALERT_DIALOG', () => {
    expect(
      alertModalReducer(
        {
          alertDialogVisibility: true,
          alertDialogLoading: true,
          alertText: null,
          button1: null,
          button2: null,
          callback: null
        },
        {
          type: consts.CLOSE_ALERT_DIALOG
        }
      )
    ).toEqual(initialState);
  });
});
