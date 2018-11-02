import configureMockStore from 'redux-mock-store';
import fs from 'fs-extra';
import thunk from 'redux-thunk';
import path from 'path-extra';
import ospath from 'ospath';
import * as ProjectLoadingActions from "../src/js/actions/MyProjects/ProjectLoadingActions";
import * as manifestUtils from "../src/js/helpers/ProjectMigration/manifestUtils";
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

jest.mock('fs-extra');

jest.mock('../src/js/selectors', () => ({
  getActiveLocaleLanguage: () => {
    return {code: 'en'};
  },
  getTranslate: () => {
    return jest.fn((code) => {
      return code;
    });
  },
  getProjectSaveLocation: (state) => {
    return (state.projectDetailsReducer.projectSaveLocation);
  },
  getProjectManifest: (state) => {
    return (state.projectDetailsReducer.manifest);
  },
  getIsUserLoggedIn: (state) => {
    return (state.loginReducer.loggedInUser);
  },
  getActiveHomeScreenSteps: (state) => {
    const isLoggedIn = state.loginReducer.loggedInUser;
    const isProjectLoaded = state.projectDetailsReducer.projectSaveLocation;
    const availableSteps = [true, true, isLoggedIn, isProjectLoaded];
    return availableSteps;
  },
  getUsername: () => {
    return 'johndoe';
  }
}));

describe('ProjectLoadingActions.migrateValidateLoadProject', () => {
  let initialState = {};
  const projectName = 'en_tit';
  const sourcePath = path.join(__dirname, 'fixtures/project');
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
          nextDisabled: false
        }
      },
      loginReducer: {
        loggedInUser: false,
        userdata: {},
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!'
      },
      projectDetailsReducer: {
        projectSaveLocation: projectPath,
        manifest,
        currentProjectToolsProgress: {},
        projectType: null
      },
      localImportReducer: {
        selectedProjectFilename: '',
        sourceProjectPath: '',
        oldSelectedProjectFileName: null
      },
      projectInformationCheckReducer: {alreadyImported:true},
      settingsReducer: { currentSettings: {}},
      projectValidationReducer: {
        projectValidationStepsArray: [ ]
      }
    };
  });

  it('should open to details screen if project name is not valid', async () => {
    // given
    const store = mockStore(initialState);
    const selectedProjectFilename = projectName;

    // when
    await store.dispatch(ProjectLoadingActions.migrateValidateLoadProject(selectedProjectFilename));

    //then
    expect(cleanupActions(store.getActions())).toMatchSnapshot();
  });

  it('should just open project if project name is valid', async () => {
    // given
    const selectedProjectFilename = 'en_ult_tit_book';
    const resourceId = "ult";
    // rename project to selected
    renameProject(selectedProjectFilename, projectPath, initialState, resourceId);

    const store = mockStore(initialState);

    // when
    await store.dispatch(ProjectLoadingActions.migrateValidateLoadProject(selectedProjectFilename));

    //then
    expect(cleanupActions(store.getActions())).toMatchSnapshot();
  });
});

describe('loadProject', () => {
  let initialState = {};
  const projectName = 'en_tit';
  const sourcePath = path.join(__dirname, 'fixtures/project');
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
          nextDisabled: false
        }
      },
      loginReducer: {
        loggedInUser: false,
        userdata: {},
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!'
      },
      projectDetailsReducer: {
        projectSaveLocation: projectPath,
        manifest,
        currentProjectToolsProgress: {},
        projectType: null
      },
      localImportReducer: {
        selectedProjectFilename: '',
        sourceProjectPath: '',
        oldSelectedProjectFileName: null
      },
      projectInformationCheckReducer: {alreadyImported:true},
      settingsReducer: { currentSettings: {}},
      projectValidationReducer: {
        projectValidationStepsArray: [ ]
      }
    };
  });

  it('displays the details screen of an invalid project', async () => {
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
    const resourceId = "ult";
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

function cleanupActions(actions) {
  if (actions && actions.length) {
    for (const action of actions) {
      if (action.projects && Array.isArray(action.projects)) {
        for (const project of action.projects) {
          if (project.accessTimeAgo) {
            project.accessTimeAgo = 'now';
          }
        }
      }
      if ('pathLocation' in action) {
        action.pathLocation = path.basename(action.pathLocation);
      }
    }
  }
  return actions;
}

function renameProject(selectedProjectFilename, projectPath, initialState, resourceId) {
  const currentProjectPath = path.join(PROJECTS_PATH, selectedProjectFilename);
  fs.moveSync(projectPath, currentProjectPath);
  initialState.projectDetailsReducer.projectSaveLocation = currentProjectPath;
  initialState.projectDetailsReducer.manifest.resource.id = resourceId;
  fs.outputJsonSync(manifestUtils.getManifestPath(currentProjectPath), initialState.projectDetailsReducer.manifest);
}

