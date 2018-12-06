import fs from 'fs-extra';
import ospath from 'ospath';
import types from '../src/js/actions/ActionTypes';
import path from 'path-extra';
import * as actions from '../src/js/actions/ProjectDataLoadingActions';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const PROJECTS_PATH = path.join('user', 'translationCore', 'projects');
const RESOURCE_PATH = path.join(ospath.home(), 'translationCore', 'resources');
jest.mock('../src/js/actions/ContextIdActions', () => ({
  loadCurrentContextId: () => ({type: 'LOAD_CURRENT_CONTEXT_ID'})
}));
jest.mock('../src/js/actions/GroupsDataActions', () => ({
  verifyGroupDataMatchesWithFs: () => ({type: 'VERIFY_GROUP_DATA'})
}));

describe('', () => {
  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, 'fixtures/project');
    const destinationPath = PROJECTS_PATH;
    const copyFiles = ['translationWords'];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, destinationPath);

    const sourceResourcesPath = path.join('__tests__', 'fixtures', 'resources');
    const resourcesPath = RESOURCE_PATH;
    const copyResourceFiles = ['grc', 'en'];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);
  });
  it('', () => {
    const projectPath = path.join(PROJECTS_PATH, 'normal_project');
    const store = mockStore({
      projectDetailsReducer: {
        projectSaveLocation: projectPath,
        manifest: {
          project: {
            id: 'tit'
          }
        },
        selectedCategories: ['kt'],
        currentProjectToolsSelectedGL: {
          'translationWords': 'en'
        }
      }
    });
    const expectedActions = [
      {type: 'LOAD_GROUPS_INDEX', groupsIndex: expect.any(Array)},
      {type: 'LOAD_GROUPS_DATA_FROM_FS', allGroupsData: expect.any(Object)},
      {type: 'VERIFY_GROUP_DATA'},
      {type: 'LOAD_CURRENT_CONTEXT_ID'},
      {type: 'TOGGLE_LOADER_MODAL', show: false},
      {type: 'TOGGLE_HOME_VIEW', boolean: false}
    ];
    store.dispatch(actions.loadProjectData('translationWords')).then(() => {
      const receivedActions = store.getActions();
      expect(receivedActions).toEqual(expectedActions);
    });
  });
});