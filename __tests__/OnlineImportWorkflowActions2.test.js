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

describe('OnlineImportWorkflowActions.onlineImport()', () => {
  let initialState = {};
  const importProjectPath = path.join(IMPORTS_PATH, importProjectName);

  beforeEach(() => {
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
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({
      [importProjectPath]: ['manifest.json'],
      [path.join(importProjectPath, 'manifest.json')]: {}
    });
    const store = mockStore(initialState);

    expect(fs.existsSync(importProjectPath)).toBeTruthy(); // path should be initialzed
    await store.dispatch(OnlineImportWorkflowActions.onlineImport());
    expect(fs.existsSync(importProjectPath)).toBeFalsy(); // path should be deleted
  });
});
