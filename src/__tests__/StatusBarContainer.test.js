/* eslint-env jest */
import os from 'os';
import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import path from 'path-extra';
import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';
import StatusBarContainer, { getBaseName } from '../js/containers/StatusBarContainer';
import reducers from '../js/reducers';
import * as ProjectDetailsActions from '../js/actions/ProjectDetailsActions';
import * as BodyUIActions from '../js/actions/BodyUIActions';
import consts from '../js/actions/ActionTypes';
import * as LoginActions from '../js/actions/LoginActions';

const translate = key => key;

// TODO: this test should use a mock store

beforeAll(() => {
  configure({ adapter: new Adapter() });
});

// Tests for ProjectFAB React Component
describe('Test StatusBarContainer component',()=>{
  let store;

  beforeEach(() => {
    // create a new store instance for each test
    store = createStore(
      reducers,
      applyMiddleware(thunk),
    );
  });

  test('StatusBarContainer Component on current system should render button text correctly', () => {
    // given
    const projectName_ = 'en_tit_ulb';
    let projectFolder = '/user/dummy/tc/projects/';
    const projectPath = projectFolder + projectName_;
    const toolTitle = 'Miracle Tool';
    const username = 'Local User';
    setupStore(projectPath, toolTitle, username);
    // when
    const enzymeWrapper = (
      <Provider store={store}>
        <StatusBarContainer translate={translate}/>
      </Provider>
    );
    // then
    expect(enzymeWrapper).toMatchSnapshot();
  });

  test('StatusBarContainer Component on current system should match snapshot', () => {
    // given
    const osType = os.type().toLowerCase();
    const isWin = (osType.indexOf('win') === 0);
    const projectName_ = 'en_tit_ulb';
    let projectFolder = '/user/dummy/tc/projects/';

    if (isWin) { // if windows, switch to posix
      projectFolder = 'C:\\Users\\Dummy\\tC\\projects\\';
    }

    const projectPath = projectFolder + projectName_;
    const toolTitle = 'Miracle Tool';
    const username = 'Local User';
    setupStore(projectPath, toolTitle, username);

    // when
    const renderedValue = renderer.create(
      <Provider store={store}>
        <StatusBarContainer translate={translate}/>
      </Provider>,
    ).toJSON();

    // then
    expect(renderedValue).toMatchSnapshot();
  });

  test('StatusBarContainer.getBaseName on mac/linux should render baseName correctly', () => {
    // given
    const expectedProjectName = 'en_tit_ulb';
    const projectPath = '/user/dummy/tc/projects/' + expectedProjectName;
    const posixPath = path.posix;

    // when
    const projectName = getBaseName(projectPath, posixPath);

    // then
    expect(projectName).toEqual(expectedProjectName);
  });

  test('StatusBarContainer.getBaseName on windows should render baseName correctly', () => {
    // given
    const expectedProjectName = 'en_tit_ulb';
    const projectPath = 'C:\\Users\\Dummy\\tC\\projects\\' + expectedProjectName;
    const winPath = path.win32;

    // when
    const projectName = getBaseName(projectPath, winPath);

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
   * @param username
   * @return {string}
   */
  function setupStore(projectPath, toolTitle, username) {
    store.dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
    store.dispatch(BodyUIActions.toggleHomeView(false));
    // TODO: this will break. need to fix
    store.dispatch({
      type: consts.ADD_TOOL,
      name: 'default',
      tool: { title: toolTitle },
    });
    store.dispatch({
      type: consts.OPEN_TOOL,
      name: 'default',
    });

    const local = true;
    const userData = { username: username };
    store.dispatch(LoginActions.loginUser(userData, local));
  }
});

