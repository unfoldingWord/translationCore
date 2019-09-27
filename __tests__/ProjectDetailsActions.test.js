/* eslint-disable import/named */
/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path-extra';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
// actions
import types from '../src/js/actions/ActionTypes';
import * as actions from '../src/js/actions/ProjectDetailsActions';
// helpers
import { mockGetSelectedCategories } from '../src/js/helpers/ProjectAPI';
import * as ResourcesHelpers from '../src/js/helpers/ResourcesHelpers';
// constants
import {
  PROJECTS_PATH,
  USER_RESOURCES_PATH,
  WORD_ALIGNMENT,
  TRANSLATION_WORDS,
  TRANSLATION_HELPS, TRANSLATION_NOTES,
} from '../src/js/common/constants';
jest.mock('fs-extra');
jest.mock('../src/js/helpers/ProjectAPI');
jest.mock('../');
jest.mock('../src/js/helpers/ResourcesHelpers', () => ({
  ...require.requireActual('../src/js/helpers/ResourcesHelpers'),
  getAvailableCategories: jest.fn(() => ({ 'names': ['John'] })),
  updateGroupIndexForGl: jest.fn(() => jest.fn(() => 'mock')),
}));
jest.mock('../src/js/selectors', () => ({
  ...require.requireActual('../src/js/selectors'),
  getToolsByKey: jest.fn(() => ({
    'wordAlignment': { api: { trigger: (funcName) => funcName === 'getProgress' ? 0 : null } },
    'translationWords': { api: { trigger: (funcName) => funcName === 'getProgress' ? 0.25 : null } },
  })),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

it('setSaveLocation() creates an action to update contributors', () => {
  const store = mockStore({});
  const expectedActions = [{
    type: types.SET_SAVE_PATH_LOCATION,
    pathLocation: 'some/path',
  }];
  store.dispatch(actions.setSaveLocation('some/path'));
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('resetProjectDetail() creates an action to reset the project details', () => {
  const expectedAction = { type: types.RESET_PROJECT_DETAIL };

  expect(actions.resetProjectDetail())
    .toEqual(expectedAction);
});

describe('getProjectProgressForTools() should create an action to get the project progress for tools', () => {
  // NOTE: we don't need to test the actual progress checking here.
  // progress checking can be tested on it's own.
  const initialState = {
    projectDetailsReducer: {
      projectSaveLocation: '../',
      manifest: { project: { id: '' } },
      toolsCategories: {},
    },
    settingsReducer: { currentSettings: {} },
    resourcesReducer: { bibles: {} },
  };

  fs.__setMockFS({ [path.join(path.homedir(), 'translationCore/resources/el-x-koine/bibles/ugnt/v11/index.json')]: {} });

  it('should fail if no toolName is given', () => {
    const store = mockStore(initialState);
    return expect(store.dispatch(actions.getProjectProgressForTools())).rejects.toEqual('Expected "toolName" to be a string but received undefined instead');
  });

  it('should give progress for word alignment', () => {
    const store = mockStore(initialState);
    const expectedActions = [
      {
        'progress': 0, 'toolName': WORD_ALIGNMENT, 'type': 'SET_PROJECT_PROGRESS_FOR_TOOL',
      },
    ];
    store.dispatch(actions.getProjectProgressForTools(WORD_ALIGNMENT));
    const receivedActions = store.getActions();
    expect(receivedActions).toEqual(expectedActions);
  });

  it('should give progress for a tool', () => {
    const store = mockStore(initialState);
    const expectedActions = [
      {
        'progress': 0, 'toolName': 'myTool', 'type': 'SET_PROJECT_PROGRESS_FOR_TOOL',
      },
    ];
    store.dispatch(actions.getProjectProgressForTools('myTool'));
    const receivedActions = store.getActions();
    expect(receivedActions).toEqual(expectedActions);
  });
});

describe('setProjectToolGL() should create an action to get the project GL for tools', () => {
  const initialState = {
    projectDetailsReducer: {},
    resourcesReducer: { bibles: {} },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fail if no toolName is given', () => {
    const store = mockStore(initialState);
    expect(store.dispatch(actions.setProjectToolGL())).rejects.toEqual('Expected "toolName" to be a string but received undefined instead');
    expect(ResourcesHelpers.updateGroupIndexForGl).not.toHaveBeenCalled();
  });

  it('should set GL for word alignment', () => {
    const store = mockStore(initialState);
    const expectedActions = [
      {
        selectedGL: 'hi', toolName: WORD_ALIGNMENT, type: 'SET_GL_FOR_TOOL',
      },
    ];
    store.dispatch(actions.setProjectToolGL(WORD_ALIGNMENT, 'hi'));
    const receivedActions = store.getActions();
    expect(receivedActions).toEqual(expectedActions);
    expect(ResourcesHelpers.updateGroupIndexForGl).not.toHaveBeenCalled();
  });

  it('should set GL for translationNotes', () => {
    const initialState = {
      projectDetailsReducer: {},
      resourcesReducer: { bibles: {} },
    };
    const store = mockStore(initialState);
    const expectedActions = [{
      'selectedGL': 'hi', 'toolName': 'translationNotes', 'type': 'SET_GL_FOR_TOOL',
    }, {
      'meta': { 'batch': true },
      'payload': [{ 'type': 'CLEAR_PREVIOUS_GROUPS_DATA' },
        { 'type': 'CLEAR_PREVIOUS_GROUPS_INDEX' },
        { 'type': 'CLEAR_CONTEXT_ID' }],
      'type': 'BATCHING_REDUCER.BATCH',
    }];
    store.dispatch(actions.setProjectToolGL(TRANSLATION_NOTES, 'hi'));
    const receivedActions = store.getActions();
    expect(receivedActions).toEqual(expectedActions);
    expect(ResourcesHelpers.updateGroupIndexForGl).toHaveBeenCalled();
  });
});

it('setProjectManifest() creates an action to set the project manifest', () => {
  const expectedAction = {
    type: types.STORE_MANIFEST,
    manifest: { hello: 'world' },
  };

  expect(actions.setProjectManifest({ hello: 'world' }))
    .toEqual(expectedAction);
});

it('addObjectPropertyToManifest() creates an action to add an object property to the manifest', () => {
  const expectedAction = {
    type: types.ADD_MANIFEST_PROPERTY,
    propertyName: 'key',
    value: { hello: 'world' },
  };

  expect(actions.addObjectPropertyToManifest('key', { hello: 'world' }))
    .toEqual(expectedAction);
});

it('setProjectSettings() creates an action to set a project setting', () => {
  const settings = { last_opened: new Date() };
  const expectedAction = {
    type: types.STORE_PROJECT_SETTINGS,
    settings: settings,
  };
  expect(actions.setProjectSettings(settings)).toEqual(expectedAction);
});

it('addObjectPropertyToSettings() creates an action to add an object property to the settings', () => {
  const value = { last_opened: new Date() };
  const expectedAction = {
    type: types.ADD_PROJECT_SETTINGS_PROPERTY,
    propertyName: 'key',
    value: value,
  };
  expect(actions.addObjectPropertyToSettings('key', value)).toEqual(expectedAction);
});

it('setProjectBookIdAndBookName() creates an action to set the project book id and name', () => {
  const store = mockStore({ projectInformationCheckReducer: { bookId: 'gen' } });
  const expectedActions = [{
    type: types.SAVE_BOOK_ID_AND_BOOK_NAME_IN_MANIFEST,
    bookId: 'gen',
    bookName: 'Genesis',
  }];

  store.dispatch(actions.setProjectBookIdAndBookName()).then(() => {
    const receivedActions = store.getActions();
    expect(receivedActions).toEqual(expectedActions);
  });
});

it('setProjectResourceId() creates an action to set the resourceId', () => {
  const store = mockStore({ projectInformationCheckReducer: { resourceId: 'ult' } });
  const expectedActions = [{
    type: types.SAVE_RESOURCE_ID_IN_MANIFEST,
    resourceId: 'ult',
  }];
  store.dispatch(actions.setProjectResourceId());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('setProjectNickname() creates an action to set the nickname', () => {
  const store = mockStore({ projectInformationCheckReducer: { nickname: 'Unlocked literal translation' } });
  const expectedActions = [{
    type: types.SAVE_NICKNAME_IN_MANIFEST,
    nickname: 'Unlocked literal translation',
  }];
  store.dispatch(actions.setProjectNickname());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('setLanguageDetails() creates an action to set the language details', () => {
  const store = mockStore({
    projectInformationCheckReducer: {
      languageDirection: 'rtl',
      languageId: 'en',
      languageName: 'English',
    },
    resourcesReducer: { bibles: {} },
  });
  const expectedActions = [{
    type: types.SAVE_LANGUAGE_DETAILS_IN_MANIFEST,
    languageDirection: 'rtl',
    languageId: 'en',
    languageName: 'English',
  }];
  store.dispatch(actions.setLanguageDetails());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('updateContributors() creates an action to update contributors', () => {
  const store = mockStore({ projectInformationCheckReducer: { contributors: ['jon', 'steve'] } });
  const expectedActions = [{
    type: types.SAVE_TRANSLATORS_LIST_IN_MANIFEST,
    translators: ['jon', 'steve'],
  }];
  store.dispatch(actions.updateContributors());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

it('updateCheckers() creates an action to update checkers', () => {
  const store = mockStore({ projectInformationCheckReducer: { checkers: ['jon', 'steve'] } });
  const expectedActions = [{
    type: types.SAVE_CHECKERS_LIST_IN_MANIFEST,
    checkers: ['jon', 'steve'],
  }];
  store.dispatch(actions.updateCheckers());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
});

describe('ProjectDetailsActions.updateProjectNameIfNecessaryAndDoPrompting()', () => {
  const currentProjectName = 'fr_ult_eph_book';
  const currentProjectPath = path.join(PROJECTS_PATH, currentProjectName);
  const mockStoreData = {
    projectDetailsReducer: {
      manifest: {
        target_language: {
          id: 'fr',
          name: 'francais',
          direction: 'ltr',
        },
        project: {
          id: 'eph',
          name: 'Ephesians',
        },
        resource: {
          id: 'ult',
          name: 'unfoldingWord Literal Text',
        },
      },
      projectSaveLocation: currentProjectPath,
    },
    localImportReducer: { selectedProjectFilename: 'SELECTED_PROJECT_NAME' },
    resourcesReducer: { bibles: {} },
  };

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    fs.__setMockFS({ [currentProjectPath]: '' });
  });

  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  test('does nothing if project name is valid', async () => {
    // given
    const store = mockStore(mockStoreData);

    // when
    await store.dispatch(actions.updateProjectNameIfNecessaryAndDoPrompting());

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
    await store.dispatch(actions.updateProjectNameIfNecessaryAndDoPrompting());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).toBeTruthy();
  });

  test('renames project if lang_id changed', async () => {
    // given
    const newProjectName = 'am_ult_eph_book';
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.manifest.target_language.id = 'am';
    const store = mockStore(storeData);

    // when
    const results = {};
    await store.dispatch(actions.updateProjectNameIfNecessary(results));

    // then
    expect(results.repoRenamed).toBe(true);
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).not.toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });

  test('renames project if project id changed', async () => {
    // given
    const newProjectName = 'fr_ult_tit_book';
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.manifest.project.id = 'tit';
    const store = mockStore(storeData);

    // when
    const results = {};
    await store.dispatch(actions.updateProjectNameIfNecessary(results));

    // then
    expect(results.repoRenamed).toBe(true);
    cleanupPaths(store.getActions());
    expect(fs.pathExistsSync(currentProjectPath)).not.toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });

  test('renames project if resource.id (resourceId) changed', async () => {
    // given
    const newProjectName = 'fr_lib_eph_book';
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.manifest.resource.id = 'lib';
    const store = mockStore(storeData);

    // when
    const results = {};
    await store.dispatch(actions.updateProjectNameIfNecessary(results));

    // then
    expect(results.repoRenamed).toBe(true);
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).not.toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });

  test('renames project if new project name is different than spec', async () => {
    // given
    const currentProjectPath = path.join(PROJECTS_PATH, 'fr_ULT_eph_book');
    const newProjectName = 'fr_ult_eph_book';
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    fs.moveSync(expectedProjectPath, currentProjectPath); // move to invalid file
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.projectSaveLocation = currentProjectPath;
    const store = mockStore(storeData);

    // when
    const results = {};
    await store.dispatch(actions.updateProjectNameIfNecessary(results));

    // then
    expect(results.repoRenamed).toBe(true);
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).not.toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });

  test('does not rename project if new project name is different than spec and we have duplicate', async () => {
    // given
    const currentProjectPath = path.join(PROJECTS_PATH, 'fr_ULT_eph_book');
    const newProjectName = 'fr_ult_eph_book';
    const expectedProjectPath = path.join(PROJECTS_PATH, newProjectName);
    fs.moveSync(expectedProjectPath, currentProjectPath); // move to invalid file
    fs.copySync(currentProjectPath, expectedProjectPath); // make duplicate
    const storeData = JSON.parse(JSON.stringify(mockStoreData));
    storeData.projectDetailsReducer.projectSaveLocation = currentProjectPath;
    const store = mockStore(storeData);

    // when
    await store.dispatch(actions.updateProjectNameIfNecessaryAndDoPrompting());

    // then
    expect(cleanupPaths(store.getActions())).toMatchSnapshot();
    expect(fs.pathExistsSync(currentProjectPath)).toBeTruthy();
    expect(fs.pathExistsSync(expectedProjectPath)).toBeTruthy();
  });
});

describe('ProjectDetailsActions.updateCategorySelection', () => {
  const project_name = 'normal_project';

  beforeAll(() => {
    // Make resource
    fs.__resetMockFS();
    const projectSourcePath = path.join('__tests__', 'fixtures', 'project', TRANSLATION_WORDS);
    const copyFiles = [project_name];
    fs.__loadFilesIntoMockFs(copyFiles, projectSourcePath, PROJECTS_PATH);
    const sourceResourcesPath = path.join('__tests__', 'fixtures', 'resources');
    const resourcesPath = USER_RESOURCES_PATH;
    const copyResourceFiles = ['el-x-koine'];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
  });

  afterAll(() => {
    fs.__resetMockFS();
  });
  test('should set the check category from the user selection', () => {
    const mockApi = jest.fn(() => ({ api: { trigger: () => jest.fn().mockImplementationOnce(() => 0.25) } }));
    const initialState = {
      projectDetailsReducer: {
        projectSaveLocation: path.join(PROJECTS_PATH, project_name),
        manifest: { project: { id: 'tit' } },
        toolsCategories: { translationWords: ['apostle', 'authority', 'clean'] },
      },
      toolsReducer: { tools: { byObject: { [TRANSLATION_WORDS]: { name: TRANSLATION_WORDS, api: mockApi } } } },
    };
    const expectedActions = [{
      type: 'SET_CHECK_CATEGORIES',
      toolName: TRANSLATION_WORDS,
      selectedSubcategories: ['apostle', 'authority', 'clean'],
    },
    {
      type: 'SET_PROJECT_PROGRESS_FOR_TOOL',
      toolName: TRANSLATION_WORDS,
      progress: 0.25,
    }];
    const store = mockStore(initialState);
    console.log('store', store.getState());
    store.dispatch(actions.updateCategorySelection(TRANSLATION_WORDS, true, ['apostle', 'authority', 'clean']));
    expect(store.getActions()).toMatchObject(expectedActions);
  });

  describe('ProjectDetailsActions.loadCurrentCheckCategories', () => {
    const project_name = 'normal_project';
    const toolName = TRANSLATION_WORDS;
    const projectSaveLocation = path.join(PROJECTS_PATH, project_name);
    const sourceResourcesPath = path.join('__tests__', 'fixtures', 'resources');

    beforeAll(() => {
      // Make resource
      fs.__resetMockFS();
      const projectSourcePath = path.join('__tests__', 'fixtures', 'project', TRANSLATION_WORDS);
      const copyFiles = [project_name];
      fs.__loadFilesIntoMockFs(copyFiles, projectSourcePath, PROJECTS_PATH);
      const resourcesPath = USER_RESOURCES_PATH;
      const copyResourceFiles = ['el-x-koine', 'en'];
      fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
    });

    afterAll(() => {
      fs.__resetMockFS();
    });
    test('should load all the check categories from the project', () => {
      const expectedActions = [{
        'selectedSubcategories': ['John'], 'toolName': TRANSLATION_WORDS, 'type': 'SET_CHECK_CATEGORIES',
      }];
      const initialState = {
        projectDetailsReducer: {
          projectSaveLocation: path.join(PROJECTS_PATH, project_name),
          manifest: {
            project: { id: 'tit' },
            toolsSelectedGLs: { translationWords: 'en' },
          },
        },
      };
      mockGetSelectedCategories.mockReturnValueOnce(['John']);
      const store = mockStore(initialState);
      store.dispatch(actions.loadCurrentCheckCategories(toolName, projectSaveLocation, 'en'));
      expect(store.getActions()).toMatchObject(expectedActions);
    });
    test('should not load check categories that are not present in the resources', () => {
      const namesResourcePath = path.join(USER_RESOURCES_PATH, 'en', TRANSLATION_HELPS, TRANSLATION_WORDS);
      fs.removeSync(namesResourcePath);
      const expectedActions = [{
        'selectedSubcategories': [], 'toolName': TRANSLATION_WORDS, 'type': 'SET_CHECK_CATEGORIES',
      }];
      const initialState = {
        projectDetailsReducer: {
          projectSaveLocation: path.join(PROJECTS_PATH, project_name),
          manifest: {
            project: { id: 'tit' },
            toolsSelectedGLs: { translationWords: 'en' },
          },
        },
      };
      mockGetSelectedCategories.mockReturnValueOnce(['names']);
      const store = mockStore(initialState);
      store.dispatch(actions.loadCurrentCheckCategories(toolName, projectSaveLocation, 'en'));
      expect(store.getActions()).toMatchObject(expectedActions);
    });
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
