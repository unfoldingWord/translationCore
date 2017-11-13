/* eslint-env jest */

import React from 'react';
import ProjectCard from '../src/js/components/home/projectsManagement/ProjectCard';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Tests for ProjectCard React Component
describe('Test ProjectCard component',()=>{
  test('Comparing ProjectCard Component render should match snapshot', () => {
    const props = {
      user: "johndoe",
      key: "en_1co",
      projectDetails: {
        projectName: 'en_1co_ulb',
        projectSaveLocation: '/tmp/en_1co_ulb',
        accessTimeAgo: '5 days ago',
        bookAbbr: '1co',
        bookName: '1 Corinthians',
        target_language: {
          id: 'en',
          name: 'English'
        },
        isSelected: false
      },
      actions: {
        selectProject: () => jest.fn()
      }
    };
    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <ProjectCard {...props} />
      </MuiThemeProvider>
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});
