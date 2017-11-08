import Gogs from 'gogs-client';
import CryptoJS from 'crypto-js';
import axios from 'axios';
// constants
const api = new Gogs('https://git.door43.org/api/v1'), tokenStub = {name: 'translation-core'};

/**
 * @description - Login a user and get a user object with token back.
 * @param {Object} userObj - Must contain fields username and password
 * @return {Promise} - Returns a promise with a user object.
 */
export const login = (userObj) => {
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
      let phrase = "tc-core";
      let encryptedToken = CryptoJS.AES.encrypt(JSON.stringify(user), phrase);
      localStorage.setItem('user', encryptedToken);
      return user;
    });
  });
};

/**
 * @description - Create an account for a user.
 * @param {Object} user - Must contain fields username, password, and email.
 * @param {} auth
 * @return {Promise} - Returns a promise with a user object.
 */
export const createAccount = (user, auth) => {
  return api.createUser(user, auth, true)
  .then(function(updatedUser) {
    return api.createToken(tokenStub, user)
    .then(function(token) {
      updatedUser.token = token.sha1;
      return updatedUser;
    });
  });
};

/**
 * @description - Create a repo for a user.
 * @param {Object} user - Must contain fields username, password, and token.
 *                        Typically obtained from logging in.
 * @param {String} reponame - The name of the repo to be created.
 * @return {Promise} - Returns a promise with a repo object.
 */
export const createRepo = (user, reponame) => {
  return api.listRepos(user).then(function (repos) {
    return repos.find((el) => el.full_name == user.username + '/' + reponame);
  }).then(function (repo) {
    return repo ? repo : api.createRepo({
      name: reponame,
      description: 'tc-desktop: ' + reponame,
      private: false
    }, user);
  });
};

/**
 * @description - Gets a user's repos.
 * @param {Object} user - Must contain fields username, password, and token.
 *                        Typically obtained from logging in.
 * @return {Array} - Returns an array of repo objects.
 */
export const listRepos = (user) => {
  return api.listRepos(user).then(function (repos) {
    return repos.map( repo => {
      let user = repo.full_name.split("/")[0];
      let project = repo.full_name.split("/")[1];
      return {repo: repo.full_name, user: user, project: project};
    }).filter( repo => {
      return repo.user === user.username;
    });
  });
};

export const searchReposByUser = (user) => {
  return axios.get(`https://git.door43.org/api/v1/users/${user}/repos`)
  .catch(() => {
    return {
      data: []
    };
  });
};

export const searchReposByQuery = (query) => {
  return axios.get(`https://git.door43.org/api/v1/repos/search?q=${query}`)
  .catch(() => {
    return {
      data: []
    };
  });
};

export const searchRepos = (query) => {
  let uid = 0;
  let limit = 100;
  return api.searchRepos(query, uid, limit).then((repos) => {
    return repos.map(repo => {
      return repo;
    }).filter(repo => {
      return repo.description.includes("ts-desktop");
    });
  });
};
