/* eslint-env jest */
import * as GogsApiHelpers from '../src/js/helpers/GogsApiHelpers';
const project_path = '__tests__/fixtures/project/en_tit';
jest.mock('gogs-client');
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
  it('should not fail in renaming repo with ', function() {
    expect.assertions(1);
    return expect(GogsApiHelpers.renameRepo(newRepoName, project_path, user))
    .resolves.toEqual();
  });
});