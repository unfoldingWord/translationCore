import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as OnlineImportWorkflowActions from '../src/js/actions/Import/OnlineImportWorkflowActions';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const importProjectName = 'es-419_tit_text_ulb';
const STANDARD_PROJECT = 'https://git.door43.org/royalsix/' + importProjectName + '.git';
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');
import path from 'path-extra';
import fs from "fs-extra";
jest.mock('fs-extra');

describe('OnlineImportWorkflowActions.localImport()', () => {
  let initialState = {};
  const importProjectPath = path.join(IMPORTS_PATH, importProjectName);

  beforeEach(() => {
    initialState = {
      importOnlineReducer: {
        importLink: STANDARD_PROJECT
      },
      settingsReducer: {
        onlineMode: true
      }
    };
  });

  it('on import error, should delete project', () => {
    return new Promise((resolve) => {
      // given
      // reset mock filesystem data
      fs.__resetMockFS();
      // Set up mocked out filePath and data in mock filesystem before each test
      fs.__setMockFS({
        [importProjectPath]: ['manifest.json'],
        [path.join(importProjectPath, 'manifest.json')]: {}
      });
      const store = mockStore(initialState);
      const getState = () => {
        return store.getState();
      };
      let callCount = 0;
      const dispatch = (func) => {
        if(callCount++ === 0) { // only execute first call confirming online
          func(dispatch, getState);
        }
      };
      expect(fs.existsSync(importProjectPath)).toBeTruthy(); // path should be initialzed

      // when
      const localImport = OnlineImportWorkflowActions.onlineImport();
      new Promise (async(resolve2) => {
        await localImport(dispatch, getState);
        resolve2();
      }).then(() => {

        // then
        expect(fs.existsSync(importProjectPath)).not.toBeTruthy(); // path should be deleted
        resolve();
      });
    });
  }, 5000);
});
