import Gogs from 'gogs-client';
import CryptoJS from 'crypto-js';
import * as git from './GitApi';
// constants
const api = new Gogs('https://git.door43.org/api/v1'), tokenStub = {name: 'translation-core'};
const SECRET = "tc-core";
/**
 * @description - Login a user and get a user object with token back.
 * @param {Object} userObj - Must contain fields username and password
 * @return {Promise} - Returns a promise with a user object.
 */
export const login = (userObj) => {
  return api.getUser(userObj).then(user => {
    return api.listTokens(userObj)
      .then(function(tokens) {
        return tokens.find((el) => el.name === tokenStub.name);
      })

      .then(function(token) {
        return token ? token : api.createToken(tokenStub, userObj);
      })

      .then(function(token) {
        user.token = token.sha1;
        let encryptedToken = CryptoJS.AES.encrypt(JSON.stringify(user), SECRET);
        try {
          localStorage.setItem('user', encryptedToken);
        } catch (e) {
          //
        }
        return user;
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
  return api.listRepos(user).then(function(repos) {
    return repos.find((el) => el.full_name === user.username + '/' + reponame);
  }).then(function(repo) {
    return repo ? repo : api.createRepo({
      name: reponame,
      description: 'tc-desktop: ' + reponame,
      private: false
    }, user);
  });
};


/**
 *
 * @param {string} newName - the new name of the repo
 * @param {string} projectPath - the path of the project to be renamed
 * @param {{username, token, password}} user - The user who is owner of the repo
 * @returns {Promise}
 */
export const renameRepo = async (newName, projectPath, user) => {
  try {
    const {name: repoName, url: repoOwnerUrl} = await git.getRepoNameInfo(projectPath);
    /** If new repo name exits already then we can not change to that */
    await throwIfRemoteRepoExists(repoOwnerUrl);
    /** Deleting remote repo */
    await api.deleteRepo({name: repoName}, user).catch(() => {});
    /** Creating remote on remote */
    await createRepo(user, newName);
    await git.renameRepoLocally(user, newName, projectPath);
    /** Pushing renamed repo */
    await git.pushNewRepo(projectPath);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * @description Rejects if the given repo url exists
 * @param {string} repoOwnerUrl - The git url of the repo
 * i.e. https://github.com/unfoldingWord-dev/translationCore
 * @returns {Promise} - resolves if the remote does not exist
 */
export const throwIfRemoteRepoExists = (repoOwnerUrl) => {
  return new Promise((resolve, reject) => {
    //This will throw if the repo does not exist;
    git.getRemoteRepoHead(repoOwnerUrl).then(() => {
      reject('Remote repository already exists.');
    }).catch(resolve);
  });
};


/**
 * @description Uses the localStorage API to retrieve the last user
 * GOGS stored.
 * @returns {{username, token, password}} - The current user object
 * from localstorage
 */
export const getLocalUser = () => {
  let loggedInUserEncrypted = localStorage.getItem('user');
  var bytes = CryptoJS.AES.decrypt(loggedInUserEncrypted.toString(), SECRET);
  var plaintext = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(plaintext);
};

/**
 * @description - finds a repo for a user.
 * @param {Object} user - Must contain fields username, password, and token.
 *                        Typically obtained from logging in.
 * @param {String} reponame - The name of the repo to be created.
 * @return {Promise} - Returns a promise with a repo object.
 */
export const findRepo = (user, reponame) => {
  const matchName = user.username + '/' + reponame;
  return api.listRepos(user).then(function (repos) {
    return repos.find((el) => {
      const foundMatch = el.full_name === matchName;
      return (foundMatch);
    });
  });
};
