/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import { MuiThemeProvider } from 'material-ui';
import SearchOptions from '../js/components/home/projectsManagement/OnlineImportModal/SearchOptions';
require('jest');

// Tests for ProjectFAB React Component
describe('Test SearchOptions component',()=>{
  test('Comparing SearchOptions Component should render with snapshot and have "Language Code" on floating label', () => {
    const userName = 'dummy';
    const mock_searchReposByUser = jest.fn();
    mock_searchReposByUser.mockReturnValue(true);
    const mock_actions = { searchReposByUser: mock_searchReposByUser };
    const importLink = 'link';
    const expectedSearchLabels = ['user','projects.language_code','projects.book'];

    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <SearchOptions actions={mock_actions}
          translate={key => key}
          importLink={importLink}
          username={userName} />
      </MuiThemeProvider>,
    ).toJSON();

    const labels = searchForChildren(renderedValue, 'label');
    const labelsText = getDisplayedText(labels);
    expect(labelsText).toEqual(expectedSearchLabels);
  });

  //
  // Helper
  //

  /**
   * @description - get text shown on rendered html (json format)
   * @param rendered - rendered html (json format)
   * @return {Array}
   */
  function getDisplayedText(rendered) {
    const displayedText = [];

    rendered.forEach((item) => {
      let text = '';

      if (typeof item === 'string') {
        if ((item.length) && ((item !== ' ') && (item !== '\xA0'))) { // ignore " " whitespace
          text = item;
        }
      } else if (Array.isArray(item)) {
        const array_labels = getDisplayedText(item);
        text = array_labels.join('');
      } else if (item.children) {
        text = getDisplayedTextFromChildren(item);
      }
      displayedText.push(text);
    });
    return displayedText;
  }

  /**
   * @description - get text shown on renderedItem
   * @param renderedItem
   * @return {String}
   */
  function getDisplayedTextFromChildren(renderedItem) {
    const child_texts = getDisplayedText(renderedItem.children);
    let text = '';

    child_texts.forEach((child_label) => {
      if (child_label.length) {
        text += '[' + child_label + ']';
      }
    });
    return text;
  }

  /**
   * @description - find children that match findType
   * @param search
   * @param findType
   * @return {Array}
   */
  function searchForChildren(search, findType) {
    let found = [];

    if (search.children) {
      search.children.forEach((child) => {
        if (child.type === findType) {
          found.push(child.children);
        } else if (child.children) {
          const found_below = searchForChildren(child, findType);

          if (found_below.length) {
            found = found.concat(found_below);
          }
        }
      });
    }
    return found;
  }
});

