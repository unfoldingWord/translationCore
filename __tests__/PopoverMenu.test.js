/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import PopoverMenu from '../src/js/components/PopoverMenu';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import SettingsIcon from 'material-ui/svg-icons/action/settings';

test('default', () => {
  const component = renderer.create(
    <MuiThemeProvider>
      <PopoverMenu label="menu"/>
    </MuiThemeProvider>
  );
  expect(component).toMatchSnapshot();
});


test('with icon', () => {
  const component = renderer.create(
    <MuiThemeProvider>
      <PopoverMenu label="menu" icon={<SettingsIcon/>}/>
    </MuiThemeProvider>
  );
  expect(component).toMatchSnapshot();
});

test('dark variant', () => {
  const component = renderer.create(
    <MuiThemeProvider>
      <PopoverMenu label="menu" icon={<SettingsIcon/>} variant="dark"/>
    </MuiThemeProvider>
  );
  expect(component).toMatchSnapshot();
});

// TODO: add enzyme tests to check menu open state
