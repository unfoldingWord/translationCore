import configureMockStore from 'redux-mock-store';
import fs from 'fs-extra';
import thunk from 'redux-thunk';
import path from 'path-extra';
// actions
import * as LocalImportWorkflowActions from '../js/actions/Import/LocalImportWorkflowActions';
// constants
import { IMPORTS_PATH } from '../js/common/constants';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const importProjectName = 'project';
const importProjectPath = path.join(IMPORTS_PATH, importProjectName);

jest.mock('fs-extra');
jest.mock('electronite', () => ({
  ipcRenderer: {
    sendSync: jest.fn()
      .mockImplementationOnce(() => ['a/working/project'])
      .mockImplementationOnce(() => null),
  },
}),
);

jest.mock('../js/selectors', () => ({
  getActiveLocaleLanguage: () => ({ code: 'en' }),
  getTranslate: () => jest.fn((code) => code),
  getSelectedToolApi: jest.fn(),
  getSupportingToolApis: jest.fn(() => []),
}));


describe('LocalImportWorkflowActions', () => {
  let initialState = {};

  beforeEach(() => {
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
        projectSaveLocation: '',
        manifest: {},
        currentProjectToolsProgress: {},
        projectType: null,
      },
      localImportReducer: {
        selectedProjectFilename: importProjectName,
        sourceProjectPath: IMPORTS_PATH,
      },
    };
  });

  it('selectLocalProject() with a file selected, should call sendSync and localImport', () => {
    const expectedActions = [
      { type: 'SHOW_DIMMED_SCREEN', bool: true },
      { type: 'CLOSE_PROJECTS_FAB' },
      { type: 'SHOW_DIMMED_SCREEN', bool: false },
      {
        type: 'OPEN_ALERT_DIALOG',
        alertMessage: 'projects.importing_local_alert',
        loading: true,
      },
      {
        type: 'UPDATE_SOURCE_PROJECT_PATH',
        sourceProjectPath: 'a/working/project',
      },
      {
        type: 'UPDATE_SELECTED_PROJECT_FILENAME',
        selectedProjectFilename: 'project',
      }];
    // given
    const store = mockStore(initialState);
    const mockLocalImport = jest.fn(() => () => Promise.resolve());
    // when
    return store.dispatch(LocalImportWorkflowActions.selectLocalProject(mockLocalImport)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  }, 5000);

  it('selectLocalProject() with no file selected, should call sendSync and show alert', () => {
    // given
    const expectedActions = [
      { 'bool': true, 'type': 'SHOW_DIMMED_SCREEN' },
      { 'type': 'CLOSE_PROJECTS_FAB' },
      { 'bool': false, 'type': 'SHOW_DIMMED_SCREEN' },
      { 'type': 'CLOSE_ALERT_DIALOG' }];
    const store = mockStore(initialState);
    const mockLocalImport = jest.fn(() => () => Promise.resolve());

    // when
    return store.dispatch(LocalImportWorkflowActions.selectLocalProject(mockLocalImport)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    // then
  }, 5000);

  it('localImport() on import error, should delete project', async () => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({
      [importProjectPath]: ['manifest.json'],
      [path.join(importProjectPath, 'manifest.json')]: {},
    });

    const store = mockStore(initialState);
    expect(fs.existsSync(importProjectPath)).toBeTruthy(); // path should be initialzed
    await store.dispatch(LocalImportWorkflowActions.localImport());
    expect(fs.existsSync(importProjectPath)).toBeFalsy(); // path should be deleted
  });
});
