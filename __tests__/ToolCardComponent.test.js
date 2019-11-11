import React from 'react';
import _ from 'lodash';
// components
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ToolCard from '../src/js/components/home/toolsManagement/ToolCard';

// constant
import * as consts from '../src/js/common/constants';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('fs-extra');

describe('ToolCard Component', () => {
  const translate = (key, options) => {
    if (options) {
      const firstKey = Object.keys(options)[0];
      return key + ': ' + options[firstKey];
    }
    return key;
  };

  const base_state = {
    homeScreenReducer: {
      stepper: {
        stepIndex: 1,
        nextStepName: 'Project Information',
        previousStepName: 'Cancel',
        nextDisabled: false,
      },
    },
    projectInformationCheckReducer: {
      bookId: 'tit',
      resourceId: 'ult',
      nickname: 'My Project',
      languageId: 'en',
      languageName: 'english',
      languageDirection: 'ltr',
      contributors: ['manny', 'some other guy'],
      checkers: ['manny', 'superman'],
    },
    projectDetailsReducer: {
      projectSaveLocation: '../en_tit',
    },
    loginReducer: {
      loggedInUser: true,
      userdata: { username: 'dummy-test' },
    },
    settingsReducer: { currentSettings: { developerMode: true } },
  };

  test('should match snapshot with required props', () => {
    // given
    const props = {
      tool: consts.TRANSLATION_WORDS,
      bookId: 'tit',
      translate,
      developerMode: false,
      actions: {
        updateCategorySelection: jest.fn(),
        updateSubcategorySelection: jest.fn(),
      },
      selectedCategories: ['apostle'],
      availableCategories: { 'kt': [{ 'id':'apostle' }] },
    };
    const state = _.cloneDeep(base_state); // clone before modifying
    const store = mockStore(state);

    // when
    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <ToolCard store={store} {...props} />
      </MuiThemeProvider>
    ).toJSON();

    // then
    expect(renderedValue).toMatchSnapshot();
  });
});
