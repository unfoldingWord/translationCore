/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer';
import { MuiThemeProvider } from 'material-ui';
import SearchResults from '../js/components/home/projectsManagement/OnlineImportModal/SearchResults';
require('jest');
jest.mock('material-ui/internal/EnhancedSwitch');

// Tests for ProjectFAB React Component
describe('Test SearchResults component',()=>{
  test('Comparing SearchResults Component should render card with order (title,user,lang,book)', () => {
    const mock_handleURLInputChange = jest.fn();
    mock_handleURLInputChange.mockReturnValue(true);
    const importLink = 'link';
    const title = 'bes_tit_text_reg';
    const user = 'dummy_user';
    const repos = [
      {
        name: title,
        html_url: 'https://git.door43.org/dummy_user/bes_tit_text_reg',
        owner: { login: user },
      },
    ];
    const languageCode = title.split('_')[0];
    const bookDescr = 'book_list.nt.tit\xA0(tit)';
    const expectedCardLabels = [`[${title}]`,user,languageCode,bookDescr]; // expect labels to be in this order

    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <SearchResults repos={repos}
          translate={key => key}
          importLink={importLink}
          handleURLInputChange={mock_handleURLInputChange} />
      </MuiThemeProvider>,
    ).toJSON();

    const tds = searchForChildren(renderedValue, 'td');
    const tdsText = getDisplayedText(tds);
    expect(tdsText).toEqual(expectedCardLabels);
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

