/**
 * @description - An api for interacting with gogs.
 * @author - Ian Hoegen
 ******************************************************************/
const Gogs = require('gogs-client');
const api = new Gogs('https://git.door43.org/api/v1'), tokenStub = {name: 'translation-core'};
var CryptoJS = require("crypto-js");
var axios = require('axios');

function UserManager(auth) {
  return {
/**
  * @description - Login a user and get a user object with token back.
  * @param {Object} userObj - Must contain fields username and password
  * @return {Promise} - Returns a promise with a user object.
  *****************************************************************/
    login: function (userObj) {
      return api.getUser(userObj).then(user => {
        return api.listTokens(userObj)

        .then(function (tokens) {
          return tokens.find((el) => el.name == tokenStub.name);
        })

        .then(function (token) {
          return token ? token : api.createToken(tokenStub, userObj);
        })

        .then(function (token) {
          user.token = token.sha1;
          var phrase = "tc-core";
          var encryptedToken = CryptoJS.AES.encrypt(JSON.stringify(user), phrase);
          localStorage.setItem('user', encryptedToken);
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
  * @param {Object} user - Must contain fields username, password, and token.
  *                        Typically obtained from logging in.
  * @return {Array} - Returns an array of repo objects.
  *****************************************************************/
    listRepos: function (user) {
      return api.listRepos(user).then(function (repos) {
        return repos.map( repo => {
          var user = repo.full_name.split("/")[0];
          var project = repo.full_name.split("/")[1];
          return {repo: repo.full_name, user: user, project: project};
        }).filter( repo => {
          return repo.user === user.username;
        });
      });
    },
    searchReposByUser: function (user) {
      return axios.get(`https://git.door43.org/api/v1/users/${user}/repos`)
      .catch(() => {
        return {
          data: []
        }
      });
    },
    searchRepos: function (query) {
      var uid = 0;
      var limit = 100;
      return api.searchRepos(query, uid, limit).then((repos) => {
        return repos.map(repo => {
          return repo;
        }).filter(repo => {
          return repo.description.includes("ts-desktop")
        });
      });
    }
  }
}

module.exports = UserManager;
