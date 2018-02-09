jest.mock('simple-git');
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path';
// actions
import * as ProjectUploadActions from '../src/js/actions/ProjectUploadActions';
// Mock store set up
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('ProjectUploadActions', () => {
  test('ProjectUploadActions.uploadProject should alert the user if no internet connection is found.', () => {
    const expectedActions = [
      {
       alertMessage: "home.project.save.internet_disconnected",
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

    store.dispatch(ProjectUploadActions.uploadProject(projectPath, user, false));
    expect(store.getActions()).toEqual(expectedActions);
  });


  test('ProjectUploadActions.uploadProject should alert the user if logged in as local user.', () => {
    const message = "home.project.save.login_required";
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

    store.dispatch(ProjectUploadActions.uploadProject(projectPath, user));
    expect(store.getActions()).toEqual(expectedActions);
  });

  test('ProjectUploadActions.uploadProject should display uploading project alert when there is intenet connection.', () => {
    const expectedActions = [
      {
        alertMessage: "home.project.save.uploading_to_door43",
        loading: true,
        type: "OPEN_ALERT_DIALOG"
      }
    ];
    const store = mockStore({
      settingsReducer: {
        onlineMode: true
      }
    });
    const projectPath = path.join('path', 'to', 'project', 'PROJECT_NAME');
    const user = {
      localUser: false,
      username: '',
      token: 'token_test'
    };

    store.dispatch(ProjectUploadActions.uploadProject(projectPath, user, true));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
