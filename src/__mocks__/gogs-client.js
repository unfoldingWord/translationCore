/* eslint-disable no-useless-concat */
const realGogs = require.requireActual('gogs-client');
const realGogsAPI = new realGogs('https://git.door43.org/api/v1');

function API(apiUrl) {
  const self = this;
  self.apiUrl = apiUrl;
  self.getUser = function (userObject = {}) {
    return new Promise((resolve) => {
      let { username, password } = userObject;

      if (username === 'auser' && password === 'apassword') {
        resolve({
          id: 4232,
          login: 'auser',
          full_name: 'John Smith',
          email: 'auser@noreply.door43.org',
          avatar_url: 'https://git.door43.org/img/avatar_default.png',
          username: 'auser',
        });
      } else {
        return realGogsAPI.getUser(userObject);
      }
    });
  };

  self.listTokens = function (userObject = {}) {
    return new Promise((resolve) => {
      let { username, password } = userObject;

      if (username === 'auser' && password === 'apassword') {
        resolve([{ name: 'my-tc-app', sha1: '799a09c27bfe4b2eed65b7c9fe04f1708f01fb6d' },
          { name: 'TC', sha1: '2976e1ce332cf84276f94974ce73eea0d014739c' },
          { name: 'translation-core', sha1: '7a16e1e1c93dd1f3574dcc709487689c64a3a084' },
          { name: 'tc-web', sha1: '5e21d2cd6c41de665e72fd77c25e23779c983cec' }]);
      } else {
        return realGogsAPI.listTokens(userObject);
      }
    });
  };

  self.createToken = function (tokenStub, userObject = {}) {
    return new Promise((resolve) => {
      let { username, password } = userObject;

      if (username === 'auser' && password === 'apassword' && tokenStub.name === 'translation-core') {
        resolve({ name: 'translation-core', sha1: '817fd7e100e939b93fd362879c377cf01993c712' });
      } else {
        return realGogsAPI.createToken(tokenStub, userObject);
      }
    });
  };
  self.listRepos = function (userObject) {
    return new Promise((resolve) => {
      let { username, password } = userObject;

      if (username === 'auser' && password === 'apassword') {
        let repos = Array(30).fill().map(() => ({ 'full_name': 'random/repo/name' }));

        repos[10] = {
          full_name: username + '/areponame',
          name: 'areponame',
          description: 'tc-desktop: ' + 'areponame',
          private: false,
          empty: false,
        };
        resolve(repos);
      } else {
        return realGogsAPI.listRepos(userObject);
      }
    });
  };

  self.createRepo = function (repoObject, userObject) {
    return new Promise((resolve) => {
      const { username, password } = userObject;
      const { description, name } = repoObject;

      if (username === 'auser' && password === 'apassword') {
        resolve({
          owner:
            {
              id: 4232,
              login: 'auser',
              full_name: 'John Smith',
              email: 'auser@noreply.door43.org',
              avatar_url: 'https://git.door43.org/img/avatar_default.png',
              username: 'auser',
            },
          name,
          full_name: 'auser/fr_eph_text_ulb',
          description,
          empty: true,
          private: repoObject.private,
          fork: false,
          parent: null,
          mirror: false,
          size: 866,
          html_url: 'https://git.door43.org/auser/fr_eph_text_ulb',
          ssh_url: 'git@git.door43.org:auser/fr_eph_text_ulb.git',
          clone_url: 'https://git.door43.org/auser/fr_eph_text_ulb.git',
          website: '',
          stars_count: 0,
          forks_count: 0,
          watchers_count: 1,
          open_issues_count: 0,
          default_branch: 'master',
          created_at: '2017-12-13T16:33:15Z',
          updated_at: '2017-12-13T16:33:18Z',
          permissions: {
            admin: true, push: true, pull: true,
          },
        });
      } else {
        return realGogsAPI.createRepo(repoObject, userObject);
      }
    });
  };

  self.deleteRepo = function () {
    return Promise.resolve();
  };
}

export default API;
