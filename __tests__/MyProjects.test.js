/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import MyProjects from '../src/js/components/home/projectsManagement/MyProjects';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Tests for MyProjects React Component
describe('MyProjects component renders correctly', () => {
  test('Comparing MyProjects component render with snapshot in __snapshots__ should match', () => {
    const myProjects = [
      {
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
      {
        projectName: 'hi_tit',
        projectSaveLocation: '/tmp/hi_tit',
        accessTimeAgo: '6 days ago',
        bookAbbr: 'tit',
        bookName: 'Titus',
        target_language: {
          id: 'hi',
          name: 'Hindi'
        },
        isSelected: false
      }
    ];
    const userdata = {
      username: 'manny-test'
    };
    const actions = {
      selectProject: () => jest.fn()
    };

    const tree = renderer.create(
      <MuiThemeProvider>
        <MyProjects
          myProjects={myProjects}
          user={userdata}
          actions={actions} />
      </MuiThemeProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
