import Gogs from 'gogs-client';
import CryptoJS from 'crypto-js';
import * as git from './GitApi';
import path from "path-extra";
// constants
const api = new Gogs('https://git.door43.org/api/v1'), tokenStub = {name: 'translation-core'};
const SECRET = "tc-core";
export const TC_OLD_ORIGIN_KEY = 'tc_oldOrigin';

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
 * gets repo url
 * @param {Object} user
 * @param {String} projectName
 * @return {string}
 */
export const getRepoOwnerUrl = (user, projectName) => {
  return `https://git.door43.org/${user.username}/${projectName}.git`;
};

/**
 * get ulr for Door43 repo with token
 * @param {Object} user
 * @param {string} repoName
 * @return {string}
 */
export const getUserTokenDoor43Url = (user, repoName) => {
  return 'https://' + user.token + '@git.door43.org/' + repoName + '.git';
};

/**
 * get url for Door43 repo to show user
 * @param {Object} user
 * @param {String} projectName
 * @return {string}
 */
export const getUserDoor43Url = (user, projectName) => {
  return `https://git.door43.org/${user.username}/${projectName}`;
};

/**
 * renames DCS repo for a project
 * @param {string} newName - the new name of the repo
 * @param {string} projectPath - the path of the project to be renamed
 * @param {{username, token, password}} user - The user who is owner of the repo
 * @returns {Promise}
 */
export const renameRepo = async (newName, projectPath, user) => {
  try {
    const {name: repoName} = await git.getRepoNameInfo(projectPath);
    /** If new repo name exits already then we can not change to that */
    await throwIfRemoteRepoExists(getRepoOwnerUrl(user, newName));
    /** Deleting remote repo */
    await api.deleteRepo({name: repoName}, user).catch(() => {});

    /** Deleting old saved repo if exists */
    const oldRepoUlr = await getSavedRemote(projectPath, TC_OLD_ORIGIN_KEY);
    if (oldRepoUlr) {
      const {name: oldRepo} = git.parseRepoUrl(oldRepoUlr);
      if (oldRepo !== repoName) { // if the saved old origin is different, then remove it
        await api.deleteRepo({name: oldRepo}, user).catch(() => {});
      }
    }
    await git.clearRemote(projectPath, TC_OLD_ORIGIN_KEY).catch(() => {}); // clear after deletion

    /** Creating repo on remote */
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
 * creates a new DCS repo for project and pushes project up
 * @param {string} newName - the new name of the repo
 * @param {string} projectPath - the path of the project to be renamed
 * @param {{username, token, password}} user - The user who is owner of the repo
 * @returns {Promise}
 */
export const createNewRepo = async (newName, projectPath, user) => {
  try {
    await git.clearRemote(projectPath, TC_OLD_ORIGIN_KEY).catch(() => {}); // clear old connection since we are renaming
    /** Creating repo on remote */
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
  const bytes = CryptoJS.AES.decrypt(loggedInUserEncrypted.toString(), SECRET);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
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
  return new Promise((resolve,reject) => {
    api.listRepos(user).then(function (repos) {
      resolve(repos.find((el) => {
        const foundMatch = el.full_name === matchName;
        return (foundMatch);
      }));
    }).catch((e) => {
      console.log(e);
      reject(e);
    });
  });
};

/**
 * find saved remote for name, ignores errors
 * @param {String} projectPath
 * @param {String} remoteName
 * @return {Promise<any>}
 */
export const getSavedRemote = (projectPath, remoteName) => {
  return new Promise((resolve) => {
    git.getSavedRemote(projectPath, remoteName).then((remote) => {
      if (remote) { // if found get url from remote object
        remote = remote.refs.push || remote.refs.fetch;
      }
      resolve(remote);
    }).catch(() => {resolve(null)});
  });
};

/**
 * change remote pointers to point to new DCS location
 * @param projectSaveLocation
 * @param userdata
 * @param {string} oldOrigin - url to save as old
 */
export const updateGitRemotes = (projectSaveLocation, userdata, oldOrigin) => {
  const projectName = path.basename(projectSaveLocation);
  const projectGit = git.default(projectSaveLocation);
  const newOriginUrl = getRepoOwnerUrl(userdata, projectName);
  if (oldOrigin) {
    try {
      projectGit.addRemote(TC_OLD_ORIGIN_KEY, oldOrigin);
    } catch(e) {
      console.log(e);
    }
  }
  try {
    projectGit.addRemote('origin', newOriginUrl);
  } catch(e) {
    console.log(e);
  }
};

/**
 * display prompt that project as been renamed
 * @param {String} projectSaveLocation
 * @param {Object} userdata
 * @return {Promise} - Returns a promise
 */
export const changeGitToPointToNewRepo = async (projectSaveLocation, userdata) => {
  let saveUrl = '';
  try {
    const oldUrl = await getSavedRemote(projectSaveLocation, TC_OLD_ORIGIN_KEY);
    if (!oldUrl) { // if old origin not saved, we need to save current
      saveUrl = await getSavedRemote(projectSaveLocation, 'origin');
    }
    updateGitRemotes(projectSaveLocation, userdata, saveUrl);
  } catch(e) {
    console.log(e);
    throw(e);
  }
};

/**
 * get project info returns object with old and new repo names, and user name
 * @param {string} projectSaveLocation
 * @param {object} userData
 * @return {Promise<void>}
 */
export const getprojectInfo = async (projectSaveLocation, userData) => {
  const new_repo_name = path.basename(projectSaveLocation);
  let oldUrl = await getSavedRemote(projectSaveLocation, TC_OLD_ORIGIN_KEY);
  if (!oldUrl) { // if old origin not saved, we use current
    oldUrl = await getSavedRemote(projectSaveLocation, 'origin');
  }
  let old_repo_name = '(unknown)';
  let user_name = '(unknown)';
  try {
    let {name, user} = git.parseRepoUrl(oldUrl);
    old_repo_name = name;
    user_name = user;
  } catch(e) {
    if (userData) {
      user_name = userData.username;
    }
  }
  return {new_repo_name, old_repo_name, user_name };
};
