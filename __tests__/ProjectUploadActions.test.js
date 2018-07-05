jest.mock('simple-git');
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path';
// actions
import * as ProjectUploadActions from '../src/js/actions/ProjectUploadActions';
// Mock store set up
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('../src/js/helpers/GogsApiHelpers', () => ({
  createRepo: jest.fn((user, projectName) => {
    return Promise.resolve({ full_name: projectName });
  })
}));


describe('ProjectUploadActions', () => {
  test('ProjectUploadActions.uploadProject should alert the user if no internet connection is found.', async () => {
    const expectedActions = [
      {
       alertMessage: "no_internet",
       loading: undefined,
       type: "OPEN_ALERT_DIALOG"
      }
    ];
    const store = mockStore({});
    const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');
    const user = {
      localUser:'',
      username: '',
      token: ''
    };

    await store.dispatch(ProjectUploadActions.uploadProject(projectPath, user, false));
    expect(store.getActions()).toEqual(expectedActions);
  });


  test('ProjectUploadActions.uploadProject should alert the user if logged in as local user.', async () => {
    const message = "projects.must_be_logged_in_alert";
    const expectedActions = [
      {
       alertMessage: message,
       loading: undefined,
       type: "OPEN_ALERT_DIALOG"
      }
    ];
    const store = mockStore({});
    const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');
    const user = {
      localUser: true,
      username: '',
      token: ''
    };

    await store.dispatch(ProjectUploadActions.uploadProject(projectPath, user));
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('ProjectUploadActions.uploadProject should display uploading project alert when there is intenet connection.', async () => {
    const user = {
      localUser: false,
      username: 'fakeUser',
      token: 'token_test'
    };
    const expectedActions = [
      { "alertMessage": "projects.uploading_alert", "loading": true, "type": "OPEN_ALERT_DIALOG" },
        expect.objectContaining({
          "loading": undefined,
           "type": "OPEN_ALERT_DIALOG",
           alertMessage: expect.any(Object)
        })
      ];
    const store = mockStore({
      settingsReducer: {
        onlineMode: true
      }
    });
    const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');

    await store.dispatch(ProjectUploadActions.uploadProject(projectPath, user, true));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
