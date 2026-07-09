import path from 'path';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
// actions
import * as ProjectSyncActions from '../ProjectSyncActions';
// Mock store set up
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('ProjectSyncActions.syncProject guards', () => {
  const storeState = {
    toolsReducer: {
      selectedTool: null,
      tools: {
        byName: {},
        byObject: [],
      },
    },
  };

  test('should alert the user if no internet connection is found', async () => {
    const expectedAction = {
      alertMessage: 'no_internet',
      loading: undefined,
      type: 'OPEN_ALERT_DIALOG',
      buttonText: null,
      callback: null,
    };
    const store = mockStore(storeState);
    const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');
    const user = {
      localUser: '',
      username: '',
      token: '',
    };

    await store.dispatch(ProjectSyncActions.syncProject(projectPath, user, false));
    const actions = store.getActions();
    expect(actions[0].meta.batch).toBeTruthy();
    expect(actions[1]).toEqual(expectedAction);
  });

  test('should alert the user if logged in as local user', async () => {
    const message = 'projects.must_be_logged_in_to_sync_alert';
    const expectedAction = {
      alertMessage: message,
      loading: undefined,
      type: 'OPEN_ALERT_DIALOG',
      buttonText: null,
      callback: null,
    };
    const store = mockStore(storeState);
    const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');
    const user = {
      localUser: true,
      username: '',
      token: '',
    };

    await store.dispatch(ProjectSyncActions.syncProject(projectPath, user));
    const actions = store.getActions();
    expect(actions[0].meta.batch).toBeTruthy();
    expect(actions[1]).toEqual(expectedAction);
  });
});
