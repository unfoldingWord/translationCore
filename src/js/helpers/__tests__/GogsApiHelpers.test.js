/* eslint-env jest */
/* eslint-disable no-throw-literal */
import fs from 'fs-extra';
import path from 'path-extra';
import * as GogsApiHelpers from '../GogsApiHelpers';
import { DCS_BASE_URL } from '../../common/constants';

const project_path = path.join(__dirname,
  '../../../__tests__/fixtures/project/en_tit');
jest.mock('gogs-client');
jest.mock('../Repo');

describe('GogsApiHelpers.login', () => {
  it('should login a user and get a user object with token back.', function () {
    const userObject = {
      password: 'apassword',
      username: 'auser',
    };

    return expect(GogsApiHelpers.login(userObject)).resolves.toEqual({
      id: 4232,
      login: 'auser',
      full_name: 'John Smith',
      email: 'auser@noreply.door43.org',
      avatar_url: DCS_BASE_URL + '/img/avatar_default.png',
      username: 'auser',
      token: '7a16e1e1c93dd1f3574dcc709487689c64a3a084',
    });
  });
});

describe('GogsApiHelpers.createRepo', () => {
  it('should simulate creating a new repo for a user.', async function () {
    const userObject = {
      password: 'apassword',
      username: 'auser',
    };
    const reponame = 'fr_eph_text_ulb';
    const repo = await GogsApiHelpers.createRepo(userObject, reponame);

    return expect(repo).toEqual(expect.objectContaining({
      name: reponame,
      full_name: `${userObject.username}/${reponame}`,
      description: 'tc-desktop: ' + reponame,
      private: false,
      empty: true,
    }));
  });

  it('should simulate not creating an existing repo for a user.',
    async function () {
      const userObject = {
        password: 'apassword',
        username: 'auser',
      };
      const reponame = 'areponame';
      const repo = await GogsApiHelpers.createRepo(userObject, reponame);

      expect(repo).toEqual(expect.objectContaining({
        name: reponame,
        full_name: `${userObject.username}/${reponame}`,
        description: 'tc-desktop: ' + reponame,
        private: false,
        empty: false,
      }));
    });
});

describe('GogsApiHelpers.renameRepo', () => {
  const newRepoName = 'new-repo-name';
  const user = {
    username: 'auser',
    password: 'apassword',
    token: '12345678910',
  };

  it('should not fail in renaming repo with a valid name', function () {
    jest.setTimeout(30000);
    expect.assertions(1);
    return expect(GogsApiHelpers.renameRepo(newRepoName, project_path, user))
      .resolves
      .toEqual();
  });
});

describe('GogsApiHelpers.createNewRepo', () => {
  const newRepoName = 'new-repo-name';
  const user = {
    username: 'auser',
    password: 'apassword',
    token: '12345678910',
  };

  it('should not fail in creating repo with a valid name', async () => {
    jest.setTimeout(30000);
    const results = await GogsApiHelpers.createNewRepo(newRepoName,
      project_path, user);
    expect(results).toEqual();
  });
});

describe('GogsApiHelpers.findRepo', () => {
  const user = {
    username: 'auser',
    password: 'apassword',
    token: '12345678910',
  };

  it('should succeed if repo present', async () => {
    const newRepoName = 'areponame';
    const results = await GogsApiHelpers.findRepo(user, newRepoName);
    expect(results.name).toEqual(newRepoName);
  });

  it('should not crash if repo not present', async () => {
    const newRepoName = 'new-repo-name';
    const results = await GogsApiHelpers.findRepo(user, newRepoName);
    expect(results).toEqual();
  });
});

describe('GogsApiHelpers.changeGitToPointToNewRepo', () => {
  const Repo = require('../Repo');
  const user = {
    username: 'auser',
    password: 'apassword',
    token: '12345678910',
  };

  it('should succeed with old origin', async () => {
    const projectSaveLocation = 'path/to/project/PROJECT_NAME';

    Repo.mockGetRemote.mockImplementation(name => {
      if (name === GogsApiHelpers.TC_OLD_ORIGIN_KEY) {
        return {
          owner: 'dummy_user',
          name: 'old_repo',
          full_name: 'dummy_user/old_repo',
          url: 'http://dummy.com/dummy_user/old_repo.git',
        };
      } else {
        return null;
      }
    });
    Repo.mockParseRemoteUrl.mockReturnValueOnce({
      owner: 'dummy_user',
      name: 'old_repo',
    });

    const expectSuccess = true;
    const results = await GogsApiHelpers.changeGitToPointToNewRepo(
      projectSaveLocation, user);
    expect(results).toEqual(expectSuccess);
  });

  it('should succeed without old origin', async () => {
    const projectSaveLocation = 'path/to/project/PROJECT_NAME';

    Repo.mockGetRemote.mockImplementation(name => {
      if (name === GogsApiHelpers.TC_OLD_ORIGIN_KEY) {
        return {
          owner: 'dummy_user',
          name: 'current_repo',
          full_name: 'dummy_user/current_repo',
          url: 'http://dummy.com/dummy_user/current_repo.git',
        };
      } else {
        return null;
      }
    });
    Repo.mockParseRemoteUrl.mockReturnValueOnce({
      owner: 'dummy_user',
      name: 'current_repo',
    });

    const expectSuccess = true;
    const results = await GogsApiHelpers.changeGitToPointToNewRepo(
      projectSaveLocation, user);
    expect(results).toEqual(expectSuccess);
  });

  it('should succeed without old or current origin', async () => {
    const projectSaveLocation = 'path/to/project/PROJECT_NAME';
    const expectSuccess = true;
    const results = await GogsApiHelpers.changeGitToPointToNewRepo(
      projectSaveLocation, user);
    expect(results).toEqual(expectSuccess);
  });

  it('should pass up the error if git error', async () => {
    const projectSaveLocation = 'path/to/project/PROJECT_NAME';

    Repo.mockGetRemote.mockImplementation(() => {
      throw 'Git error';
    });
    await expect(GogsApiHelpers.changeGitToPointToNewRepo(
      projectSaveLocation, user)).rejects.toEqual(new Error('Git error'));
  });
});

