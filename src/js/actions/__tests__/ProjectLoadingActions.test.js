import configureMockStore from 'redux-mock-store';
import fs from 'fs-extra';
import thunk from 'redux-thunk';
import path from 'path-extra';
import * as ProjectLoadingActions from '../MyProjects/ProjectLoadingActions';
import * as manifestUtils from '../../helpers/ProjectMigration/manifestUtils';
// constants
import {
  APP_VERSION,
  MIN_COMPATIBLE_VERSION,
  tc_EDIT_VERSION_KEY,
  tc_MIN_COMPATIBLE_VERSION_KEY,
  tc_LAST_OPENED_KEY,
  PROJECTS_PATH,
} from '../../common/constants';
import ActionTypes from '../ActionTypes';
jest.mock('fs-extra');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../selectors', () => ({
  ...require.requireActual('../../selectors/'),
  getCurrentProjectToolsSelectedGL: () => 'en',
  getActiveLocaleLanguage: () => ({ code: 'en' }),
  getTranslate: () => jest.fn((code) => code),
  getSourceBook: () => ({}),
  getTargetBook: () => ({}),
  getProjectSaveLocation: (state) => (state.projectDetailsReducer.projectSaveLocation),
  getProjectManifest: (state) => (state.projectDetailsReducer.manifest),
  getIsUserLoggedIn: (state) => (state.loginReducer.loggedInUser),
  getActiveHomeScreenSteps: (state) => {
    const isLoggedIn = state.loginReducer.loggedInUser;
    const isProjectLoaded = state.projectDetailsReducer.projectSaveLocation;
    const availableSteps = [true, true, isLoggedIn, isProjectLoaded];
    return availableSteps;
  },
  getUsername: () => 'johndoe',
  getToolGatewayLanguage: () => 'en',
  getBibles: () => ({}),
  getTools: () => [
    {
      name: 'translationWords',
      api: { triggerWillConnect: jest.fn() },
    },
    {
      name: 'wordAlignment',
      api: { triggerWillConnect: jest.fn() },
    },
  ],
  getSelectedToolApi: jest.fn(),
  getSupportingToolApis: jest.fn(() => []),
}));

describe('ProjectLoadingActions.migrateValidateLoadProject', () => {
  let initialState = {};
  const projectName = 'en_tit';
  const sourcePath = path.join('src', '__tests__','fixtures','project');
  const projectPath = path.join(PROJECTS_PATH, projectName);

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    let copyFiles = [projectName];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);
    const manifest = manifestUtils.getProjectManifest(projectPath);

    initialState = {
      resourcesReducer: { bibles: {} },
      homeScreenReducer: {
        stepper: {
          stepIndex: 1,
          nextStepName: 'Project Information',
          previousStepName: 'Cancel',
          nextDisabled: false,
        },
      },
      loginReducer: {
        loggedInUser: false,
        userdata: {},
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!',
      },
      projectDetailsReducer: {
        projectSaveLocation: projectPath,
        manifest,
        currentProjectToolsProgress: {},
        projectType: null,
      },
      localImportReducer: {
        selectedProjectFilename: '',
        sourceProjectPath: '',
        oldSelectedProjectFileName: null,
      },
      projectInformationCheckReducer: { alreadyImported:true },
      settingsReducer: {
        currentSettings: {},
        toolsSettings: {
          ScripturePane: {
            currentPaneSettings: [
              {
                bibleId: 'ult',
                languageId: 'en',
              },
            ],
          },
        },
      },
      projectValidationReducer: { projectValidationStepsArray: [ ] },
      myProjectsReducer: { projects: [] },
    };
  });

  it('should open to details screen if project name is not valid', async () => {
    // given
    const store = mockStore(initialState);
    const selectedProjectFilename = projectName;

    // when
    await store.dispatch(ProjectLoadingActions.openProject(selectedProjectFilename));

    //then
    expect(cleanupActions(store.getActions())).toMatchSnapshot();
  });

  it('should just open project if project name is valid', async () => {
    // given
    const selectedProjectFilename = 'en_ult_tit_book';
    const resourceId = 'ult';
    // rename project to selected
    renameProject(selectedProjectFilename, projectPath, initialState, resourceId);

    const store = mockStore(initialState);

    // when
    await store.dispatch(ProjectLoadingActions.openProject(selectedProjectFilename));

    //then
    expect(cleanupActions(store.getActions())).toMatchSnapshot();
  });
});

