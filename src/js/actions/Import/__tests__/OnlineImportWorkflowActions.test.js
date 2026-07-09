import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fs from 'fs-extra';
import path from 'path-extra';
// actions
import {
  getLocalizedErrorPrompt, onlineImport, recoverFailedOnlineImport,
} from '../OnlineImportWorkflowActions';
import * as ProjectDetailsActions from '../../ProjectDetailsActions';
// helpers
import { IMPORTS_PATH, DCS_BASE_URL } from '../../../common/constants';
import * as REPO from '../../../helpers/Repo';
import * as ProjectDetailsHelpers from '../../../helpers/ProjectDetailsHelpers';
jest.mock('fs-extra');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const importProjectName = 'es-419_tit_text_ulb';
const STANDARD_PROJECT = DCS_BASE_URL + '/royalsix/' + importProjectName + '.git';
const projectSaveLocation = IMPORTS_PATH;

// let mock_cloneManifest = null;

//mocking functions that are relevant to OnlineImportWorkflowActions but not required
// jest.mock('../js/helpers/Import/OnlineImportWorkflowHelpers', () => (
//   {
//     ...require.requireActual('../js/helpers/Import/OnlineImportWorkflowHelpers'),
//     clone: async () => {
//       return mock_saveJson(mock_cloneManifest);
//     }
//   }));

jest.mock('../../../helpers/ProjectMigration', () => jest.fn());
jest.mock('../ProjectValidationActions', () => (
  {
    ...require.requireActual('../ProjectValidationActions'),
    validateProject: () => ({ type: 'VALIDATE' }),
  }));
jest.mock('../ProjectImportFilesystemActions', () => ({
  deleteProjectFromImportsFolder: () => ({ type: 'DELETE_PROJECT_FROM_IMORTS' }),
  move: () => ((dispatch) => new Promise((resolve) => {
    dispatch({ type: 'MOVE' });
    resolve();
  })),
}));
jest.mock('../../MyProjects/MyProjectsActions', () => ({ getMyProjects: () => ({ type: 'GET_MY_PROJECTS' }) }));
jest.mock('../../MyProjects/ProjectLoadingActions', () => ({
  closeProject: () => ({ type: 'CLEAR_LAST_PROJECT' }),
  displayTools: jest.fn(() => ({ type: 'DISPLAY_TOOLS' })),
  openProject: jest.fn(() => ({ type: 'OPEN_PROJECT' })),
  showInvalidVersionError: jest.fn(() => ({ type: 'SHOW_INVALID_VERSION_ERROR' })),
}));
jest.mock('../../../helpers/TargetLanguageHelpers', ()=> ({
  generateTargetBibleFromTstudioProjectPath: () => {},
  targetBibleExists:() => false,
}));
jest.mock('../../../helpers/ProjectValidation/ProjectStructureValidationHelpers', () => ({
  ensureSupportedVersion: () => {},
  isProjectSupported: () => Promise.resolve(true),
}));
jest.mock('../../../helpers/Import/OnlineImportWorkflowHelpers', () => ({
  generateImportPath: jest.fn(() => Promise.resolve(require('path-extra').join(require('../../../common/constants').IMPORTS_PATH, 'es-419_tit_text_ulb'))),
  verifyThisIsTCoreOrTStudioProject: jest.fn(() => true),
}));
jest.mock('../../../helpers/CopyrightCheckHelpers', () => ({ assignLicenseToOnlineImportedProject: jest.fn(() => Promise.resolve()) }));
jest.mock('../../../helpers/Import/ProjectImportFilesystemHelpers', () => ({
  deleteImportsFolder: jest.fn(() => Promise.resolve()),
  deleteProjectFromImportsFolder: jest.fn(),
}));
jest.mock('../../ProjectDetailsActions', () => ({
  ...require.requireActual('../../ProjectDetailsActions'),
  updateProjectNameIfNecessary: jest.fn(),
  handleOverwriteWarning: jest.fn(),
  doRenamePrompting: jest.fn(() => () => Promise.resolve()),
}));
jest.mock('../../../helpers/ProjectDetailsHelpers', () => ({
  ...require.requireActual('../../../helpers/ProjectDetailsHelpers'),
  doesProjectAlreadyExist: jest.fn(),
}));