describe('GogsApiHelpers.getProjectInfo', () => {
  const Repo = require('../Repo');
  const user = {
    username: 'auser',
    password: 'apassword',
    token: '12345678910',
  };

  beforeEach(() => {
    Repo.mockGetRemote.mockReset();
    Repo.mockParseRemoteUrl.mockReset();
  });

  it('should succeed with old origin', async () => {
    const projectSaveLocation = 'path/to/project/PROJECT_NAME';
    const expectedResults = {
      'new_repo_name': 'PROJECT_NAME',
      'old_repo_name': 'old_repo',
      'user_name': 'dummy_user',
    };

    Repo.mockGetRemote.mockImplementation(name => {
      if (name === GogsApiHelpers.TC_OLD_ORIGIN_KEY) {
        return {
          owner: 'dummy_user',
          name: 'old_repo',
          full_name: 'dummy_user/old_repo',
          url: 'http://dummy.com/dummy_user/old_repo.git',
        };
      } else {
        return null;
      }
    });
    Repo.mockParseRemoteUrl.mockReturnValueOnce({
      owner: 'dummy_user',
      name: 'old_repo',
    });

    const results = await GogsApiHelpers.getProjectInfo(projectSaveLocation,
      user);
    expect(results).toEqual(expectedResults);
  });

  it('should succeed without old origin', async () => {
    const projectSaveLocation = 'path/to/project/PROJECT_NAME';

    Repo.mockGetRemote.mockImplementation(name => {
      if (name === 'origin') {
        return {
          owner: 'dummy_user',
          name: 'current_repo',
          full_name: 'dummy_user/current_repo',
          url: 'http://dummy.com/dummy_user/current_repo.git',
        };
      } else {
        return null;
      }
    });
    Repo.mockParseRemoteUrl.mockReturnValueOnce({
      owner: 'dummy_user',
      name: 'current_repo',
    });

    const expectedResults = {
      'new_repo_name': 'PROJECT_NAME',
      'old_repo_name': 'current_repo',
      'user_name': 'dummy_user',
    };
    const results = await GogsApiHelpers.getProjectInfo(projectSaveLocation,
      user);
    expect(results).toEqual(expectedResults);
  });

  it('should succeed without old or current origin', async () => {
    const projectSaveLocation = 'path/to/project/PROJECT_NAME';
    const expectedResults = {
      'new_repo_name': 'PROJECT_NAME',
      'old_repo_name': '(unknown)',
      'user_name': 'auser',
    };
    const results = await GogsApiHelpers.getProjectInfo(projectSaveLocation,
      user);
    expect(results).toEqual(expectedResults);
  });
});

describe('GogsApiHelpers.hasGitHistoryForCurrentUser', () => {
  const login =
    {
      loggedInUser: true,
      userdata: {
        username: 'auser',
        password: 'apassword',
        token: '12345678910',
      },
    };
  const Repo = require('../Repo');


  beforeEach(() => {
    fs.__resetMockFS();
    Repo.mockGetRemote.mockReset();
    Repo.mockParseRemoteUrl.mockReset();
  });

  it('should return true if same user in git remote', async () => {
    const projectSaveLocation = 'path/to/project/PROJECT_NAME';
    fs.ensureDirSync(path.join(projectSaveLocation, '.git'));
    Repo.mockParseRemoteUrl.mockReturnValue({
      owner: 'auser',
      name: 'current_repo',
    });
    Repo.mockGetRemote.mockReturnValue(null);
    const expectedResults = true;
    const results = await GogsApiHelpers.hasGitHistoryForCurrentUser(
      projectSaveLocation, login);
    expect(results).toEqual(expectedResults);
  });

  it('should return false if same user but not logged in', async () => {
    const mockLogin = JSON.parse(JSON.stringify(login));
    mockLogin.loggedInUser = false;
    const projectSaveLocation = 'path/to/project/PROJECT_NAME';
    fs.ensureDirSync(path.join(projectSaveLocation, '.git'));
    Repo.mockParseRemoteUrl.mockReturnValue({
      owner: 'auser',
      name: 'current_repo',
    });

    const expectedResults = false;
    const results = await GogsApiHelpers.hasGitHistoryForCurrentUser(
      projectSaveLocation, mockLogin);
    expect(results).toEqual(expectedResults);
  });

  it('should return false if different user in git remote', async () => {
    const projectSaveLocation = 'path/to/project/PROJECT_NAME';
    fs.ensureDirSync(path.join(projectSaveLocation, '.git'));
    Repo.mockParseRemoteUrl.mockReturnValue({
      owner: 'dummy_user',
      name: 'current_repo',
    });

    const expectedResults = false;
    const results = await GogsApiHelpers.hasGitHistoryForCurrentUser(
      projectSaveLocation, login);
    expect(results).toEqual(expectedResults);
  });

  it('should return false if no git repo', async () => {
    const projectSaveLocation = 'path/to/project/PROJECT_NAME';
    const expectedResults = false;
    const results = await GogsApiHelpers.hasGitHistoryForCurrentUser(
      projectSaveLocation, login);
    expect(results).toEqual(expectedResults);
  });
});
