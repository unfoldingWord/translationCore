import React from 'react';
// components
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import HomeStepper from '../js/components/home/Stepper';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('fs-extra');

describe('HomeStepper', () => {
  const translate = (key, options) => {
    if (options) {
      const firstKey = Object.keys(options)[0];
      return key + ': ' + options[firstKey];
    }
    return key;
  };

  const manifest = {
    generator:{
      name: 'tc-desktop',
      build: '',
    },
    target_language:{
      id: 'en',
      name: 'English',
      direction: 'ltr',
    },
    ts_project:{
      id: 'tit',
      name: 'Titus',
    },
    project:{
      id: 'tit',
      name: 'Titus',
    },
    type:{
      id: 'text',
      name: 'Text',
    },
    source_translations:[
      {
        language_id: 'en',resource_id: 'ult',checking_level: '',date_modified: '2018-01-31T19:19:27.914Z',version: '',
      }],
    resource:{
      id: '',
      name: '',
    },
    translators:[],
    checkers:[],time_created: '2018-01-31T19:19:27.914Z',
    tools:[],
    repo: '',
    tcInitialized:true,
    tc_version:1,
    license: 'CC BY-SA 4.0',
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
      manifest,
    },
    loginReducer: {
      loggedInUser: true,
      userdata: { username: 'dummy-test' },
    },
  };

  test('HomeStepper component without nickname should match snapshot with required props', () => {
    // given
    const props = { translate };
    const state = JSON.parse(JSON.stringify(base_state)); // clone before modifying
    const store = mockStore(state);

    // when
    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <HomeStepper store={store} {...props} />
      </MuiThemeProvider>,
    ).toJSON();

    // then
    expect(renderedValue).toMatchSnapshot();
  });

  test('HomeStepper component with nickname should match snapshot with required props', () => {
    // given
    const props = { translate };
    const state = JSON.parse(JSON.stringify(base_state)); // clone before modifying
    state.projectDetailsReducer.manifest.resource.name = 'Nickname';
    const store = mockStore(state);

    // when
    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <HomeStepper store={store} {...props} />
      </MuiThemeProvider>,
    ).toJSON();

    // then
    expect(renderedValue).toMatchSnapshot();
  });
});
