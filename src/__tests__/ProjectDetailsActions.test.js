/* eslint-disable default-case,object-curly-newline */
/* eslint-disable import/named */
/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path-extra';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
// actions
import types from '../js/actions/ActionTypes';
import * as actions from '../js/actions/ProjectDetailsActions';
import * as ToolActions from '../js/actions/ToolActions';
// helpers
import { mockGetSelectedCategories } from '../js/helpers/ProjectAPI';
import * as ResourcesHelpers from '../js/helpers/ResourcesHelpers';
// constants
import {
  PROJECTS_PATH,
  USER_RESOURCES_PATH,
  WORD_ALIGNMENT,
  TRANSLATION_WORDS,
  TRANSLATION_HELPS,
  TRANSLATION_NOTES,
  DOOR43_CATALOG,
} from '../js/common/constants';
import { NT_ORIG_LANG, NT_ORIG_LANG_BIBLE } from '../js/common/BooksOfTheBible';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('fs-extra');
jest.mock('../js/helpers/ProjectAPI');
jest.mock('../');
jest.mock('../js/helpers/ResourcesHelpers', () => ({
  ...require.requireActual('../js/helpers/ResourcesHelpers'),
  getAvailableCategories: jest.fn(() => ({ 'names': ['John'] })),
  updateGroupIndexForGl: jest.fn(() => jest.fn(() => 'mock')),
}));
jest.mock('../js/actions/ToolActions', () => ({
  ...require.requireActual('../js/actions/ToolActions'),
  prepareToolForLoading: jest.fn(() => () => {
  }),
}));
jest.mock('../js/actions/ProjectUploadActions', () => ({
  ...require.requireActual('../js/actions/ProjectUploadActions'),
  prepareProjectRepo: jest.fn(() => async () => {
  }),
  pushProjectRepo: jest.fn(() => async () => {
  }),
}));
jest.mock('../js/actions/MyProjects/ProjectLoadingActions', () => ({
  ...require.requireActual('../js/actions/MyProjects/ProjectLoadingActions'),
  connectToolApi: jest.fn(() => () => {
  }),
}));
jest.mock('../js/selectors', () => ({
  ...require.requireActual('../js/selectors'),
  getToolGlOwner: jest.fn(() => DOOR43_CATALOG),
  getToolsByKey: jest.fn(() => ({
    'translationNotes': { api: { trigger: (funcName) => funcName === 'getProgress' ? 0 : null } },
    'wordAlignment': { api: { trigger: (funcName) => funcName === 'getProgress' ? 0 : null } },
    'translationWords': { api: { trigger: (funcName) => funcName === 'getProgress' ? 0.25 : null } },
  })),
}));

let mock_repoExists = false;
let mock_repoError = false;
let mock_renameRepoCallCount = 0;
let mock_createNewRepoCallCount = 0;

jest.mock('../js/helpers/GogsApiHelpers', () => ({
  ...require.requireActual('../js/helpers/GogsApiHelpers'),
  changeGitToPointToNewRepo: () => new Promise((resolve) => {
    resolve();
  }),
  findRepo: () => new Promise((resolve, reject) => {
    if (mock_repoError) {
      reject('error');
    } else {
      resolve(mock_repoExists);
    }
  }),
  renameRepo: () => new Promise((resolve) => {
    mock_renameRepoCallCount++;
    resolve();
  }),
  createNewRepo: () => new Promise((resolve) => {
    mock_createNewRepoCallCount++;
    resolve();
  }),
}));

let mock_doOnlineConfirmCallback = false;

jest.mock('../js/actions/OnlineModeConfirmActions', () => ({
  confirmOnlineAction: jest.fn((onConfirm, onCancel) => (dispatch) => {
    dispatch({ type: 'CONFIRM_ONLINE_MODE' });

    if (mock_doOnlineConfirmCallback) {
      onConfirm();
    } else {
      onCancel();
    }
  }),
}));

jest.mock('../js/actions/ResourcesActions', () => ({
  ...require.requireActual('../js/actions/ResourcesActions'),
  loadBiblesByLanguageId: jest.fn(() => () => {
  }),
  loadBookResource: jest.fn(() => () => {
  }),
}));

jest.mock('../js/actions/ProjectInformationCheckActions', () => ({

  // eslint-disable-next-line no-unused-vars
  openOnlyProjectDetailsScreen: (projectSaveLocation, initiallyEnableSaveIfValid, callback) => async (dispatch) => {
    dispatch({ type: 'ProjectInformationCheckActions.openOnlyProjectDetailsScreen' });

    if (callback) {
      await callback();
    }
    return true;
  },
}));

