import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as OnlineImportWorkflowActions from '../src/js/actions/Import/OnlineImportWorkflowActions';
import * as fs from 'fs-extra';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const importProjectName = 'es-419_tit_text_ulb';
const STANDARD_PROJECT = 'https://git.door43.org/royalsix/' + importProjectName + '.git';

//mocking functions that are relevant to OnlineImportWorkflowActions but not required
jest.mock('../src/js/actions/Import/ProjectMigrationActions', () => ({ migrate: jest.fn() }));
jest.mock('../src/js/actions/Import/ProjectValidationActions', () => (
  {
    ...require.requireActual('../src/js/actions/Import/ProjectValidationActions'),
    validate: () => ({ type: 'VALIDATE' }) }));
jest.mock('../src/js/actions/Import/ProjectImportFilesystemActions', () => ({
  deleteProjectFromImportsFolder: () => ({ type: 'DELETE_PROJECT_FROM_IMORTS' }),
  move: () => ({ type: 'MOVE' })
}));
jest.mock('../src/js/actions/MyProjects/MyProjectsActions', () => ({ getMyProjects: () => ({ type: 'GET_MY_PROJECTS' }) }));
jest.mock('../src/js/actions/MyProjects/ProjectLoadingActions', () => ({
  clearLastProject: () => ({ type: 'CLEAR_LAST_PROJECT' }),
  displayTools: jest.fn(() => ({ type: 'DISPLAY_TOOLS' }))
    .mockImplementationOnce(() => ({ type: 'DISPLAY_TOOLS' }))
    .mockImplementationOnce(() => () => Promise.reject('Some error'))
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
        manifest: {},
        projectSaveLocation: 'project/path'
      },
      localImportReducer: {
        selectedProjectFilename:'path'
      },
      projectInformationCheckReducer: {},
      projectValidationReducer: {}
    };
  });

  it('should import a project that has whitespace in string', () => {
    const store = mockStore(initialState);
    return store.dispatch(OnlineImportWorkflowActions.onlineImport()).then(() => {
      expect(store.getActions()).toMatchSnapshot();
    });
  });

  it('on import errors should call required actions', () => {
    const store = mockStore(initialState);
    return store.dispatch(OnlineImportWorkflowActions.onlineImport()).catch((error) => {
      expect(error).toEqual('Some error');
      expect(store.getActions()).toMatchSnapshot();
    });
  });
});
