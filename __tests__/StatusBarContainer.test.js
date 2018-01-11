/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer';
import StatusBarContainer from "../src/js/containers/StatusBarContainer";
import * as statusBarContainer from "../src/js/containers/StatusBarContainer";
import {Provider} from "react-redux";
import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import reducers from '../src/js/reducers';
import * as ProjectDetailsActions from "../src/js/actions/ProjectDetailsActions";
import * as BodyUIActions from "../src/js/actions/BodyUIActions";
import consts from '../src/js/actions/ActionTypes';
import * as LoginActions from "../src/js/actions/LoginActions";
import path from 'path-extra';
import { mount } from 'enzyme';
const os = require('os');

// Tests for ProjectFAB React Component
describe('Test StatusBarContainer component',()=>{
  let store;
  beforeEach(() => {
    // create a new store instance for each test
    store = createStore(
      reducers,
      applyMiddleware(thunk)
    );
  });

  test('StatusBarContainer Component on current system should match snapshot', () => {
    // given
    const osType = os.type().toLowerCase();
    const isWin = (osType.indexOf('win') === 0);
    const projectName_ = "en_tit_ulb";
    let projectFolder = "/user/dummy/tc/projects/";
    if(isWin) { // if windows, switch to posix
      projectFolder = "C:\\Users\\Dummy\\tC\\projects\\";
    }
    const projectPath = projectFolder + projectName_;
    const toolTitle = "Miracle Tool";
    const username = "Local User";
    setupStore(projectPath, toolTitle, username);

    // when
    const renderedValue =  renderer.create(
      <Provider store={store}>
        <StatusBarContainer/>
      </Provider>
    ).toJSON();

    // then
    expect(renderedValue).toMatchSnapshot();
  });

  test('StatusBarContainer.getBaseName on mac/linux should render baseName correctly', () => {
    // given
    const expectedProjectName = "en_tit_ulb";
    const projectPath = "/user/dummy/tc/projects/" + expectedProjectName;
    const posixPath = path.posix;

    // when
    const projectName = statusBarContainer.getBaseName(projectPath, posixPath);

    // then
    expect(projectName).toEqual(expectedProjectName);
  });

  test('StatusBarContainer.getBaseName on windows should render baseName correctly', () => {
    // given
    const expectedProjectName = "en_tit_ulb";
    const projectPath = "C:\\Users\\Dummy\\tC\\projects\\" + expectedProjectName;
    const winPath = path.win32;

    // when
    const projectName = statusBarContainer.getBaseName(projectPath, winPath);

    // then
    expect(projectName).toEqual(expectedProjectName);
  });

  //
  // Helpers
  //

  /**
   * @description initialize the store for testing
   * @param projectPath
   * @param toolTitle
   * @return {string}
   */
  function setupStore(projectPath, toolTitle, username) {
    store.dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
    store.dispatch(BodyUIActions.toggleHomeView(false));
    store.dispatch({
      type: consts.SET_CURRENT_TOOL_TITLE,
      currentToolTitle: toolTitle
    });
    const local = true;
    const userData = {
      username: username
    };
    store.dispatch(LoginActions.loginUser(userData, local));
  }

  function validateButtons(enzymeWrapper, expectedButtonLabels) {
    const buttons = enzymeWrapper.find('StatusBar').find('button');
    expect(buttons.length).toEqual(expectedButtonLabels.length);
    for (let i = 0; i < buttons.length; i++) {
      const item = buttons.at(i);
      const buttonText = item.text();
      expect(buttonText).toEqual(expectedButtonLabels[i])
    }
  }
});