const mock_translate = (t, opts) => {
  if (opts) {
    return t + ': ' + JSON.stringify(opts);
  } else {
    return t;
  }
};

describe('OnlineImportWorkflowActions.onlineImport', () => {
  let initialState = {};
  const manifest_ = {
    target_language: {
      id: 'es-419',
      name: 'es-419',
      direction: 'ltr',
    },
    generator: {
      name: 'ts-desktop',
      build: '132',
    },
    project: {
      id: 'tit',
      name: 'Titus',
    },
    resource: {
      id: 'ulb',
      name: 'unfoldingWord Literal Text',
    },
    tcInitialized: true,
    tc_version: 5,
  };

  beforeEach(() => {
    fs.__resetMockFS();
    // mock_cloneManifest = null;
    initialState = {
      importOnlineReducer: { importLink: STANDARD_PROJECT },
      settingsReducer: { onlineMode: true },
      projectDetailsReducer: {
        manifest: {},
        projectSaveLocation: projectSaveLocation,
      },
      localImportReducer: { selectedProjectFilename:'path' },
      loginReducer: { userdata: { userName: 'johndoe' } },
      projectInformationCheckReducer: {},
      projectValidationReducer: {},
    };
  });

  it('on import errors should call required actions', () => {
    const fileName = 'manifest.json';
    const cloneToPath = path.join(IMPORTS_PATH, importProjectName, fileName);
    fs.writeJSONSync(path.join(cloneToPath, 'manifest.json'), manifest_);

    const store = mockStore(initialState);
    store.dispatch(recoverFailedOnlineImport('import failed'));
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('OnlineImportWorkflowActions.onlineImport overwrite handling', () => {
  let initialState = {};

  beforeEach(() => {
    fs.__resetMockFS();
    jest.spyOn(REPO.default, 'clone').mockImplementation(() => Promise.resolve());
    ProjectDetailsActions.updateProjectNameIfNecessary.mockImplementation((results) => () => {
      results.repoRenamed = false;
      results.repoExists = false;
      results.newRepoName = importProjectName;
      return Promise.resolve();
    });
    ProjectDetailsActions.handleOverwriteWarning.mockReset();
    ProjectDetailsHelpers.doesProjectAlreadyExist.mockReset();
    initialState = {
      importOnlineReducer: { importLink: STANDARD_PROJECT },
      settingsReducer: { onlineMode: true },
      projectDetailsReducer: {
        manifest: {},
        projectSaveLocation: path.join(IMPORTS_PATH, importProjectName),
      },
      localImportReducer: { selectedProjectFilename: importProjectName },
      loginReducer: { userdata: { username: 'johndoe' } },
      projectInformationCheckReducer: {},
      projectValidationReducer: {},
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('when project does not exist locally, should move project without overwrite prompt', async () => {
    // given
    ProjectDetailsHelpers.doesProjectAlreadyExist.mockReturnValue(false);
    const store = mockStore(initialState);

    // when
    await store.dispatch(onlineImport());

    // then
    const actionTypes = store.getActions().map((action) => action.type);
    expect(ProjectDetailsActions.handleOverwriteWarning).not.toHaveBeenCalled();
    expect(actionTypes).toContain('MOVE');
    expect(actionTypes).toContain('OPEN_PROJECT');
  });

  it('when project exists locally and user confirms overwrite, should merge instead of move', async () => {
    // given
    ProjectDetailsHelpers.doesProjectAlreadyExist.mockReturnValue(true);
    ProjectDetailsActions.handleOverwriteWarning.mockImplementation(() => () => Promise.resolve(true));
    const store = mockStore(initialState);

    // when
    await store.dispatch(onlineImport());

    // then
    const actionTypes = store.getActions().map((action) => action.type);
    expect(ProjectDetailsActions.handleOverwriteWarning).toHaveBeenCalledTimes(1);
    expect(ProjectDetailsActions.handleOverwriteWarning).toHaveBeenCalledWith(path.join(IMPORTS_PATH, importProjectName), importProjectName);
    expect(actionTypes).not.toContain('MOVE');
    expect(actionTypes).toContain('OPEN_PROJECT');
  });

  it('when project exists locally and user cancels overwrite, should clean up and not open project', async () => {
    // given
    ProjectDetailsHelpers.doesProjectAlreadyExist.mockReturnValue(true);
    ProjectDetailsActions.handleOverwriteWarning.mockImplementation(() => () => Promise.resolve(false));
    const { deleteProjectFromImportsFolder } = require('../../../helpers/Import/ProjectImportFilesystemHelpers');
    deleteProjectFromImportsFolder.mockClear();
    const store = mockStore(initialState);

    // when
    await store.dispatch(onlineImport());

    // then
    const actionTypes = store.getActions().map((action) => action.type);
    expect(ProjectDetailsActions.handleOverwriteWarning).toHaveBeenCalledTimes(1);
    expect(actionTypes).not.toContain('MOVE');
    expect(actionTypes).not.toContain('OPEN_PROJECT');
    expect(actionTypes).toContain('CLEAR_LAST_PROJECT'); // project was closed
    expect(actionTypes).toContain('TOGGLE_PROJECT_VALIDATION_STEPPER'); // stepper was canceled
    expect(deleteProjectFromImportsFolder).toHaveBeenCalledWith(importProjectName);
  });
});

describe('OnlineImportWorkflowActions.getLocalizedErrorPrompt', () => {
  test('Invalid users session', () => {
    // given
    const error = new Error('error');
    error.status = 401;
    const expectedError = 'users.session_invalid';
    const expectedMessage = `projects.known_download_networking_error: {"error_message":"${expectedError}","project_url":"projectUrl"}`;

    // when
    const results = getLocalizedErrorPrompt(error, `projectUrl`, mock_translate);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('IP address not found', () => {
    // given
    const error = new Error('error');
    error.code = REPO.NETWORK_ERROR_IP_ADDR_NOT_FOUND;
    const expectedError = 'no_internet';
    const expectedMessage = `projects.known_download_networking_error: {"error_message":"${expectedError}","project_url":"projectUrl"}`;

    // when
    const results = getLocalizedErrorPrompt(error, `projectUrl`, mock_translate);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('unable to connect', () => {
    // given
    const details = 'details';
    const error = new Error('error: ' + REPO.GIT_ERROR_UNABLE_TO_CONNECT + ': ' + details);
    const expectedError = 'no_internet';
    const expectedMessage = `projects.known_download_networking_error: {"error_message":"${expectedError}","project_url":"projectUrl"}`;

    // when
    const results = getLocalizedErrorPrompt(error, `projectUrl`, mock_translate);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('unknown git problem', () => {
    // given
    const details = 'details';
    const error = new Error('error: ' + REPO.GIT_ERROR_UNKNOWN_PROBLEM + ': ' + details);
    const expectedMessage = `projects.unknown_download_networking_error: {"actions":"actions","user_feedback":"user_feedback","project_url":"projectUrl","app_name":"_.app_name"}`;

    // when
    const results = getLocalizedErrorPrompt(error, `projectUrl`, mock_translate);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('unknown problem', () => {
    // given
    const errStr = 'Error';
    const error = new Error(errStr);
    const expectedMessage = `projects.unknown_download_networking_error: {"actions":"actions","user_feedback":"user_feedback","project_url":"projectUrl","app_name":"_.app_name"}`;

    // when
    const results = getLocalizedErrorPrompt(error, `projectUrl`, mock_translate);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('has message', () => {
    // given
    const error = new Error('error');
    error.message = 'message';
    const expectedMessage = `projects.unknown_download_networking_error: {"actions":"actions","user_feedback":"user_feedback","project_url":"projectUrl","app_name":"_.app_name"}`;

    // when
    const results = getLocalizedErrorPrompt(error, `projectUrl`, mock_translate);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('unknown string', () => {
    // given
    const error = 'data';
    const expectedMessage = `projects.unknown_download_networking_error: {"actions":"actions","user_feedback":"user_feedback","project_url":"projectUrl","app_name":"_.app_name"}`;

    // when
    const results = getLocalizedErrorPrompt(error, `projectUrl`, mock_translate);

    // then
    expect(results).toEqual(expectedMessage);
  });
});
