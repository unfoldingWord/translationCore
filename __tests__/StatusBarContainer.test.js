/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer';
import StatusBarContainer from "../src/js/containers/StatusBarContainer";
import {Provider} from "react-redux";
import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import reducers from '../src/js/reducers';
import * as ProjectDetailsActions from "../src/js/actions/ProjectDetailsActions";
import * as BodyUIActions from "../src/js/actions/BodyUIActions";
import consts from '../src/js/actions/ActionTypes';
import * as LoginActions from "../src/js/actions/LoginActions";
import path from 'path-extra';
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

  test('StatusBarContainer Component on current system should render Project Name correctly', () => {
    // given
    const osType = os.type().toLowerCase();
    const isWin = (osType.indexOf('win') === 0);
    const projectName = "en_tit_ulb";
    let projectFolder = "/user/dummy/tc/projects/";
    if(isWin) { // if windows, switch to posix
      projectFolder = "C:\\Users\\Dummy\\tC\\projects\\";
    }
    const projectPath = projectFolder + projectName;
    const toolTitle = "Miracle Tool";
    const username = "Local User";
    setupStore(projectPath, toolTitle, username);
    const expectedButtonLabels = ['Home','User: ' + username,'Project: ' + projectName, `[Tool: ][${toolTitle}]`]; // expect buttons to have this text

    // when
    const renderedValue =  renderer.create(
      <Provider store={store}>
        <StatusBarContainer />
      </Provider>
    ).toJSON();

    // then
    const buttons = searchForChildren(renderedValue, 'button');
    const buttonsText = getDisplayedText(buttons);
    expect(buttonsText).toEqual(expectedButtonLabels);
  });

  test('StatusBarContainer Component on mac/linux should render Project Name correctly', () => {
    // given
    const projectName = "en_tit_ulb";
    const projectPath = "/user/dummy/tc/projects/" + projectName;
    const toolTitle = "Miracle Tool";
    const username = "Local User";
    setupStore(projectPath, toolTitle, username);
    const expectedButtonLabels = ['Home','User: ' + username,'Project: ' + projectName, `[Tool: ][${toolTitle}]`]; // expect buttons to have this text
    const mock_path = path.posix; // use non-win version of path functions

    // when
    const renderedValue =  renderer.create(
      <Provider store={store}>
        <StatusBarContainer usePath={mock_path} />
      </Provider>
    ).toJSON();

    // then
    const buttons = searchForChildren(renderedValue, 'button');
    const buttonsText = getDisplayedText(buttons);
    expect(buttonsText).toEqual(expectedButtonLabels);
  });

  test('StatusBarContainer Component on windows should render Project Name correctly', () => {
    // given
    const projectName = "en_tit_ulb";
    const projectPath = "C:\\Users\\Dummy\\tC\\projects\\" + projectName;
    const toolTitle = "Miracle Tool";
    const username = "Local User";
    setupStore(projectPath, toolTitle, username);
    const expectedButtonLabels = ['Home','User: ' + username,'Project: ' + projectName, `[Tool: ][${toolTitle}]`]; // expect buttons to have this text
    const mock_path = path.win32; // use win version of path functions

    // when
    const renderedValue =  renderer.create(
      <Provider store={store}>
        <StatusBarContainer usePath={mock_path} />
      </Provider>
    ).toJSON();

    // then
    const buttons = searchForChildren(renderedValue, 'button');
    const buttonsText = getDisplayedText(buttons);
    expect(buttonsText).toEqual(expectedButtonLabels);
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
  function searchForChildren(search, findType) {
    let found = [];
    if (search.children) {
      search.children.forEach((child) => {
        if (child.type === findType) {
          found.push(child.children);
        } else if(child.children) {
          const found_below = searchForChildren(child, findType);
          if(found_below.length) {
            found = found.concat(found_below);
          }
        }
      });
    }
    return found;
  }
});

