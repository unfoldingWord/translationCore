import path from 'path-extra';
import ospath from 'ospath';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as OnlineImportWorkflowActions from '../src/js/actions/Import/OnlineImportWorkflowActions';
import * as fs from 'fs-extra';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const importProjectName = 'es-419_tit_text_ulb';
const STANDARD_PROJECT = 'https://git.door43.org/royalsix/' + importProjectName + '.git';
jest.mock('../src/js/actions/Import/ProjectMigrationActions', () => ({ migrate: jest.fn() }));
jest.mock('../src/js/actions/Import/ProjectValidationActions', () => ({ validate: () => ({ type: 'VALIDATE' }) }));
jest.mock('../src/js/actions/Import/ProjectImportFilesystemActions', () => ({ move: () => ({ type: 'MOVE' }) }));
jest.mock('../src/js/actions/MyProjects/MyProjectsActions', () => ({ getMyProjects: () => ({ type: 'GET_MY_PROJECTS' }) }));
jest.mock('../src/js/actions/MyProjects/ProjectLoadingActions', () => ({ displayTools: () => ({ type: 'DISPLAY_TOOLS' }) }));

describe('OnlineImportWorkflowActions.onlineImport', () => {
  let initialState = {};

  beforeEach(() => {
    fs.__resetMockFS();
    initialState = {
      importOnlineReducer: {
        importLink: STANDARD_PROJECT
      },
      settingsReducer: {
        onlineMode: true
      }
    };
  });

  it('should import a project that has whitespace in string', () => {
    const expectedActions = [
      { type: 'IMPORT_LINK', importLink: '' },
      {
        type: 'OPEN_ALERT_DIALOG',
        alertMessage: 'home.project.importing_file',
        loading: true
      },
      {
        type: 'UPDATE_SELECTED_PROJECT_FILENAME',
        selectedProjectFilename: 'es-419_tit_text_ulb'
      },
      { type: 'VALIDATE' },
      { type: 'MOVE' },
      { type: 'GET_MY_PROJECTS' },
      { type: 'DISPLAY_TOOLS' }
    ];
    const store = mockStore(initialState);
    return store.dispatch(OnlineImportWorkflowActions.onlineImport()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
