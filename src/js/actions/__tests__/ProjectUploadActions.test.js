import path from 'path';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
// actions
import * as ProjectUploadActions from '../ProjectUploadActions';
import * as REPO from '../../helpers/Repo';
// Mock store set up
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../helpers/GogsApiHelpers', () => ({
  ...require.requireActual('../../helpers/GogsApiHelpers'),
  createRepo: jest.fn((user, projectName) => Promise.resolve({ full_name: projectName })),
}));

const mock_translate = (t, opts) => {
  if (opts) {
    return t + ': ' + JSON.stringify(opts);
  } else {
    return t;
  }
};

describe('ProjectUploadActions.gitErrorToLocalizedPrompt', () => {
  test('Invalid users session', () => {
    // given
    const error = new Error('error');
    error.status = 401;
    const expectedMessage = 'users.session_invalid';

    // when
    const results = ProjectUploadActions.gitErrorToLocalizedPrompt(error, mock_translate, `projectName`);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('IP address not found', () => {
    // given
    const error = new Error('error');
    error.code = REPO.NETWORK_ERROR_IP_ADDR_NOT_FOUND;
    const expectedMessage = 'no_internet';

    // when
    const results = ProjectUploadActions.gitErrorToLocalizedPrompt(error, mock_translate, `projectName`);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('repo archived', () => {
    // given
    const error = new Error('error: ' + REPO.GIT_ERROR_REPO_ARCHIVED);
    const expectedMessage = 'projects.archived: {"project_name":"projectName","door43":"_.door43","app_name":"_.app_name"}';

    // when
    const results = ProjectUploadActions.gitErrorToLocalizedPrompt(error, mock_translate, `projectName`);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('unable to connect', () => {
    // given
    const details = 'details';
    const error = new Error('error: ' + REPO.GIT_ERROR_UNABLE_TO_CONNECT + ': ' + details);
    const expectedMessage = `no_internet`;

    // when
    const results = ProjectUploadActions.gitErrorToLocalizedPrompt(error, mock_translate, `projectName`);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('repo changed on D43', () => {
    // given
    const details = 'details';
    const error = new Error('error: ' + REPO.GIT_ERROR_PUSH_NOT_FF + ': ' + details);
    const expectedMessage = `projects.upload_modified_error: {"project_name":"projectName","door43":"_.door43"}`;

    // when
    const results = ProjectUploadActions.gitErrorToLocalizedPrompt(error, mock_translate, `projectName`);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('unknown git problem', () => {
    // given
    const details = 'details';
    const error = new Error('error: ' + REPO.GIT_ERROR_UNKNOWN_PROBLEM + ': ' + details);
    const expectedMessage = 'unknown_networking_error: {"actions":"actions","user_feedback":"user_feedback","app_name":"_.app_name"}';

    // when
    const results = ProjectUploadActions.gitErrorToLocalizedPrompt(error, mock_translate, `projectName`);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('unknown problem', () => {
    // given
    const errStr = 'Error';
    const error = new Error(errStr);
    const expectedMessage = 'unknown_networking_error: {"actions":"actions","user_feedback":"user_feedback","app_name":"_.app_name"}';

    // when
    const results = ProjectUploadActions.gitErrorToLocalizedPrompt(error, mock_translate, `projectName`);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('has message', () => {
    // given
    const error = new Error('error');
    error.message = 'message';
    const expectedMessage = 'unknown_networking_error: {"actions":"actions","user_feedback":"user_feedback","app_name":"_.app_name"}';

    // when
    const results = ProjectUploadActions.gitErrorToLocalizedPrompt(error, mock_translate, `projectName`);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('has data', () => {
    // given
    const error = { data: 'data' };
    const expectedMessage = 'unknown_networking_error: {"actions":"actions","user_feedback":"user_feedback","app_name":"_.app_name"}';

    // when
    const results = ProjectUploadActions.gitErrorToLocalizedPrompt(error, mock_translate, `projectName`);

    // then
    expect(results).toEqual(expectedMessage);
  });

  test('unknown string', () => {
    // given
    const error = 'data';
    const expectedMessage = 'unknown_networking_error: {"actions":"actions","user_feedback":"user_feedback","app_name":"_.app_name"}';

    // when
    const results = ProjectUploadActions.gitErrorToLocalizedPrompt(error, mock_translate, `projectName`);

    // then
    expect(results).toEqual(expectedMessage);
  });
});

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
