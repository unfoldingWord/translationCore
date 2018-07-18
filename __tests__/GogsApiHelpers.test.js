/* eslint-env jest */
import * as GogsApiHelpers from '../src/js/helpers/GogsApiHelpers';
import fs from 'fs-extra';
import path from "path-extra";

const project_path = '__tests__/fixtures/project/en_tit';
jest.mock('gogs-client');
let mock_getSavedRemotes = null;
let mock_saveRemotes = null;
jest.mock('../src/js/helpers/GitApi', () => ({
  ...require.requireActual('../src/js/helpers/GitApi'),
  getRepoNameInfo: (projectPath) => {
    const dirSplit = projectPath.split('/');
    const name = dirSplit[dirSplit.length - 1];
    return Promise.resolve({
      url:`https://github.com/im-a-fake-user-tc/${name}.git`,
      name
    });
  },
  renameRepoLocally: () => {
    return Promise.resolve();
  },
  pushNewRepo: () => {
    return Promise.resolve();
  },
  getSavedRemote: (projectPath, name) => {
    if (!mock_getSavedRemotes) {
      return Promise.reject();
    }
    const remote = mock_getSavedRemotes[name];
    if (!remote) {
      return Promise.reject();
    }
    return Promise.resolve(remote);
  },
  saveRemote: (projectPath, remoteName, url) => {
    if (!mock_saveRemotes) {
      throw new Error("save remote failed");
    }
  }
}));

describe('GogsApiHelpers.login', () => {
  it('should login a user and get a user object with token back.', async function() {
    const userObject = {
      password: "apassword",
      username: "auser"
    };
    const loggedInUser = await GogsApiHelpers.login(userObject);
    expect(loggedInUser).toEqual({
      id: 4232,
      login: 'auser',
      full_name: 'John Smith',
      email: 'auser@noreply.door43.org',
      avatar_url: 'https://git.door43.org/img/avatar_default.png',
      username: 'auser',
      token: '7a16e1e1c93dd1f3574dcc709487689c64a3a084'
    });
  });
});

describe('GogsApiHelpers.createRepo', () => {
  it('should simulate creating a new repo for a user.', async function() {
    const userObject = {
      password: "apassword",
      username: "auser"
    };
    const reponame = 'fr_eph_text_ulb';
    const repo = await GogsApiHelpers.createRepo(userObject, reponame);
    expect(repo).toEqual(expect.objectContaining({
      name: reponame,
      full_name: `${userObject.username}/${reponame}`,
      description: 'tc-desktop: ' + reponame,
      private: false,
      empty: true
    }));
  });

  it('should simulate not creating an existing repo for a user.', async function() {
    const userObject = {
      password: "apassword",
      username: "auser"
    };
    const reponame = 'areponame';
    const repo = await GogsApiHelpers.createRepo(userObject, reponame);
    expect(repo).toEqual(expect.objectContaining({
      name: reponame,
      full_name: `${userObject.username}/${reponame}`,
      description: 'tc-desktop: ' + reponame,
      private: false,
      empty: false
    }));
  });
});


describe('GogsApiHelpers.renameRepo', () => {
  const newRepoName = 'new-repo-name';
  const user = {
    username: 'auser',
    password: 'apassword',
    token: '12345678910'
  };
  it('should not fail in renaming repo with a valid name', function() {
    expect.assertions(1);
    return expect(GogsApiHelpers.renameRepo(newRepoName, project_path, user))
    .resolves.toEqual();
  });
});

describe('GogsApiHelpers.createNewRepo', () => {
  const newRepoName = 'new-repo-name';
  const user = {
    username: 'auser',
    password: 'apassword',
    token: '12345678910'
  };
  it('should not fail in creating repo with a valid name', async () => {
    const results = await GogsApiHelpers.createNewRepo(newRepoName, project_path, user);
    expect(results).toEqual();
  });
});

