/* eslint-env jest */

import React from 'react';
import ProjectCard     from '../src/js/components/home/projectsManagement/ProjectCard';
import TruncateAcronym from '../src/js/components/home/projectsManagement/TruncateAcronym';
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
      onSelect: () => jest.fn(),
      actions: {
        openOnlyProjectDetailsScreen: jest.fn(),
        uploadProject: jest.fn(),
        exportToCSV: jest.fn(),
        exportToUSFM: jest.fn()
      },
      translate: key => key
    };
    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <ProjectCard {...props} />
      </MuiThemeProvider>
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
  test('Truncate long items.', () => { // probably should be moved into its own test
                                       // but currently only used by project card
    var shorterString = TruncateAcronym("now is the time for all good men", "en-ult", 23);
    expect(shorterString).toMatchSnapshot();
  });
});