describe('ProjectLoadingActions.updateProjectVersion', () => {
  let manifest = {};

  beforeEach(() => {
    manifest = {
      'generator':{ 'name':'tc-desktop','build':'' },
      'target_language':{
        'id':'en','name':'English','direction':'ltr',
      },
      'ts_project':{ 'id':'tit','name':'Titus' },
      'project':{ 'id':'tit','name':'Titus' },
      'type':{ 'id':'text','name':'Text' },
      'time_created':'2018-01-31T19:19:27.914Z',
      'tcInitialized':true,
      'tc_version':1,
      'license':'CC BY-SA 4.0',
    };
  });

  it('when edit version and minimum missing, then update', async () => {
    // given
    const expectUpdate = true;
    const initialState = {
      projectDetailsReducer: {
        projectSaveLocation: 'DUMMY',
        manifest,
        currentProjectToolsProgress: {},
        projectType: null,
      },
      resourcesReducer: { bibles: {} },
    };
    const store = mockStore(initialState);

    // when
    await store.dispatch(ProjectLoadingActions.updateProjectVersion());

    //then
    validateVersions(store, expectUpdate);
  });

  it('when edit version different, then update', async () => {
    // given
    const expectUpdate = true;
    manifest[tc_MIN_COMPATIBLE_VERSION_KEY] = APP_VERSION;
    manifest[tc_EDIT_VERSION_KEY] = '0.10.0';
    const initialState = {
      projectDetailsReducer: {
        projectSaveLocation: 'DUMMY',
        manifest,
        currentProjectToolsProgress: {},
        projectType: null,
      },
      resourcesReducer: { bibles: {} },
    };
    const store = mockStore(initialState);

    // when
    await store.dispatch(ProjectLoadingActions.updateProjectVersion());

    //then
    validateVersions(store, expectUpdate);
  });

  it('when minimum version different, then update', async () => {
    // given
    const expectUpdate = true;
    manifest[tc_MIN_COMPATIBLE_VERSION_KEY] = '0.10.0';
    manifest[tc_EDIT_VERSION_KEY] = MIN_COMPATIBLE_VERSION;
    const initialState = {
      projectDetailsReducer: {
        projectSaveLocation: 'DUMMY',
        manifest,
        currentProjectToolsProgress: {},
        projectType: null,
      },
      resourcesReducer: { bibles: {} },
    };
    const store = mockStore(initialState);

    // when
    await store.dispatch(ProjectLoadingActions.updateProjectVersion());

    //then
    validateVersions(store, expectUpdate);
  });

  it('when edit version and minimum are the same, no update', async () => {
    // given
    const expectUpdate = false;
    manifest[tc_MIN_COMPATIBLE_VERSION_KEY] = MIN_COMPATIBLE_VERSION;
    manifest[tc_EDIT_VERSION_KEY] = APP_VERSION;
    const initialState = {
      projectDetailsReducer: {
        projectSaveLocation: 'DUMMY',
        manifest,
        currentProjectToolsProgress: {},
        projectType: null,
      },
      resourcesReducer: { bibles: {} },
    };
    const store = mockStore(initialState);

    // when
    await store.dispatch(ProjectLoadingActions.updateProjectVersion());

    //then
    validateVersions(store, expectUpdate);
  });
});

