'use strict';
const realGogs = require.requireActual('gogs-client');

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
          username: 'auser'
        });
      } else {
        return realGogs.getUser(userObject);
      }
    });
  };

  self.listTokens = function (userObject = {}) {
    return new Promise((resolve) => {
      let { username, password } = userObject;
      if (username === 'auser' && password === 'apassword') {
        resolve([{
          name: 'my-tc-app', sha1: '799a09c27bfe4b2eed65b7c9fe04f1708f01fb6d'
        },
        { name: 'TC', sha1: '2976e1ce332cf84276f94974ce73eea0d014739c' },
        {
          name: 'translation-core', sha1: '7a16e1e1c93dd1f3574dcc709487689c64a3a084'
        },
        {
          name: 'tc-web', sha1: '5e21d2cd6c41de665e72fd77c25e23779c983cec'
        }]);
      } else {
        return realGogs.listTokens(userObject);
      }
    });
  };

  self.createToken = function (tokenStub, userObject = {}) {
    return new Promise((resolve) => {
      let { username, password } = userObject;
      if (username === 'auser' && password === 'apassword' && tokenStub.name === 'translation-core') {
        resolve({ name: 'translation-core', sha1: '817fd7e100e939b93fd362879c377cf01993c712' });
      } else {
        return realGogs.createToken(tokenStub, userObject);
      }
    });
  };
}

export default API;