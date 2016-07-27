Gogs = require('gogs-client');
var api = new Gogs('https://git.door43.org/api/v1'), tokenStub = {name: 'translation-core'};
function UserManager(auth) {
  return {
    login: function (userObj) {
      return api.getUser(userObj).then(function (user) {
        return api.listTokens(userObj)
        .then(function (tokens) {
          return tokens.find((el) => el.name == tokenStub.name);
        })
        .then(function (token) {
          return token ? token : api.createToken(tokenStub, userObj);
        })
        .then(function (token) {
          user.token = token.sha1;
          return user;
        });
      });
    },

    createAccount: function (user) {
      return api.createUser(user, auth, true)
      .then(function(updatedUser) {
        return api.createToken(tokenStub, user)
        .then(function(token) {
          updatedUser.token = token.sha1;
          return updatedUser;
        });
      });
    },

    createRepo: function (user, reponame) {
      return api.listRepos(user).then(function (repos) {
        return repos.find((el) => el.full_name == user.username + '/' + reponame);
      }).then(function (repo) {
        return repo ? repo : api.createRepo({
          name: reponame,
          description: 'tc-desktop: ' + reponame,
          private: false
        }, user);
      });
    }
  }
}

module.exports = UserManager;
