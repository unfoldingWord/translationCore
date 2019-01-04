import fs from 'fs-extra';
import ospath from 'ospath';
import path from 'path-extra';
import * as actions from '../ToolActions';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const PROJECTS_PATH = path.join('user', 'translationCore', 'projects');
const RESOURCE_PATH = path.join(ospath.home(), 'translationCore', 'resources');
jest.mock('../ContextIdActions', () => ({
  loadCurrentContextId: () => ({type: 'LOAD_CURRENT_CONTEXT_ID'})
}));
jest.mock('../GroupsDataActions', () => ({
  verifyGroupDataMatchesWithFs: () => ({type: 'VERIFY_GROUP_DATA'})
}));

describe('', () => {
  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, '../../../../__tests__/fixtures/project');
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
        currentProjectToolsSelectedGL: {
          'translationWords': 'en'
        },
        toolsCategories: {
          translationWords: ['kt']
        }
      }
    });
    const expectedActions = [
      {type: 'LOAD_GROUPS_INDEX', groupsIndex: expect.any(Array)},
      {
        type: 'LOAD_GROUPS_DATA_FROM_FS',
        allGroupsData: {
          apostle: expect.any(Array),
          authority: expect.any(Array),
          clean: expect.any(Array)
        }
      },
      {type: 'VERIFY_GROUP_DATA'}
    ];
    store.dispatch(actions.initializeProjectGroups('translationWords')).then(() => {
      const receivedActions = store.getActions();
      expect(receivedActions).toEqual(expectedActions);
    });
  });
});
