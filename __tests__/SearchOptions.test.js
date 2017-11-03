/* eslint-env jest */

import React from 'react';
import SearchOptions from '../src/js/components/home/projectsManagement/onlineImport/SearchOptions';
import renderer from 'react-test-renderer';
require('jest');

// Tests for ProjectFAB React Component
describe('Test SearchOptions component',()=>{
  test('Comparing SearchOptions Component render with snapshot', () => {
    // const renderedValue =  renderer.create(<ProjectFAB homeScreenReducer={{showFABOptions: true}} />).toJSON();
    const userName = "dummy";
    const mock_searchReposByUser = jest.fn();
    mock_searchReposByUser.mockReturnValue(true);
    const mock_actions = { searchReposByUser: mock_searchReposByUser };

    const importLink = "link";

    const renderedValue =  renderer.create(<SearchOptions actions={mock_actions} importLink={importLink} username={userName} />).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});

{/*<SearchOptions*/}
  {/*actions={this.props.actions}*/}
  {/*importLink={importLink}*/}
  {/*username={userdata.username}*/}
{/*/>*/}