import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fs from 'fs-extra';
import path from 'path-extra';
import * as OnlineImportWorkflowActions from '../src/js/actions/Import/OnlineImportWorkflowActions';
import ospath from "ospath";
import _ from 'lodash';

jest.mock('fs-extra');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const importProjectName = 'es-419_tit_text_ulb';
const STANDARD_PROJECT = 'https://git.door43.org/royalsix/' + importProjectName + '.git';
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const projectSaveLocation = IMPORTS_PATH;

let mock_cloneManifest = null;

//mocking functions that are relevant to OnlineImportWorkflowActions but not required
jest.mock('../src/js/helpers/Import/OnlineImportWorkflowHelpers', () => (
  {
    ...require.requireActual('../src/js/helpers/Import/OnlineImportWorkflowHelpers'),
    clone: async () => {
      return mock_saveJson(mock_cloneManifest);
    }
  }));

jest.mock('../src/js/helpers/ProjectMigration', () => jest.fn());
jest.mock('../src/js/actions/Import/ProjectValidationActions', () => (
  {
    ...require.requireActual('../src/js/actions/Import/ProjectValidationActions'),
    validateProject: () => ({ type: 'VALIDATE' }) }));
jest.mock('../src/js/actions/Import/ProjectImportFilesystemActions', () => ({
  deleteProjectFromImportsFolder: () => ({type: 'DELETE_PROJECT_FROM_IMORTS'}),
  move: () => {
    return ((dispatch) => {
      return new Promise((resolve) => {
        dispatch({type: 'MOVE'});
        resolve();
      });
    });
  }
}));
jest.mock('../src/js/actions/MyProjects/MyProjectsActions', () => ({ getMyProjects: () => ({ type: 'GET_MY_PROJECTS' }) }));
jest.mock('../src/js/actions/MyProjects/ProjectLoadingActions', () => ({
  clearLastProject: () => ({ type: 'CLEAR_LAST_PROJECT' }),
  displayTools: jest.fn(() => ({ type: 'DISPLAY_TOOLS' }))
}));
jest.mock('../src/js/helpers/TargetLanguageHelpers', ()=> ({
  generateTargetBibleFromTstudioProjectPath: () => {},
  targetBibleExists:() => false
}));
jest.mock('../src/js/helpers/ProjectValidation/ProjectStructureValidationHelpers', () => ({
  ensureSupportedVersion: () => {}
}));

describe('OnlineImportWorkflowActions.onlineImport', () => {
  let initialState = {};
  const manifest_ = {
    target_language: {
      id: "es-419",
      name: 'es-419',
      direction: 'ltr'
    },
    generator: {
      name: "ts-desktop",
      build: "132"
    },
    project: {
      id: "tit",
      name: 'Titus'
    },
    resource: {
      id: "ulb",
      name: 'unfoldingWord Literal Text'
    },
    tcInitialized: true,
    tc_version: 5
  };

  beforeEach(() => {
    fs.__resetMockFS();
    mock_cloneManifest = null;
    initialState = {
      importOnlineReducer: {
        importLink: STANDARD_PROJECT
      },
      settingsReducer: {
        onlineMode: true
      },
      projectDetailsReducer: {
        manifest: {},
        projectSaveLocation: projectSaveLocation
      },
      localImportReducer: {
        selectedProjectFilename:'path'
      },
      loginReducer: {
        userdata: {
          userName: 'johndoe'
        }
      },
      projectInformationCheckReducer: {},
      projectValidationReducer: {}
    };
  });

  it('should fail a project without manifest', async () => {
    const store = mockStore(initialState);
    await store.dispatch(OnlineImportWorkflowActions.onlineImport()).catch((error) => {
      expect(error).toEqual('projects.online_import_error');
      expect(error).toBeTruthy();
    });
  });

  it('on import errors should call required actions', async () => {
    const fileName = "manifest.json";
    const cloneToPath = path.join(IMPORTS_PATH, importProjectName, fileName);
    mock_cloneManifest = {
      [cloneToPath]: manifest_
    };
    const store = mockStore(initialState);
    await store.dispatch(OnlineImportWorkflowActions.onlineImport()).catch((error) => {
      expect(error).toEqual('Project has already been imported.');
      expect(store.getActions()).toMatchSnapshot();
    });
  });

  it('should import a ts-desktop generated project', async () => {
    const fileName = "manifest.json";
    const manifest = _.cloneDeep(manifest_);
    delete manifest.tcInitialized;
    delete manifest.tc_version;
    const cloneToPath = path.join(IMPORTS_PATH, importProjectName, fileName);
    mock_cloneManifest = {
      [cloneToPath]: manifest
    };
    const store = mockStore(initialState);
    await store.dispatch(OnlineImportWorkflowActions.onlineImport());
    expect(store.getActions()).toMatchSnapshot();
  });

  it('should import a ts-android generated project', async () => {
    const fileName = "manifest.json";
    const manifest = _.cloneDeep(manifest_);
    delete manifest.tcInitialized;
    delete manifest.tc_version;
    manifest.generator.name = "ts-android";
    const cloneToPath = path.join(IMPORTS_PATH, importProjectName, fileName);
    mock_cloneManifest = {
      [cloneToPath]: manifest
    };
    const store = mockStore(initialState);
    await store.dispatch(OnlineImportWorkflowActions.onlineImport()).catch((error) => {
      expect(error).toEqual('Project has already been imported.');
      // expect(store.getActions()).toMatchSnapshot();
    });
    expect(store.getActions()).toMatchSnapshot();
  });

  it('should import a tc-desktop generated project', async () => {
    const fileName = "manifest.json";
    const manifest = _.cloneDeep(manifest_);
    delete manifest.tcInitialized;
    delete manifest.tc_version;
    manifest.generator.name = "tc-desktop";
    const cloneToPath = path.join(IMPORTS_PATH, importProjectName, fileName);
    mock_cloneManifest = {
      [cloneToPath]: manifest
    };
    const store = mockStore(initialState);
    await store.dispatch(OnlineImportWorkflowActions.onlineImport());
    expect(store.getActions()).toMatchSnapshot();
  });

  it('should import a tcInitialized project', async () => {
    const fileName = "manifest.json";
    const manifest = _.cloneDeep(manifest_);
    delete manifest.tc_version;
    delete manifest.generator;
    const cloneToPath = path.join(IMPORTS_PATH, importProjectName, fileName);
    mock_cloneManifest = {
      [cloneToPath]: manifest
    };
    const store = mockStore(initialState);
    await store.dispatch(OnlineImportWorkflowActions.onlineImport());
    expect(store.getActions()).toMatchSnapshot();
  });

  it('should import a tc_version project', async () => {
    const fileName = "manifest.json";
    const manifest = _.cloneDeep(manifest_);
    delete manifest.tcInitialized;
    delete manifest.generator;
    const cloneToPath = path.join(IMPORTS_PATH, importProjectName, fileName);
    mock_cloneManifest = {
      [cloneToPath]: manifest
    };
    const store = mockStore(initialState);
    await store.dispatch(OnlineImportWorkflowActions.onlineImport());
    expect(store.getActions()).toMatchSnapshot();
  });
});

//
// helper functions
//

function mock_saveJson(mock_cloneManifest) {
  if(mock_cloneManifest) {
    for (let filePath of Object.keys(mock_cloneManifest)) {
      let data = mock_cloneManifest[filePath];
      fs.outputJsonSync(filePath, _.cloneDeep(data));
    }
  }
  return importProjectName;
}
