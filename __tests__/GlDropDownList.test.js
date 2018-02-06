/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Components
import GlDropDownList from '../src/js/components/home/toolsManagement/GlDropDownList';

describe('Test Gateway Language Drop Down List',() => {
  test('Comparing dropdownlist Component render with snapshot', () => {
    const props = {
      currentGLSelection: 1,
      selectionChange: jest.fn
    };
    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <GLDropDownList{...props} />
      </MuiThemeProvider>
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});
