/* eslint-env jest */
import types from '../src/js/actions/ActionTypes';
import * as actions from '../src/js/actions/ProjectDetailsActions';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from "ospath";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

it('setSaveLocation() creates an action to update contributors', () => {
  const store = mockStore({});
  const expectedActions = [{
    type: types.SET_SAVE_PATH_LOCATION,
    pathLocation: 'some/path'
  }];
  store.dispatch(actions.setSaveLocation('some/path'));
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('resetProjectDetail() creates an action to reset the project details', () => {
  const expectedAction = {
    type: types.RESET_PROJECT_DETAIL
  };
  expect(actions.resetProjectDetail())
    .toEqual(expectedAction);
});

describe('getProjectProgressForTools() should create an action to get the project progress for tools', () => {
  // NOTE: we don't need to test the actual progress checking here.
  // progress checking can be tested on it's own.
  const initialState = {
    projectDetailsReducer: {
      projectSaveLocation: '../',
      manifest: {
        project: {
          id: ''
        }
      }
    }
  };
  fs.__setMockFS({
    [path.join(path.homedir(), 'translationCore/resources/grc/bibles/ugnt/v11/index.json')]: {}
  });

  it('should fail if no toolName is given', () => {
    const store = mockStore(initialState);
    return expect(store.dispatch(actions.getProjectProgressForTools())).rejects.toEqual('Expected "toolName" to be a string but received undefined instead');
  });

  it('should give progress for word alignment', () => {
    const store = mockStore(initialState);
    const expectedActions = [
      {"progress": 0, "toolName": "wordAlignment", "type": "SET_PROJECT_PROGRESS_FOR_TOOL"}
    ];
    store.dispatch(actions.getProjectProgressForTools('wordAlignment'));
    const receivedActions = store.getActions();
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should give progress for a tool', () => {
    const store = mockStore(initialState);
    const expectedActions = [
      {"progress": 0, "toolName": "myTool", "type": "SET_PROJECT_PROGRESS_FOR_TOOL"}
    ];
    store.dispatch(actions.getProjectProgressForTools('myTool'));
    const receivedActions = store.getActions();
    expect(receivedActions).toEqual(expectedActions);
  });
});

describe('setProjectToolGL() should create an action to get the project GL for tools', () => {
  const initialState = {
    projectDetailsReducer: {}
  };

  it('should fail if no toolName is given', () => {
    const store = mockStore(initialState);
    return expect(store.dispatch(actions.setProjectToolGL())).rejects.toEqual('Expected "toolName" to be a string but received undefined instead');
  });

  it('should set GL for word alignment', () => {
    const store = mockStore(initialState);
    const expectedActions = [
      {selectedGL:"hi", toolName:"wordAlignment", type:"SET_GL_FOR_TOOL"}
    ];
    store.dispatch(actions.setProjectToolGL('wordAlignment', 'hi'));
    const receivedActions = store.getActions();
    expect(receivedActions).toEqual(expectedActions);
  });
});

it('setProjectManifest() creates an action to set the project manifest', () => {
  const expectedAction = {
    type: types.STORE_MANIFEST,
    manifest: { hello: 'world' }
  };
  expect(actions.setProjectManifest({ hello: 'world' }))
    .toEqual(expectedAction);
});

it('addObjectPropertyToManifest() creates an action to add an object property to the manifest', () => {
  const expectedAction = {
    type: types.ADD_MANIFEST_PROPERTY,
    propertyName: 'key',
    value: { hello: 'world' }
  };
  expect(actions.addObjectPropertyToManifest('key', { hello: 'world' }))
    .toEqual(expectedAction);
});

it('setProjectBookIdAndBookName() creates an action to set the project book id and name', () => {
  const store = mockStore({
    projectInformationCheckReducer: {
      bookId: 'gen'
    }
  });
  const expectedActions = [{
    type: types.SAVE_BOOK_ID_AND_BOOK_NAME_IN_MANIFEST,
    bookId: 'gen',
    bookName: 'Genesis'
  }];
  store.dispatch(actions.setProjectBookIdAndBookName());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('setProjectResourceId() creates an action to set the resourceId', () => {
  const store = mockStore({
    projectInformationCheckReducer: {
      resourceId: 'ult',
    }
  });
  const expectedActions = [{
    type: types.SAVE_RESOURCE_ID_IN_MANIFEST,
    resourceId: 'ult'
  }];
  store.dispatch(actions.setProjectResourceId());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('setProjectNickname() creates an action to set the nickname', () => {
  const store = mockStore({
    projectInformationCheckReducer: {
      nickname: 'Unlocked literal translation',
    }
  });
  const expectedActions = [{
    type: types.SAVE_NICKNAME_IN_MANIFEST,
    nickname: 'Unlocked literal translation'
  }];
  store.dispatch(actions.setProjectNickname());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('setLanguageDetails() creates an action to set the language details',  () => {
  const store = mockStore({
    projectInformationCheckReducer: {
      languageDirection: 'rtl',
      languageId: 'en',
      languageName: 'English'
    }
  });
  const expectedActions = [{
    type: types.SAVE_LANGUAGE_DETAILS_IN_MANIFEST,
    languageDirection: 'rtl',
    languageId: 'en',
    languageName: 'English'
  }];
  store.dispatch(actions.setLanguageDetails());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('updateContributors() creates an action to update contributors', () => {
  const store = mockStore({
    projectInformationCheckReducer: {
      contributors: ['jon', 'steve']
    }
  });
  const expectedActions = [{
    type: types.SAVE_TRANSLATORS_LIST_IN_MANIFEST,
    translators: ['jon', 'steve']
  }];
  store.dispatch(actions.updateContributors());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('updateCheckers() creates an action to update checkers', () => {
  const store = mockStore({
    projectInformationCheckReducer: {
      checkers: ['jon', 'steve']
    }
  });
  const expectedActions = [{
    type: types.SAVE_CHECKERS_LIST_IN_MANIFEST,
    checkers: ['jon', 'steve']
  }];
  store.dispatch(actions.updateCheckers());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

describe('ProjectDetailsActions.updateProjectNameIfNecessary()', () => {
  const currentProjectName = "fr_ult_eph_book";
  const currentProjectPath = path.join(PROJECTS_PATH, currentProjectName);
  const mockStoreData = {
    projectDetailsReducer: {
      manifest: {
        target_language: {
          id: 'fr',
          name: 'francais',
          direction: 'ltr'
        },
        project: {
          id: 'eph',
          name: 'Ephesians'
        },
        resource: {
          id: 'ult',
          name: 'unfoldingWord Literal Text'
        }
      },
      projectSaveLocation: currentProjectPath
    },
    localImportReducer: {
      selectedProjectFilename: 'SELECTED_PROJECT_NAME'
    }
  };

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    fs.__setMockFS({
      [currentProjectPath]: ''
    });
  });

  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  test('does nothing if project name is valid', async () => {
    // given
    const store = mockStore(mockStoreData);

    // when
    await store.dispatch(actions.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).toBeTruthy();
  });

  test('does nothing if projectSaveLocation is not set', async () => {
    // given
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    delete storeData.projectDetailsReducer.projectSaveLocation;
    const store = mockStore(storeData);

    // when
    await store.dispatch(actions.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).toBeTruthy();
  });

  test('renames project if lang_id changed', async () => {
    // given
    const newProjectName = "am_ult_eph_book";
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.manifest.target_language.id = 'am';
    const store = mockStore(storeData);

    // when
    await store.dispatch(actions.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).not.toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });

  test('renames project if project id changed', async () => {
    // given
    const newProjectName = "fr_ult_tit_book";
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.manifest.project.id = 'tit';
    const store = mockStore(storeData);

    // when
    await store.dispatch(actions.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).not.toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });

  test('renames project if resource.id (resourceId) changed', async () => {
    // given
    const newProjectName = "fr_lib_eph_book";
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.manifest.resource.id = 'lib';
    const store = mockStore(storeData);

    // when
    await store.dispatch(actions.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).not.toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });

  test('renames project if new project name is different than spec', async () => {
    // given
    const currentProjectPath = path.join(PROJECTS_PATH, "fr_ULT_eph_book");
    const newProjectName = "fr_ult_eph_book";
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    fs.moveSync(expectedProjectPath, currentProjectPath); // move to invalid file
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.projectSaveLocation = currentProjectPath;
    const store = mockStore(storeData);

    // when
    await store.dispatch(actions.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).not.toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });

  test('does not rename project if new project name is different than spec and we have duplicate', async () => {
    // given
    const currentProjectPath = path.join(PROJECTS_PATH, "fr_ULT_eph_book");
    const newProjectName = "fr_ult_eph_book";
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    fs.moveSync(expectedProjectPath, currentProjectPath); // move to invalid file
    fs.copySync(currentProjectPath, expectedProjectPath); // make duplicate
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.projectSaveLocation = currentProjectPath;
    const store = mockStore(storeData);

    // when
    await store.dispatch(actions.updateProjectNameIfNecessary());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });
});

//
// helpers
//

/**
 * remove user specific paths and just get basename
 * @param {Array} actions
 * @return {*}
 */
function cleanupPaths(actions) {
  if (actions && actions.length) {
    for (let action of actions) {
      if ('pathLocation' in action) {
        action.pathLocation = path.basename(action.pathLocation);
      }
    }
  }
  return actions;
}
