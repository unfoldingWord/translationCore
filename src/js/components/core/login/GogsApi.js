const Gogs = require('gogs-client');
const _ = require('lodash')
const api = new Gogs('https://git.door43.org/api/v1'), tokenStub = {name: 'translation-core'};
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
    },

    retrieveRepos: function (u, q) {
           u = u === '*' ? '' : (u || '');
           q = q === '*' ? '_' : (q || '_');

           function searchUsers (visit) {
               return api.searchUsers(u).then(function (users) {
                   var a = users.map(visit);

                   a.push(visit(0).then(function (repos) {
                       return repos.filter(function (repo) {
                           var username = repo.full_name.split('/').shift();
                           return username.includes(u);
                       });
                   }));

                   return Promise.all(a);
               });
           }

           function searchRepos (user) {
               var uid = (typeof user === 'object' ? user.id : user) || 0;
               return api.searchRepos(q, uid);
           }

           var p = u ? searchUsers(searchRepos) : searchRepos();

           return p.then(_.flatten).then(function (repos) {
               return _.uniq(repos, 'id');
           })
           .then(function (repos) {
               return _.map(repos, function (repo) {
                   var user = repo.full_name.split("/")[0];
                   var project = repo.full_name.split("/")[1];
                   return {repo: repo.full_name, user: user, project: project};
               })
           });
       }
  }
}

module.exports = UserManager;
