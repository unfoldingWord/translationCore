/* eslint-env jest */

import consts from '../src/js/actions/ActionTypes';
import * as AlertModalActions from '../src/js/actions/AlertModalActions';

describe('AlertModalActions.openAlertDialog', () => {
  test('Should create an action to open the alert dialog with a message and without spinning icon. When the argument Loading = null', () => {
    const alertMessage = "alert message";
    const expectedAction = {
      type: consts.OPEN_ALERT_DIALOG,
      alertMessage: alertMessage,
      loading: null
    };
    expect(AlertModalActions.openAlertDialog(alertMessage, null)).toEqual(expectedAction);
  });

  test('Should create an action to open the alert dialog with a message and without spinning icon. When the argument Loading = false', () => {
    const alertMessage = "alert message";
    const expectedAction = {
      type: consts.OPEN_ALERT_DIALOG,
      alertMessage: alertMessage,
      loading: false
    };
    expect(AlertModalActions.openAlertDialog(alertMessage, false)).toEqual(expectedAction);
  });

  test('Should create an action to open the alert dialog with a message with spinning icon. When the argument Loading = true', () => {
    const alertMessage = "alert message";
    const expectedAction = {
      type: consts.OPEN_ALERT_DIALOG,
      alertMessage: alertMessage,
      loading: true
    };
    expect(AlertModalActions.openAlertDialog(alertMessage, true)).toEqual(expectedAction);
  });
});

describe('AlertModalActions.openOptionDialog', () => {
  test('Should create an action to open the alert dialog with two button options', () => {
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
    expect(typeof alertMessage).toEqual('string');
    expect(typeof callback).toEqual('function');
    expect(typeof button1Text).toEqual('string');
    expect(typeof button2Text).toEqual('string');
    expect(AlertModalActions.openOptionDialog(alertMessage, callback, button1Text, button2Text)).toEqual(expectedAction);
  });
});

describe('AlertModalActions.closeAlertDialog', () => {
  test('Should create an action to close the alert dialog', () => {
    const expectedAction = {
      type: consts.CLOSE_ALERT_DIALOG
    };
    expect(AlertModalActions.closeAlertDialog()).toEqual(expectedAction);
  });
});
