import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path-extra';
import ospath from 'ospath';
import fs from "fs-extra";
// actions
import * as OnlineImportWorkflowActions from '../src/js/actions/Import/OnlineImportWorkflowActions';
// constants
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const importProjectName = 'es-419_tit_text_ulb';
const STANDARD_PROJECT = 'https://git.door43.org/royalsix/' + importProjectName + '.git';
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');

jest.mock('fs-extra');

jest.mock('../src/js/selectors', () => ({
  ...require.requireActual('../src/js/selectors'),
  getActiveLocaleLanguage: () => {
    return {code: 'en'};
  }
}));

describe('OnlineImportWorkflowActions.onlineImport()', () => {
  let initialState = {};
  const importProjectPath = path.join(IMPORTS_PATH, importProjectName);

  beforeEach(() => {
    fs.__resetMockFS();
    initialState = {
      importOnlineReducer: {
        importLink: STANDARD_PROJECT
      },
      settingsReducer: {
        onlineMode: true
      },
      projectDetailsReducer: {
        projectSaveLocation: ''
      },
      localImportReducer: {
        selectedProjectFilename: ''
      }
    };
  });

  it('on import error, should delete project', async () => {
    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({
      [importProjectPath]: ['manifest.json'],
      [path.join(importProjectPath, 'manifest.json')]: {}
    });
    const store = mockStore(initialState);
    expect(fs.existsSync(importProjectPath)).toBeTruthy(); // path should be initialzed
    return store.dispatch(OnlineImportWorkflowActions.onlineImport()).catch((e)=>{
      expect(e).toBe("Project has already been imported.");
      expect(fs.existsSync(importProjectPath)).toBeFalsy(); // path should be deleted
    });
  });
});
