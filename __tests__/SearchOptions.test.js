/* eslint-env jest */

import React from 'react';
import SearchOptions from '../src/js/components/home/projectsManagement/onlineImport/SearchOptions';
import renderer from 'react-test-renderer';
import {MuiThemeProvider} from "material-ui";
require('jest');

// Tests for ProjectFAB React Component
describe('Test SearchOptions component',()=>{
  test('Comparing SearchOptions Component should render with snapshot and have "Language Code" on floating label', () => {
    const userName = "dummy";
    const mock_searchReposByUser = jest.fn();
    mock_searchReposByUser.mockReturnValue(true);
    const mock_actions = { searchReposByUser: mock_searchReposByUser };
    const importLink = "link";
    const expectedSearchLabels = ['User','Language Code','Book'];

    const renderedValue =  renderer.create(
      <MuiThemeProvider>
        <SearchOptions actions={mock_actions} importLink={importLink} username={userName} />
      </MuiThemeProvider>
    ).toJSON();
    
    const labels = searchForChildren(renderedValue, 'label');
    const labelsText = getDisplayedText(labels);
    expect(labelsText).toEqual(expectedSearchLabels);
  });

  //
  // Helper
  //

  function getDisplayedText(labels) {
    const labelsText = [];
    labels.forEach((labels) => {
      labels.forEach((item) => {
        if (typeof item === 'string') {
          labelsText.push(item);
        }
      });
    });
    return labelsText;
  }

  function searchForChildren(search, find) {
    let found = [];
    if (search.children) {
      search.children.forEach((child) => {
        if (child.type === find) {
          found.push(child.children);
        } else if(child.children) {
          const found_below = searchForChildren(child, find);
          if(found_below.length) {
            found = found.concat(found_below);
          }
        }
      });
    }
    return found;
  }
});

