/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ProjectCard from '../js/components/home/projectsManagement/ProjectCard';
import TruncateAcronym from '../js/components/home/projectsManagement/TruncateAcronym';

jest.mock('moment', () => () => ({ to: () => '5 days ago' }));

// Tests for ProjectCard React Component
describe('Test ProjectCard component',()=>{
  test('Comparing ProjectCard Component render should match snapshot', () => {
    const props = {
      user: 'johndoe',
      key: 'en_1co',
      projectDetails: {
        projectName: 'en_1co_ulb',
        projectSaveLocation: '<TEMP_DIR>/en_1co_ulb',
        lastOpened: '2019-08-21T15:35:16.682Z',
        bookAbbr: '1co',
        bookName: '1 Corinthians',
        target_language: {
          id: 'en',
          name: 'English',
        },
        isSelected: false,
      },
      onSelect: () => jest.fn(),
      translate: key => key,
    };
    const renderedValue = shallow(
      <MuiThemeProvider>
        <ProjectCard
          key={props.key}
          user={props.user}
          onSelect={props.onSelect}
          translate={props.translate}
          projectDetails={props.projectDetails} />
      </MuiThemeProvider>,
    ).dive();
    expect(renderedValue).toMatchSnapshot();
  });
  test('Truncate long items.', () => { // probably should be moved into its own test
    // but currently only used by project card
    var shorterString = TruncateAcronym('now is the time for all good men', 'en-ult', 23);
    expect(shorterString).toMatchSnapshot();
  });
});