let mock_alertCallbackButton = 0;
let mock_alertCallbackButtonText = null;

jest.mock('../js/actions/AlertModalActions', () => ({
  ...require.requireActual('../js/actions/AlertModalActions'),
  openOptionDialog: jest.fn((message, callback, button1, button2, buttonLinkText) =>
    (dispatch) => {
      //choose to export
      dispatch({
        type: 'OPEN_OPTION_DIALOG',
        alertText: message,
        button1: button1,
        button2: button2,
        buttonLink: buttonLinkText,
        callback: callback,
      });
      mock_alertCallbackButtonText = null;

      switch (mock_alertCallbackButton) {
      case 1:
        mock_alertCallbackButtonText = button1;
        break;
      case 2:
        mock_alertCallbackButtonText = button2;
        break;
      case 3:
        mock_alertCallbackButtonText = buttonLinkText;
        break;
      }
      callback(mock_alertCallbackButtonText);
    }),
}));

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
    projectDetailsReducer: {
      manifest: {
        toolsSelectedGLs: { wordAlignment: 'hi' },
      },
    },
    resourcesReducer: { bibles: { } },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fail if no toolName is given', () => {
    const store = mockStore(initialState);
    expect(store.dispatch(actions.setProjectToolGL())).rejects.toEqual('Expected "toolName" to be a string but received undefined instead');
    expect(ResourcesHelpers.updateGroupIndexForGl).not.toHaveBeenCalled();
  });

  it('should set GL for word alignment', async () => {
    const store = mockStore(initialState);
    const expectedActions = [
      {
        selectedGL: 'hi',
        toolName: WORD_ALIGNMENT,
        type: 'SET_GL_FOR_TOOL',
        selectedOwner: 'Door43-Catalog',
      },
    ];
    await store.dispatch(actions.setProjectToolGL(WORD_ALIGNMENT, 'hi'));
    const receivedActions = store.getActions();
    expect(receivedActions).toEqual(expectedActions);
    expect(ResourcesHelpers.updateGroupIndexForGl).not.toHaveBeenCalled();
  });

  it('should set GL for translationNotes', async () => {
    const initialState = {
      projectDetailsReducer: { manifest: { toolsSelectedGLs: { translationNotes: 'en' } } },
      resourcesReducer: {
        bibles: {
          originalLanguage: {
            ugnt: {
              manifest: {
                language_id: NT_ORIG_LANG,
                resource_id: NT_ORIG_LANG_BIBLE,
                dublin_core: { version: 0.8 },
              },
            },
          },
        },
      },
      manifest: { hello: 'world' },
    };
    const store = mockStore(initialState);
    const expectedActions = [
      {
        'selectedGL': 'hi',
        'toolName': 'translationNotes',
        'type': 'SET_GL_FOR_TOOL',
        'selectedOwner': 'Door43-Catalog',
      },
      {
        'meta': {
          'batch': true,
        },
        'payload': [
          {
            'name': null,
            'type': 'OPEN_TOOL',
          },
        ],
        'type': 'BATCHING_REDUCER.BATCH',
      },
    ];
    await store.dispatch(actions.setProjectToolGL(TRANSLATION_NOTES, 'hi'));
    const receivedActions = store.getActions();
    expect(receivedActions).toEqual(expectedActions);
    expect(ResourcesHelpers.updateGroupIndexForGl).toHaveBeenCalled();
    expect(ToolActions.prepareToolForLoading).toHaveBeenCalled();
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

it('setProjectBookIdAndBookName() creates an action to set the project book id and name', async () => {
  const store = mockStore({
    projectInformationCheckReducer: { bookId: 'gen' },
    projectDetailsReducer: { manifest: { project: { id: 'gen' } } },
    loginReducer: { userdata: {} },
  });
  const expectedActions = [{
    type: types.SAVE_BOOK_ID_AND_BOOK_NAME_IN_MANIFEST,
    bookId: 'gen',
    bookName: 'Genesis',
  }];

  await store.dispatch(actions.setProjectBookIdAndBookName());
  const receivedActions = store.getActions();
  expect(receivedActions).toEqual(expectedActions);
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
    const projectSourcePath = path.join('src', '__tests__', 'fixtures', 'project', TRANSLATION_WORDS);
    const copyFiles = [project_name];
    fs.__loadFilesIntoMockFs(copyFiles, projectSourcePath, PROJECTS_PATH);
    const sourceResourcesPath = path.join('src', '__tests__', 'fixtures', 'resources');
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
    store.dispatch(actions.updateCategorySelection(TRANSLATION_WORDS, true, ['apostle', 'authority', 'clean']));
    expect(store.getActions()).toMatchObject(expectedActions);
  });

  describe('ProjectDetailsActions.loadCurrentCheckCategories', () => {
    const project_name = 'normal_project';
    const toolName = TRANSLATION_WORDS;
    const projectSaveLocation = path.join(PROJECTS_PATH, project_name);
    const sourceResourcesPath = path.join('src', '__tests__', 'fixtures', 'resources');

    beforeAll(() => {
      // Make resource
      fs.__resetMockFS();
      const projectSourcePath = path.join('src', '__tests__', 'fixtures', 'project', TRANSLATION_WORDS);
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

describe('showDcsRenameFailure', () => {
  const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');

  beforeEach(() => {
    mock_alertCallbackButton = 0;
    mock_alertCallbackButtonText = '';
    mock_doOnlineConfirmCallback = false;
  });

  test('on click retry, should call retry', async () => {
    const store = mockStore({ settingsReducer: {} });
    const createNew = false;
    mock_alertCallbackButton = 1;
    const expectedClickButton = 'buttons.retry';

    const results = await store.dispatch(actions.showDcsRenameFailure(projectPath, createNew));
    expect(results).toEqual('RETRY');
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_alertCallbackButtonText).toEqual(expectedClickButton);
  });

  test('on click retry, should call continue', async () => {
    const store = mockStore({ settingsReducer: {} });
    const createNew = false;
    mock_alertCallbackButton = 2;
    const expectedClickButton = 'buttons.continue_button';

    const results = await store.dispatch(actions.showDcsRenameFailure(projectPath, createNew));
    expect(results).toEqual('CONTINUE');
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_alertCallbackButtonText).toEqual(expectedClickButton);
  });

  test('on click help desk, should call contactHelpDesk and then show prompt again', async () => {
    const store = mockStore({ settingsReducer: {} });
    const createNew = false;
    mock_alertCallbackButton = 3;
    const mock_showErrorFeedbackDialog = jest.fn((translateKey, doneCB) => (async () => { // eslint-disable-line require-await
      mock_alertCallbackButton = 0; // prevent reshow contact helpdesk

      if (doneCB) {
        doneCB();
      }
    }));

    await store.dispatch(actions.showDcsRenameFailure(projectPath, createNew, mock_showErrorFeedbackDialog));
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_showErrorFeedbackDialog).toHaveBeenCalledTimes(1);
  });
});

describe('doDcsRenamePrompting', () => {
  const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');

  beforeEach(() => {
    mock_alertCallbackButton = 0;
    mock_alertCallbackButtonText = '';
    mock_doOnlineConfirmCallback = false;
  });

  test('on click rename, should call rename', async () => {
    const store = mockStore({
      projectDetailsReducer: { projectSaveLocation: projectPath },
      loginReducer: {
        loggedInUser: false,
        userdata: { username: 'dummy-test' },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!',
      },
    });
    mock_alertCallbackButton = 1;
    const expectedClickButton = 'buttons.rename_repo';

    await store.dispatch(actions.doDcsRenamePrompting());
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_alertCallbackButtonText).toEqual(expectedClickButton);
  });

  test('on click create, should call create new', async () => {
    const store = mockStore({
      projectDetailsReducer: { projectSaveLocation: projectPath },
      loginReducer: {
        loggedInUser: false,
        userdata: { username: 'dummy-test' },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!',
      },
    });
    mock_alertCallbackButton = 2;
    const expectedClickButton = 'buttons.create_new_repo';

    await store.dispatch(actions.doDcsRenamePrompting());
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_alertCallbackButtonText).toEqual(expectedClickButton);
  });
});

describe('handleDcsOperation', () => {
  const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');

  beforeEach(() => {
    mock_alertCallbackButton = 0;
    mock_alertCallbackButtonText = '';
    mock_repoExists = false;
    mock_doOnlineConfirmCallback = true;
    mock_renameRepoCallCount = 0;
    mock_createNewRepoCallCount = 0;
  });

  test('should handle repo exists', async () => {
    const store = mockStore({
      projectDetailsReducer: { projectSaveLocation: projectPath },
      loginReducer: {
        loggedInUser: false,
        userdata: { username: 'dummy-test' },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!',
      },
      settingsReducer: { onlineMode: true },
    });
    const createNew = false;
    mock_repoExists = true;

    await store.dispatch(actions.handleDcsOperation(createNew, projectPath));
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_renameRepoCallCount).toEqual(0);
    expect(mock_createNewRepoCallCount).toEqual(0);
  });

  test('on repo does not exist, should call create new', async () => {
    const store = mockStore({
      projectDetailsReducer: { projectSaveLocation: projectPath },
      loginReducer: {
        loggedInUser: false,
        userdata: { username: 'dummy-test' },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!',
      },
      settingsReducer: { onlineMode: true },
    });
    const createNew = true;

    await store.dispatch(actions.handleDcsOperation(createNew, projectPath));
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_renameRepoCallCount).toEqual(0);
    expect(mock_createNewRepoCallCount).toEqual(1);
  });

  test('on repo does not exist, should call rename', async () => {
    const store = mockStore({
      projectDetailsReducer: { projectSaveLocation: projectPath },
      loginReducer: {
        loggedInUser: false,
        userdata: { username: 'dummy-test' },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!',
      },
      settingsReducer: { onlineMode: true },
    });
    const createNew = false;

    await store.dispatch(actions.handleDcsOperation(createNew, projectPath));
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_renameRepoCallCount).toEqual(1);
    expect(mock_createNewRepoCallCount).toEqual(0);
  });
});

