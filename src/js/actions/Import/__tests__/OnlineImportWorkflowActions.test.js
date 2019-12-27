import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fs from 'fs-extra';
import path from 'path-extra';
// actions
import { recoverFailedOnlineImport } from '../OnlineImportWorkflowActions';
// helpers
import { IMPORTS_PATH, DCS_BASE_URL } from '../../../common/constants';
jest.mock('fs-extra');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const importProjectName = 'es-419_tit_text_ulb';
const STANDARD_PROJECT = DCS_BASE_URL + '/royalsix/' + importProjectName + '.git';
const projectSaveLocation = IMPORTS_PATH;

// let mock_cloneManifest = null;

//mocking functions that are relevant to OnlineImportWorkflowActions but not required
// jest.mock('../src/js/helpers/Import/OnlineImportWorkflowHelpers', () => (
//   {
//     ...require.requireActual('../src/js/helpers/Import/OnlineImportWorkflowHelpers'),
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
}));
jest.mock('../../../helpers/TargetLanguageHelpers', ()=> ({
  generateTargetBibleFromTstudioProjectPath: () => {},
  targetBibleExists:() => false,
}));
jest.mock('../../../helpers/ProjectValidation/ProjectStructureValidationHelpers', () => ({ ensureSupportedVersion: () => {} }));

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
