import consts from '../src/js/actions/ActionTypes';
import * as AlertModalActions from '../src/js/actions/AlertModalActions';
import { expect, assert } from 'chai';

describe('AlertModalActions.openAlertDialog', () => {
  it('Should create an action to open the alert dialog with a message and without spinning icon. When the argument Loading = null', () => {
    const alertMessage = "alert message";
    const expectedAction = {
      type: consts.OPEN_ALERT_DIALOG,
      alertMessage: alertMessage,
      loading: null
    };
    expect(AlertModalActions.openAlertDialog(alertMessage, null)).to.eql(expectedAction);
  });

  it('Should create an action to open the alert dialog with a message and without spinning icon. When the argument Loading = false', () => {
    const alertMessage = "alert message";
    const expectedAction = {
      type: consts.OPEN_ALERT_DIALOG,
      alertMessage: alertMessage,
      loading: false
    };
    expect(AlertModalActions.openAlertDialog(alertMessage, false)).to.eql(expectedAction);
  });

  it('Should create an action to open the alert dialog with a message with spinning icon. When the argument Loading = true', () => {
    const alertMessage = "alert message";
    const expectedAction = {
      type: consts.OPEN_ALERT_DIALOG,
      alertMessage: alertMessage,
      loading: true
    };
    expect(AlertModalActions.openAlertDialog(alertMessage, true)).to.eql(expectedAction);
  });
});

describe('AlertModalActions.openOptionDialog', () => {
  it('Should create an action to open the alert dialog with two button options', () => {
    const alertMessage = "alert message";
    const callback = () => {};
    const button1Text = "button1 text";
    const button2Text = "button2 text";
    const expectedAction = {
      type: consts.OPEN_OPTION_DIALOG,
      alertMessage,
      callback,
      button1Text,
      button2Text
    };
    assert.isString(alertMessage);
    assert.isFunction(callback);
    assert.isString(button1Text);
    assert.isString(button2Text);
    expect(AlertModalActions.openOptionDialog(alertMessage, callback, button1Text, button2Text)).to.eql(expectedAction);
  });
});

describe('AlertModalActions.closeAlertDialog', () => {
  it('Should create an action to close the alert dialog', () => {
    const expectedAction = {
      type: consts.CLOSE_ALERT_DIALOG
    };
    expect(AlertModalActions.closeAlertDialog()).to.eql(expectedAction);
  });
});
