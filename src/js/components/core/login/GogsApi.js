/**
 * @description - An api for interacting with gogs.
 * @author - Ian Hoegen
 ******************************************************************/
const Gogs = require('gogs-client');
const api = new Gogs('https://git.door43.org/api/v1'), tokenStub = {name: 'translation-core'};
var CryptoJS = require("crypto-js");

function UserManager(auth) {
  return {
/**
  * @description - Login a user and get a user object with token back.
  * @param {Object} userObj - Must contain fields username and password
  * @return {Promise} - Returns a promise with a user object.
  *****************************************************************/
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
          var phrase = window.ModuleApi.getAuthToken('phrase') != undefined ? window.ModuleApi.getAuthToken('phrase') : "tc-core";
          var encryptedToken = CryptoJS.AES.encrypt(JSON.stringify(userObj), phrase);
          localStorage.setItem('user', encryptedToken);
          user.token = token.sha1;
          return user;
        });
      });
    },
/**
  * @description - Create an account for a user.
  * @param {Object} user - Must contain fields username, password, and email.
  * @return {Promise} - Returns a promise with a user object.
  *****************************************************************/
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
/**
  * @description - Create a repo for a user.
  * @param {Object} user - Must contain fields username, password, and token.
  *                        Typically obtained from logging in.
  * @param {String} reponame - The name of the repo to be created.
  * @return {Promise} - Returns a promise with a repo object.
  *****************************************************************/
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
/**
  * @description - Gets a user's repos.
  * @param {String} username - The optional user to search for.
  * @param {String} query - The optional serch term.
  * @return {Promise} - Returns a promise with an array of repo objects.
  *****************************************************************/
    retrieveRepos: function (username, query) {
           username = username === '*' ? '' : (username || '');
           query = query === '*' ? '_' : (query || '_');

           var limit = 20;

           function searchUsers (visit) {
               return api.searchUsers(username, limit).then(function (users) {
                   var arr = users.map(visit);

                   arr.push(visit(0).then(function (repos) {
                       return repos.filter(function (repo) {
                           var repoUsername = repo.full_name.split('/').shift();
                           return repoUsername.includes(username);
                       });
                   }));

                   return Promise.all(arr);
               });
           }

           function searchRepos (user) {
               var userId = (typeof user === 'object' ? user.id : user) || 0;
               return api.searchRepos(query, userId, limit);
           }

           var projectSearch = username ? searchUsers(searchRepos) : searchRepos();

           return projectSearch.then(function(data){
             var flat = [];
             for (var array in data) {
               for (var repo in data[array]) {
                 flat.push(data[array][repo])
               }
             }
             return flat;
           }).then(function (repos) {
             var repoIds = [];
             var uniqueRepos = [];
             for (repo in repos) {
               if (repos[repo] && !repoIds.includes(repos[repo].id)) {
                 repoIds.push(repos[repo].id);
                 uniqueRepos.push(repos[repo]);
               }
             }
             return uniqueRepos;
           })
           .then(function (repos) {
               return repos.map(function (repo) {
                   var user = repo.full_name.split("/")[0];
                   var project = repo.full_name.split("/")[1];
                   return {repo: repo.full_name, user: user, project: project};
               })
           });
       }

  }
}

module.exports = UserManager;