describe('GogsApiHelpers.findRepo', () => {
  const user = {
    username: 'auser',
    password: 'apassword',
    token: '12345678910'
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
  const user = {
    username: 'auser',
    password: 'apassword',
    token: '12345678910'
  };
  it('should succeed with old origin', async () => {
    const projectSaveLocation = "path/to/project/PROJECT_NAME";
    mock_getSavedRemotes = {
      tc_oldOrigin: {
        refs: {
          push: 'http://dummy.com/dummy_user/old_repo.git'
        }
      },
      origin: {
        refs: {
          push: 'http://dummy.com/dummy_user/current_repo.git'
        }
      }
    };
    mock_saveRemotes = true;
    const expectSuccess = true;
    const results = await GogsApiHelpers.changeGitToPointToNewRepo(projectSaveLocation, user);
    expect(results).toEqual(expectSuccess);
  });
  it('should succeed without old origin', async () => {
    const projectSaveLocation = "path/to/project/PROJECT_NAME";
    mock_getSavedRemotes = {
      tc_oldOrigin: null,
      origin: {
        refs: {
          push: 'http://dummy.com/dummy_user/current_repo.git'
        }
      }
    };
    mock_saveRemotes = true;
    const expectSuccess = true;
    const results = await GogsApiHelpers.changeGitToPointToNewRepo(projectSaveLocation, user);
    expect(results).toEqual(expectSuccess);
  });
  it('should succeed without old or current origin', async () => {
    const projectSaveLocation = "path/to/project/PROJECT_NAME";
    mock_getSavedRemotes = {
      tc_oldOrigin: null,
      origin: null
    };
    mock_saveRemotes = true;
    const expectSuccess = true;
    const results = await GogsApiHelpers.changeGitToPointToNewRepo(projectSaveLocation, user);
    expect(results).toEqual(expectSuccess);
  });
  it('should fail gracefully if git error', async () => {
    const projectSaveLocation = "path/to/project/PROJECT_NAME";
    mock_getSavedRemotes = null;
    mock_saveRemotes = null;
    const expectSuccess = true;
    const results = await GogsApiHelpers.changeGitToPointToNewRepo(projectSaveLocation, user);
    expect(results).toEqual(expectSuccess);
  });
});

describe('GogsApiHelpers.getProjectInfo', () => {
  const user = {
    username: 'auser',
    password: 'apassword',
    token: '12345678910'
  };
  it('should succeed with old origin', async () => {
    const projectSaveLocation = "path/to/project/PROJECT_NAME";
    mock_getSavedRemotes = {
      tc_oldOrigin: {
        refs: {
          push: 'http://dummy.com/dummy_user/old_repo.git'
        }
      },
      origin: {
        refs: {
          push: 'http://dummy.com/dummy_user/current_repo.git'
        }
      }
    };
    mock_saveRemotes = true;
    const expectedResults = {
      "new_repo_name": "PROJECT_NAME",
      "old_repo_name": "old_repo",
      "user_name": "dummy_user"
    };
    const results = await GogsApiHelpers.getProjectInfo(projectSaveLocation, user);
    expect(results).toEqual(expectedResults);
  });
  it('should succeed without old origin', async () => {
    const projectSaveLocation = "path/to/project/PROJECT_NAME";
    mock_getSavedRemotes = {
      tc_oldOrigin: null,
      origin: {
        refs: {
          push: 'http://dummy.com/dummy_user/current_repo.git'
        }
      }
    };
    mock_saveRemotes = true;
    const expectedResults = {
      "new_repo_name": "PROJECT_NAME",
      "old_repo_name": "current_repo",
      "user_name": "dummy_user"
    };
    const results = await GogsApiHelpers.getProjectInfo(projectSaveLocation, user);
    expect(results).toEqual(expectedResults);
  });
  it('should succeed without old or current origin', async () => {
    const projectSaveLocation = "path/to/project/PROJECT_NAME";
    mock_getSavedRemotes = {
      tc_oldOrigin: null,
      origin: null
    };
    mock_saveRemotes = true;
    const expectedResults = {
      "new_repo_name": "PROJECT_NAME",
      "old_repo_name": "(unknown)",
      "user_name": "auser"
    };
    const results = await GogsApiHelpers.getProjectInfo(projectSaveLocation, user);
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
        token: '12345678910'
      }
    };
  beforeEach(() => {
    fs.__resetMockFS();
  });
  it('should return true if same user in git remote', async () => {
    const projectSaveLocation = "path/to/project/PROJECT_NAME";
    fs.ensureDirSync(path.join(projectSaveLocation,".git"));
    mock_getSavedRemotes = {
      origin: {
        refs: {
          push: 'http://dummy.com/auser/current_repo.git'
        }
      }
    };
    const expectedResults = true;
    const results = await GogsApiHelpers.hasGitHistoryForCurrentUser(projectSaveLocation, login);
    expect(results).toEqual(expectedResults);
  });
  it('should return false if same user but not logged in', async () => {
    const mockLogin = JSON.parse(JSON.stringify(login));
    mockLogin.loggedInUser = false;
    const projectSaveLocation = "path/to/project/PROJECT_NAME";
    fs.ensureDirSync(path.join(projectSaveLocation,".git"));
    mock_getSavedRemotes = {
      origin: {
        refs: {
          push: 'http://dummy.com/auser/current_repo.git'
        }
      }
    };
    const expectedResults = false;
    const results = await GogsApiHelpers.hasGitHistoryForCurrentUser(projectSaveLocation, mockLogin);
    expect(results).toEqual(expectedResults);
  });
  it('should return false if different user in git remote', async () => {
    const projectSaveLocation = "path/to/project/PROJECT_NAME";
    fs.ensureDirSync(path.join(projectSaveLocation,".git"));
    mock_getSavedRemotes = {
      origin: {
        refs: {
          push: 'http://dummy.com/dummy_user/current_repo.git'
        }
      }
    };
    const expectedResults = false;
    const results = await GogsApiHelpers.hasGitHistoryForCurrentUser(projectSaveLocation, login);
    expect(results).toEqual(expectedResults);
  });
  it('should return false if no git repo', async () => {
    const projectSaveLocation = "path/to/project/PROJECT_NAME";
    mock_getSavedRemotes = {
      origin: {
        refs: {
          push: 'http://dummy.com/dummy_user/current_repo.git'
        }
      }
    };
    const expectedResults = false;
    const results = await GogsApiHelpers.hasGitHistoryForCurrentUser(projectSaveLocation, login);
    expect(results).toEqual(expectedResults);
  });
});
