/* eslint-env jest */

import React from 'react';
import ToolCard from '../src/js/components/home/toolsManagement/ToolCard';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

jest.mock('../src/js/components/home/toolsManagement/ToolCardProgress', () => 'ToolCardProgress');

// Tests for ToolCard React Component
describe('Test ToolCard component',()=>{
  test('Comparing ToolCard Component render with snapshot taken 11/07/2017 in __snapshots__ should match', () => {
    const props = {
      loggedInUser: true,
      currentProjectToolsProgress: {
        test: 0.5
      },
      metadata: {
        name: 'test'
      },
      translate: key => key,
      actions: {
        getProjectProgressForTools: () => jest.fn()
      }
    };
    const renderedValue =  renderer.create(
      <MuiThemeProvider>
        <ToolCard {...props} />
      </MuiThemeProvider>
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});
