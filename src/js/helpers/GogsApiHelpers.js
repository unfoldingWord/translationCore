import Gogs from "gogs-client";
import CryptoJS from "crypto-js";
import Repo from "./Repo";
import fs from "fs-extra";
import path from "path-extra";
// constants
const api = new Gogs("https://git.door43.org/api/v1"),
  tokenStub = { name: "translation-core" };
const SECRET = "tc-core";
export const TC_OLD_ORIGIN_KEY = "tc_oldOrigin";

/**
 * @description - Login a user and get a user object with token back.
 * @param {Object} userObj - Must contain fields username and password
 * @return {Promise} - Returns a promise with a user object.
 */
export const login = (userObj) => {
  return api.getUser(userObj).then(user => {
    return api.listTokens(userObj).then(function(tokens) {
      return tokens.find((el) => el.name === tokenStub.name);
    }).then(function(token) {
      return token ? token : api.createToken(tokenStub, userObj);
    }).then(function(token) {
      user.token = token.sha1;
      let encryptedToken = CryptoJS.AES.encrypt(JSON.stringify(user), SECRET);
      try {
        localStorage.setItem("user", encryptedToken);
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
    return repos.find((el) => el.full_name === user.username + "/" + reponame);
  }).then(function(repo) {
    return repo ? repo : api.createRepo({
      name: reponame,
      description: "tc-desktop: " + reponame,
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
  return "https://" + user.token + "@git.door43.org/" + repoName + ".git";
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
    const repo = new Repo(projectPath);
    const remote = await repo.getRemote();
    const newRemoteURL = getRepoOwnerUrl(user, newName);

    // cannot rename to existing remote repo
    await throwIfRemoteRepoExists(newRemoteURL);

    if (remote.owner === user.username) {
      // delete current repo
      await api.deleteRepo({ name: remote.name }, user).catch(() => {
      });

      // delete legacy remote repo
      const legacyRemote = await repo.getRemote(TC_OLD_ORIGIN_KEY);
      if (legacyRemote && legacyRemote.name !== remote.name) {
        await api.deleteRepo({ name: legacyRemote.name }, user).catch(() => {
        });
      }
    }

    // remove legacy key
    await repo.removeRemote(TC_OLD_ORIGIN_KEY);

    // create new repo
    await createRepo(user, newName);
    await repo.addRemote(newRemoteURL);
    await repo.push();
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
    const newRemoteURL = getUserDoor43Url(user, newName);
    const repo = new Repo(projectPath);
    await repo.removeRemote(TC_OLD_ORIGIN_KEY);// clear old connection since we are renaming

    await createRepo(user, newName);
    await repo.addRemote(newRemoteURL);
    await repo.push();
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * @description Rejects if the given repo url exists
 * @param {string} repoOwnerUrl - The git url of the repo
 * i.e. https://github.com/unfoldingWord-dev/translationCore
 * @returns {Promise<boolean>} - resolves if the remote does not exist
 */
export const throwIfRemoteRepoExists = async (repoOwnerUrl) => {
  try {
    await Repo.getRemoteInfo(repoOwnerUrl);
  } catch (e) {
    return true;
  }

  throw new Error(`Remote repo ${repoOwnerUrl} already exists.`);
};

/**
 * @description Uses the localStorage API to retrieve the last user
 * GOGS stored.
 * @returns {{username, token, password}} - The current user object
 * from localstorage
 */
export const getLocalUser = () => {
  let loggedInUserEncrypted = localStorage.getItem("user");
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
  const matchName = user.username + "/" + reponame;
  return new Promise((resolve, reject) => {
    api.listRepos(user).then(function(repos) {
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
 * @param {String} projectPath - the project path
 * @param {String} remoteName - the name of the remote
 * @return {Promise<string|null>} The remote url or null if not found
 */
export const getSavedRemote = async (projectPath, remoteName) => {
  const repo = new Repo(projectPath);
  const remote = await repo.getRemote(remoteName);
  if (remote) {
    return remote.url;
  } else {
    return null;
  }
};

/**
 * change remote pointers to point to new DCS location
 * @param projectSaveLocation
 * @param userdata
 * @param {string} oldOrigin - url to save as old
 */
export const updateGitRemotes = async (
  projectSaveLocation, userdata, oldOrigin) => {
  const projectName = path.basename(projectSaveLocation);
  const newOriginUrl = getRepoOwnerUrl(userdata, projectName);
  if (oldOrigin) {
    try {
      await saveRemote(projectSaveLocation, TC_OLD_ORIGIN_KEY, oldOrigin);
    } catch (e) {
      console.log(e);
    }
  }
  if (newOriginUrl) {
    try {
      await saveRemote(projectSaveLocation, "origin", newOriginUrl);
    } catch (e) {
      console.log(e);
    }
  }
};

/**
 * save git remote url, removes previous remote first
 * @param {string} projectPath
 * @param {string} remoteName
 * @param {string} url
 * @return {Promise<any>}
 */
export const saveRemote = async (projectPath, remoteName, url) => {
  try {
    const repo = new Repo(projectPath);
    await repo.addRemote(url, remoteName);
  } catch (e) {
    console.log(e);
  }
};

/**
 * display prompt that project as been renamed
 * @param {String} projectSaveLocation
 * @param {Object} userdata
 * @return {Promise} - Returns a promise
 */
export const changeGitToPointToNewRepo = async (
  projectSaveLocation, userdata) => {
  let saveUrl = "";
  try {
    const oldUrl = await getSavedRemote(projectSaveLocation, TC_OLD_ORIGIN_KEY);
    if (!oldUrl) { // if old origin not saved, we need to save current
      saveUrl = await getSavedRemote(projectSaveLocation, "origin");
    }
    await updateGitRemotes(projectSaveLocation, userdata, saveUrl);
    return true;
  } catch (e) {
    throw(e);
  }
};

/**
 * get project info returns object with old and new repo names, and user name
 * @param {string} projectSaveLocation
 * @param {object} userData
 * @return {Promise<void>}
 */
export const getProjectInfo = async (projectSaveLocation, userData) => {
  const new_repo_name = path.basename(projectSaveLocation);
  let oldUrl = await getSavedRemote(projectSaveLocation, TC_OLD_ORIGIN_KEY);
  if (!oldUrl) { // if old origin not saved, we use current
    oldUrl = await getSavedRemote(projectSaveLocation, "origin");
  }
  let old_repo_name = "(unknown)";
  let user_name = "(unknown)";
  try {
    let { name, owner: user } = Repo.parseRemoteUrl(oldUrl);
    old_repo_name = name;
    user_name = user;
  } catch (e) {
    if (userData) {
      user_name = userData.username;
    }
  }
  return { new_repo_name, old_repo_name, user_name };
};

/**
 * Checks to make sure that there is a git history and remote is for current user
 * @param {string} projectSaveLocation
 * @param {Object} login data
 * @return {*}
 */
export const hasGitHistoryForCurrentUser = async (
  projectSaveLocation, login) => {
  try {
    if (login && login.userdata && login.loggedInUser) {
      if (fs.pathExistsSync(path.join(projectSaveLocation, ".git"))) {
        const remoteUrl = await getSavedRemote(projectSaveLocation, "origin");
        const info = Repo.parseRemoteUrl(remoteUrl);
        if(info) {
          let { owner: user } = info;
          return (user === login.userdata.username);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
  return false;
};