describe('loadProject', () => {
  let initialState = {};
  const projectName = 'en_tit';
  const sourcePath = path.join('src', '__tests__','fixtures','project');
  const projectPath = path.join(PROJECTS_PATH, projectName);

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    let copyFiles = [projectName];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);
    const manifest = manifestUtils.getProjectManifest(projectPath);

    initialState = {
      homeScreenReducer: {
        stepper: {
          stepIndex: 1,
          nextStepName: 'Project Information',
          previousStepName: 'Cancel',
          nextDisabled: false,
        },
      },
      loginReducer: {
        loggedInUser: false,
        userdata: {},
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!',
      },
      projectDetailsReducer: {
        projectSaveLocation: projectPath,
        manifest,
        currentProjectToolsProgress: {},
        projectType: null,
      },
      localImportReducer: {
        selectedProjectFilename: '',
        sourceProjectPath: '',
        oldSelectedProjectFileName: null,
      },
      projectInformationCheckReducer: { alreadyImported:true },
      settingsReducer: {
        currentSettings: {},
        toolsSettings: {
          ScripturePane: {
            currentPaneSettings: [
              {
                bibleId: 'ult',
                languageId: 'en',
              },
            ],
          },
        },
      },
      projectValidationReducer: { projectValidationStepsArray: [ ] },
      resourcesReducer: { bibles: {} },
    };
  });

  it('displays the details screen of an invalid project name', async () => {
    // given
    const store = mockStore(initialState);

    // when
    await store.dispatch(ProjectLoadingActions.openProject(projectName));

    //then
    expect(cleanupActions(store.getActions())).toMatchSnapshot();
  });

  it('opens a valid project', async () => {
    // given
    const selectedProjectFilename = 'en_ult_tit_book';
    const resourceId = 'ult';
    // rename project to selected
    renameProject(selectedProjectFilename, projectPath, initialState, resourceId);

    const store = mockStore(initialState);

    // when
    await store.dispatch(ProjectLoadingActions.openProject(selectedProjectFilename));

    //then
    expect(cleanupActions(store.getActions())).toMatchSnapshot();
  });
});

//
// helpers
//

function validateVersions(store, expectUpdate) {
  const actions = store.getActions();
  expect(actions.length).toEqual(expectUpdate ? 2 : 0); // all or nothing

  for (let action of actions) {
    expect(action.type).toEqual('ADD_MANIFEST_PROPERTY');
    const propertyName = action.propertyName;
    const value = action.value;

    switch (propertyName) {
    case tc_EDIT_VERSION_KEY:
      expect(value).toEqual(APP_VERSION);
      break;
    case tc_MIN_COMPATIBLE_VERSION_KEY:
      expect(value).toEqual(MIN_COMPATIBLE_VERSION);
      break;
    default:
      expect(value).toBeUndefined();
      break;
    }
  }
}

function cleanupVersions(actions) {
  for (let action of actions) {
    if (action.type === 'ADD_MANIFEST_PROPERTY') {
      const propertyName = action.propertyName;
      const value = action.value;

      switch (propertyName) {
      case tc_EDIT_VERSION_KEY:
        if (value === APP_VERSION) {
          action.value = 'CURRENT_APP_VERSION';
        }
        break;
      case tc_MIN_COMPATIBLE_VERSION_KEY:
        if (value === MIN_COMPATIBLE_VERSION) {
          action.value = 'CURRENT_MIN_COMPATIBLE_VERSION';
        }
        break;
      default:
        expect(value).toBeUndefined();
        break;
      }
    }
  }
}

function cleanupActions(actions) {
  if (actions && actions.length) {
    for (const action of actions) {
      if (action.projects && Array.isArray(action.projects)) {
        for (const project of action.projects) {
          if (project.lastOpened) {
            // set last opened to 5 days ago
            project.lastOpened = new Date(new Date().getTime() - (5 * 24 * 60 * 60 * 1000));
          }
        }
      }

      if (action.type === ActionTypes.ADD_PROJECT_SETTINGS_PROPERTY && action.propertyName === tc_LAST_OPENED_KEY) {
        action.value = '2019-08-22T17:06:12.493Z';
      }

      if ('pathLocation' in action) {
        action.pathLocation = path.basename(action.pathLocation);
      }
    }
  }
  cleanupVersions(actions);
  return actions;
}

function renameProject(selectedProjectFilename, projectPath, initialState, resourceId) {
  const currentProjectPath = path.join(PROJECTS_PATH, selectedProjectFilename);
  fs.moveSync(projectPath, currentProjectPath);
  initialState.projectDetailsReducer.projectSaveLocation = currentProjectPath;
  initialState.projectDetailsReducer.manifest.resource.id = resourceId;
  fs.outputJsonSync(manifestUtils.getManifestPath(currentProjectPath), initialState.projectDetailsReducer.manifest);
}