describe('handleDcsRenameCollision', () => {
  const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');

  beforeEach(() => {
    mock_alertCallbackButton = 0;
    mock_alertCallbackButtonText = '';
    mock_doOnlineConfirmCallback = false;
  });

  test('on click rename, should render and open project details', async () => {
    const langID = 'fr';
    const bookId = 'eph';
    const resourceID = 'ult';
    const projectPath = path.join('path/to/project', `${langID}_${resourceID}_${bookId}_book`);
    const store = mockStore({
      projectDetailsReducer: {
        projectSaveLocation: projectPath,
        manifest: {
          target_language: {
            id: langID,
            name: 'francais',
            direction: 'ltr',
          },
          project: {
            id: bookId,
            name: 'Ephesians',
          },
          resource: {
            id: resourceID,
            name: 'unfoldingWord Literal Text',
          },
        },
      },
      loginReducer: {
        loggedInUser: false,
        userdata: { username: 'dummy-test' },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!',
      },
      projectInformationCheckReducer: {
        alreadyImported: true,
        overwritePermitted: false,
      },
      projectValidationReducer: { onlyShowProjectInformationScreen: false },
    });
    mock_alertCallbackButton = 1;
    const expectedClickButton = 'buttons.rename_local';

    const mock_doLocalProjectRenamePrompting = (projectSaveLocation, projectName, resolve) => () => {
      resolve('RESHOW_DCS_CHOICE');
    };

    await store.dispatch(actions.handleDcsRenameCollision(false, mock_doLocalProjectRenamePrompting));
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_alertCallbackButtonText).toEqual(expectedClickButton);
  });

  test('on click continue, should do nothing', async () => {
    const store = mockStore({
      projectDetailsReducer: { projectSaveLocation: projectPath },
      loginReducer: {
        loggedInUser: false,
        userdata: { username: 'dummy-test' },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!',
      },
    });
    mock_alertCallbackButton = 2;
    const expectedClickButton = 'buttons.do_not_rename';

    await store.dispatch(actions.handleDcsRenameCollision());
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_alertCallbackButtonText).toEqual(expectedClickButton);
  });
});

