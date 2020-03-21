/* eslint-env jest */
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { shallow } from 'enzyme';
import MyProjects from '../js/components/home/projectsManagement/MyProjects';

// Tests for MyProjects React Component
describe('MyProjects component renders correctly', () => {
  test('MyProjects component render should match snapshot', () => {
    const myProjects = [
      {
        projectName: 'en_1co_ulb',
        projectSaveLocation: '<TEMP_DIR>/en_1co_ulb',
        accessTimeAgo: '5 days ago',
        bookAbbr: '1co',
        bookName: '1 Corinthians',
        target_language: {
          id: 'en',
          name: 'English',
        },
        isSelected: false,
      },
      {
        projectName: 'hi_tit',
        projectSaveLocation: '<TEMP_DIR>/hi_tit',
        accessTimeAgo: '6 days ago',
        bookAbbr: 'tit',
        bookName: 'Titus',
        target_language: {
          id: 'hi',
          name: 'Hindi',
        },
        isSelected: false,
      },
    ];
    const userdata = { username: 'manny-test' };
    const renderedValue = shallow(
      <MuiThemeProvider>
        <MyProjects
          translate={key => key}
          myProjects={myProjects}
          user={userdata}
          onSelect={() => jest.fn()} />
      </MuiThemeProvider>,
    );

    expect(renderedValue).toMatchSnapshot();
  });
});

describe('MyProjects shows instruction if no projects', () => {
  test('MyProjects component render should match snapshot', () => {
    const myProjects = [];
    const userdata = { username: 'manny-test' };
    const blank = shallow(
      <MuiThemeProvider>
        <MyProjects
          translate={key => key}
          myProjects={myProjects}
          user={userdata}
          onSelect={() => jest.fn()} />
      </MuiThemeProvider>,
    );

    expect(blank).toMatchSnapshot();
  });
});
