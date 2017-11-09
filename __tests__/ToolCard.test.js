/* eslint-env jest */

import React from 'react';
import ToolCard from '../src/js/components/home/toolsManagement/ToolCard';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import consts from '../src/js/actions/ActionTypes';

jest.mock('../src/js/components/home/toolsManagement/ToolCardProgress', () => 'ToolCardProgress');

// Tests for ToolCard React Component
describe('Test ToolCard component',()=>{
  test('Comparing ToolCard Component render with snapshot taken 11/07/2017 in __snapshots__ should match', () => {
    const props = {
      loggedInUser: true,
      currentProjectToolsProgress: {
        test: 100
      },
      metadata: {
        toolName: 'test'
      },
      actions: {
        getProjectProgressForTools: (toolName) => {
          return () => {
            return {
              type: consts.SET_PROJECT_PROGRESS_FOR_TOOL,
              toolName,
              progress: 100
            };
          };
        }
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