describe('doLocalProjectRenamePrompting', () => {
  beforeEach(() => {
    mock_alertCallbackButton = 0;
    mock_alertCallbackButtonText = '';
    mock_doOnlineConfirmCallback = false;
  });

  test('on click rename, should render and open project details', async () => {
    const langID = 'fr';
    const bookId = 'eph';
    const resourceID = 'ult';
    const projectPath = path.join('path/to/project', `${langID}_${resourceID}_${bookId}_book`);
    const store = mockStore({
      projectDetailsReducer: {
        projectSaveLocation: projectPath,
        manifest: {
          target_language: {
            id: langID,
            name: 'francais',
            direction: 'ltr',
          },
          project: {
            id: bookId,
            name: 'Ephesians',
          },
          resource: {
            id: resourceID,
            name: 'unfoldingWord Literal Text',
          },
        },
      },
      loginReducer: {
        loggedInUser: false,
        userdata: { username: 'dummy-test' },
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!',
      },
      projectInformationCheckReducer: {
        alreadyImported: true,
        overwritePermitted: false,
      },
      projectValidationReducer: { onlyShowProjectInformationScreen: false },
    });
    mock_alertCallbackButton = 1;
    let mock_resolveResponse = 1;

    const mock_resolve = jest.fn((response) => {
      mock_resolveResponse = response;
    });

    await store.dispatch(actions.doLocalProjectRenamePrompting(projectPath, path.basename(projectPath), mock_resolve));
    expect(store.getActions()).toMatchSnapshot();
    expect(mock_resolve).toHaveBeenCalledTimes(1);
    expect(mock_resolveResponse).toEqual('RESHOW_DCS_CHOICE');
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
