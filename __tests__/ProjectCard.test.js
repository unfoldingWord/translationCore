/* eslint-env jest */

import React from 'react';
import ProjectCard from '../src/js/components/home/projectsManagement/ProjectCard';
import renderer from 'react-test-renderer';
import * as ProjectSelectionActions from '../src/js/actions/ProjectSelectionActions';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TranslateIcon from 'material-ui/svg-icons/action/translate';

// Tests for ProjectCard React Component
describe('Test ProjectCard component',()=>{
  test('Comparing ProjectCard Component render with snapshot taken 11/09/2017 in __snapshots__ should match', () => {
    const projectDetails = {
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
    };
    const actions = {
      selectProject: (projectPath) => {
        dispatch(ProjectSelectionActions.selectProject(projectPath));
      }
    };
    const renderedValue =  renderer.create(
      <MuiThemeProvider>
        <ProjectCard
          user={"johndoe"}
          key={"en_1co"}
          projectDetails={projectDetails}
          actions={actions} />
      </MuiThemeProvider>
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });

  test('Comparing ProjectCard Component should use characters icon for language graphic', () => {
    // given
    const projectDetails = {
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
    };
    const actions = {
      selectProject: (projectPath) => {
        dispatch(ProjectSelectionActions.selectProject(projectPath));
      }
    };
    const translateSvg = getTranslationIconSvg();
    const expectedIcons = ['glyphicon glyphicon-time','glyphicon glyphicon-book', translateSvg];

    // when
    const renderedValue =  renderer.create(
      <MuiThemeProvider>
        <ProjectCard
          user={"johndoe"}
          key={"en_1co"}
          projectDetails={projectDetails}
          actions={actions} />
      </MuiThemeProvider>
    ).toJSON();

    // then
    validateDetailIcons(renderedValue, expectedIcons);
  });

  //
  // Helpers
  //

  function getTranslationIconSvg() {
    const renderedTranslateIcon = renderer.create(
      <MuiThemeProvider>
        <TranslateIcon style={{height: "20px", width: "20px", color: "#000000", marginRight: '5px', marginTop: '6px'}}/>
      </MuiThemeProvider>
    ).toJSON();
    const iconPath = searchForChildren(renderedTranslateIcon, 'path');
    const translateSvg = iconPath.length ? iconPath[0].props.d : null;
    return translateSvg;
  }

  function validateDetailIcons(renderedValue, expectedIcons) {
    const cardDetails = searchForChildren(renderedValue, 'td');
    expect(cardDetails.length).toEqual(expectedIcons.length);
    for (let i = 0; i < cardDetails.length; i++) {
      let iconFound = null;
      const detail = cardDetails[i];
      const detailLayout = searchForChildren(detail, 'td');
      const iconDetail = detailLayout[0];
      const iconSpan = searchForChildren(iconDetail, 'span');
      if (iconSpan.length) {
        iconFound = iconSpan[0].props.className;
      } else {
        const iconPath = searchForChildren(iconDetail, 'path');
        if (iconPath.length) {
          iconFound = iconPath[0].props.d;
        }
      }
      expect(iconFound).toEqual(expectedIcons[i]);
    }
  }

  /**
   * @description - get text shown on rendered html (json format)
   * @param rendered - rendered html (json format)
   * @return {Array}
   */
  function getDisplayedText(rendered) {
    const displayedText = [];
    rendered.forEach((item) => {
      let text = "";
      if (typeof item === 'string') {
        if ((item.length) && ((item !== " ") && (item !== "\xA0"))) { // ignore " " whitespace
          text = item;
        }
      } else if(Array.isArray(item)) {
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
    let text = "";
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
  function searchForChildren(search, findType, depth=0) {
    let found = [];
    if(search._depth_) {
      depth = search._depth_;
    }
    if (search.children) {
      search.children.forEach((child) => {
        if (child.type === findType) {
          child._depth_ = depth+1; // save depth
          found.push(child);
        } else if(child.children) {
          const found_below = searchForChildren(child, findType, depth+1);
          if(found_below.length) {
            found = found.concat(found_below);
          }
        }
      });
    }
    return found;
  }

});
