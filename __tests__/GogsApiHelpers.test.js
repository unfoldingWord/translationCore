/* eslint-env jest */
import * as GogsApiHelpers from '../src/js/helpers/GogsApiHelpers';
jest.mock('gogs-client');

describe('GogsApiHelpers.login', () => {
  it('should login a user and get a user object with token back.', async function () {
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
  it('should simulate creating a new repo for a user.', async function () {
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

  it('should simulate not creating an existing repo for a user.', async function () {
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