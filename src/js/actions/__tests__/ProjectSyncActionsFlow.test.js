import path from 'path';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
// action under test
import { syncProject } from '../ProjectSyncActions';
// mocked collaborators
import * as GitApi from '../../helpers/GitApi';
import Repo from '../../helpers/Repo.js';
import { mergeLocalIntoRemoteClone } from '../../helpers/ProjectSyncHelpers';
import { uploadProject } from '../ProjectUploadActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const REMOTE_URL = 'https://git.door43.org/owner/en_tit.git';
const SHA = '0123456789abcdef0123456789abcdef01234567';

jest.mock('../../helpers/GitApi', () => ({
  getSavedRemote: jest.fn(() => Promise.resolve({ name: 'origin', refs: { push: 'https://git.door43.org/owner/en_tit.git' } })),
  getRemoteRepoHead: jest.fn(() => Promise.resolve('0123456789abcdef0123456789abcdef01234567\tHEAD')),
  isCommitInHistory: jest.fn(() => Promise.resolve(true)),
  pushRepo: jest.fn(() => Promise.resolve()),
}));
jest.mock('../../helpers/Repo.js', () => {
  const actual = require.requireActual('../../helpers/Repo.js');
  const RepoClass = actual.default;
  RepoClass.doesRemoteRepoExist = jest.fn(() => Promise.resolve(true));
  RepoClass.openSafe = jest.fn(() => Promise.resolve({ save: jest.fn(() => Promise.resolve()) }));
  RepoClass.clone = jest.fn(() => Promise.resolve());
  return actual;
});
jest.mock('../../helpers/ProjectSyncHelpers', () => ({ mergeLocalIntoRemoteClone: jest.fn() }));
jest.mock('../../helpers/ProjectMigration', () => jest.fn(() => Promise.resolve()));
jest.mock('../../helpers/Import/OnlineImportWorkflowHelpers', () => ({ verifyThisIsTCoreOrTStudioProject: () => true }));
jest.mock('../../helpers/ProjectValidation/ProjectStructureValidationHelpers', () => ({ isProjectSupported: () => Promise.resolve(true) }));
jest.mock('../../helpers/Import/ProjectImportFilesystemHelpers', () => ({ deleteProjectFromImportsFolder: jest.fn() }));
jest.mock('fs-extra');
jest.mock('open', () => jest.fn());
jest.mock('../WordAlignmentActions', () => ({ getUsfm3ExportFile: () => () => Promise.resolve() }));
jest.mock('../ProjectUploadActions', () => ({
  uploadProject: jest.fn(() => () => Promise.resolve()),
  gitErrorToLocalizedPrompt: (e) => 'localized: ' + e,
  makeSureProjectUnlocked: jest.fn(),
  saveChangesInOldProjects: jest.fn(() => Promise.resolve()),
  showStatus: () => () => Promise.resolve(),
}));
jest.mock('../MyProjects/ProjectLoadingActions', () => ({ closeProject: () => ({ type: 'CLEAR_LAST_PROJECT' }) }));
jest.mock('../ProjectDetailsActions', () => ({ resetProjectDetail: () => ({ type: 'RESET_PROJECT_DETAIL' }) }));
jest.mock('../MyProjects/MyProjectsActions', () => ({ getMyProjects: () => ({ type: 'GET_MY_PROJECTS' }) }));
jest.mock('../../actions/OnlineModeConfirmActions', () => ({ confirmOnlineAction: (onConfirm) => () => onConfirm() }));
jest.mock('../../actions/AlertModalActions', () => ({
  openAlertDialog: jest.fn((alertMessage) => ({ type: 'OPEN_ALERT_DIALOG', alertMessage })),
  closeAlertDialog: jest.fn(() => ({ type: 'CLOSE_ALERT_DIALOG' })),
  // immediately confirm any option dialog by invoking the callback with the confirm text
  openOptionDialog: jest.fn((message, callback, confirmText) => {
    callback(confirmText);
    return { type: 'OPEN_OPTION_DIALOG' };
  }),
}));
jest.mock('../../selectors', () => ({
  getTranslate: () => (key, opts) => (opts ? key + ': ' + JSON.stringify(opts) : key),
  getUsername: () => 'tester',
}));

const user = {
  localUser: false, username: 'tester', token: 'TOKEN',
};
const projectPath = ['home', 'user', 'translationCore', 'projects', 'en_tit'].join(path.sep);

describe('ProjectSyncActions.syncProject flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    GitApi.getSavedRemote.mockResolvedValue({ name: 'origin', refs: { push: REMOTE_URL } });
    GitApi.getRemoteRepoHead.mockResolvedValue(SHA + '\tHEAD');
    Repo.doesRemoteRepoExist.mockResolvedValue(true);
  });

  it('fast path: when the remote is already an ancestor, pushes without cloning or merging', async () => {
    GitApi.isCommitInHistory.mockResolvedValue(true);
    const store = mockStore({});

    await store.dispatch(syncProject(projectPath, user, true));

    expect(GitApi.pushRepo).toHaveBeenCalledWith(projectPath, user, 'owner/en_tit');
    expect(Repo.clone).not.toHaveBeenCalled();
    expect(mergeLocalIntoRemoteClone).not.toHaveBeenCalled();
    const messages = store.getActions().filter(a => a.type === 'OPEN_ALERT_DIALOG').map(a => a.alertMessage);
    // success dialog is a React element, so just assert we did not surface an error string
    expect(messages).not.toContain('localized: undefined');
  });

  it('merge path: when the remote has new commits, clones, merges, and pushes', async () => {
    GitApi.isCommitInHistory.mockResolvedValue(false);
    const store = mockStore({});

    await store.dispatch(syncProject(projectPath, user, true));

    expect(Repo.clone).toHaveBeenCalledWith(REMOTE_URL, expect.any(String));
    expect(mergeLocalIntoRemoteClone).toHaveBeenCalled();
    expect(GitApi.pushRepo).toHaveBeenCalledWith(projectPath, user, 'owner/en_tit');
  });

  it('push race: a non-fast-forward push response surfaces the sync_conflict_retry message', async () => {
    GitApi.isCommitInHistory.mockResolvedValue(true);
    GitApi.pushRepo.mockResolvedValue('error: failed to push some refs');
    const store = mockStore({});

    await store.dispatch(syncProject(projectPath, user, true));

    const messages = store.getActions().filter(a => a.type === 'OPEN_ALERT_DIALOG').map(a => a.alertMessage);
    expect(messages.some(m => typeof m === 'string' && m.includes('projects.sync_conflict_retry'))).toBe(true);
  });

  it('no remote: prompts to upload and calls uploadProject when confirmed', async () => {
    GitApi.getSavedRemote.mockResolvedValue(null); // no origin remote
    const store = mockStore({});

    await store.dispatch(syncProject(projectPath, user, true));

    expect(uploadProject).toHaveBeenCalledWith(projectPath, user, true);
    expect(GitApi.pushRepo).not.toHaveBeenCalled();
  });
});
