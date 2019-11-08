import path from 'path';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
// actions
import * as ProjectUploadActions from '../ProjectUploadActions';
// Mock store set up
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../helpers/GogsApiHelpers', () => ({
  ...require.requireActual('../../helpers/GogsApiHelpers'),
  createRepo: jest.fn((user, projectName) => Promise.resolve({ full_name: projectName })),
}));


describe('ProjectUploadActions', () => {
  test('ProjectUploadActions.uploadProject should alert the user if no internet connection is found.', async () => {
    const expectedAction = {
      alertMessage: 'no_internet',
      loading: undefined,
      type: 'OPEN_ALERT_DIALOG',
    };
    const store = mockStore({
      toolsReducer: {
        selectedTool: null,
        tools: {
          byName: {},
          byObject: [],
        },
      },
    });
    const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');
    const user = {
      localUser:'',
      username: '',
      token: '',
    };

    await store.dispatch(ProjectUploadActions.uploadProject(projectPath, user, false));
    const actions = store.getActions();
    expect(actions[0].meta.batch).toBeTruthy();
    expect(actions[1]).toEqual(expectedAction);
  });

  test('ProjectUploadActions.uploadProject should alert the user if logged in as local user.', async () => {
    const message = 'projects.must_be_logged_in_alert';
    const expectedAction = {
      alertMessage: message,
      loading: undefined,
      type: 'OPEN_ALERT_DIALOG',
    };
    const store = mockStore({
      toolsReducer: {
        selectedTool: null,
        tools: {
          byName: {},
          byObject: [],
        },
      },
    });
    const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');
    const user = {
      localUser: true,
      username: '',
      token: '',
    };

    await store.dispatch(ProjectUploadActions.uploadProject(projectPath, user));
    const actions = store.getActions();
    expect(actions[0].meta.batch).toBeTruthy();
    expect(actions[1]).toEqual(expectedAction);
  });
});
