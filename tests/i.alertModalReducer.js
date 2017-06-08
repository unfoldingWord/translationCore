import alertModalReducer from '../src/js/reducers/alertModalReducer';
import consts from '../src/js/actions/ActionTypes';
import { expect, assert } from 'chai';

const initialState = {
  alertDialogVisibility: false,
  alertDialogLoading: false,
  alertText: null,
  button1: null,
  button2: null,
  callback: null
};

describe('alertModalReducer', () => {
  it('should return the initial state', () => {
    expect(
      alertModalReducer(undefined, {})
    ).to.eql(initialState);
  });

  it('should handle OPEN_ALERT_DIALOG', () => {
    expect(
      alertModalReducer({}, {
        type: consts.OPEN_ALERT_DIALOG,
        alertMessage: "alert message",
        loading: true
      })
    ).to.eql({
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
    ).to.eql({
      alertDialogVisibility: true,
      alertDialogLoading: true,
      alertText: "alert message",
      button1: null,
      button2: null,
      callback: null
    });
  });

  it('should handle OPEN_OPTION_DIALOG', () => {
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
    ).to.eql({
      alertDialogVisibility: true,
      alertDialogLoading: false,
      alertText: "alert message",
      button1: "button1 Text",
      button2: "button2 Text",
      callback
    });
  });

  it('should handle CLOSE_ALERT_DIALOG', () => {
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
    ).to.eql(initialState);
  });
});
