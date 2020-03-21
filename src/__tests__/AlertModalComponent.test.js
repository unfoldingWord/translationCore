/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Alert from '../js/components/dialogComponents/Alert';

// Tests for Alert Modal React Component
describe('Alert Modal Componenet', () => {
  test('Should only mount dialog once, and never unmount if only the state is changing.', () => {
    const state = {
      actions: { closeAlertDialog: () => { } },
      alertModalReducer: {
        alertText: 'Testing component',
        alertDialogVisibility: true,
        alertDialogLoading: false,
        callback: jest.fn(),
        button1: 'yes',
        button2: 'no',
      },
      translate: key => key,
    };
    Alert.prototype.componentDidMount = jest.fn();
    Alert.prototype.componentWillUnmount = jest.fn();
    let mountSpy = jest.spyOn(Alert.prototype, 'componentDidMount');
    let umountSpy = jest.spyOn(Alert.prototype, 'componentWillUnmount');
    let renderSpy = jest.spyOn(Alert.prototype, 'render');
    const tree = renderer.create(
      <MuiThemeProvider>
        <Alert {...state} />
      </MuiThemeProvider>,
    );

    state.alertModalReducer.alertText = 'New Text';
    state.alertModalReducer.alertDialogVisibility = false;
    tree.update(<MuiThemeProvider>
      <Alert {...state} />
    </MuiThemeProvider>);
    expect(mountSpy).toHaveBeenCalledTimes(1);
    expect(umountSpy).toHaveBeenCalledTimes(0);
    expect(renderSpy).toHaveBeenCalledTimes(2);
    expect(tree).toMatchSnapshot();
  });
});
