/* eslint-env jest */
import * as GogsApiHelpers from '../src/js/helpers/GogsApiHelpers';
jest.unmock('gogs-client');

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
  it('should simulate creating a repo for a user.', async function () {
  });
});