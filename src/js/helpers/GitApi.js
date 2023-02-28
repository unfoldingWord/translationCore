import { exec } from 'child_process';
import simpleGit from 'simple-git';
import { DCS_BASE_URL, defaultBranch } from '../common/constants';
import * as GogsApiHelpers from './GogsApiHelpers';

/**
 * @description An internal, core facing, API designed to be used as a bind to
 *              git installed on an users computer.
 * @param {string} directory - The path of the git repo.
 * @return {Object} An internal api
 * @TODO: Refactor using https://github.com/nodegit/nodegit
 **/
export default function GitApi(directory) {
  var git = simpleGit(directory);

  return {
    /**
     * @description Initializes a git repository.
     * @param {function} callback - A callback to be run on complete.
     * @param {array|object|null} options
     */
    init: function (callback, options = null) {
      git.init(false, options, callback);
    },
    /**
     * @description Pulls in from a remote branch.
     * @param {string} remote - The remote location of the git repo.
     * @param {string} branch - The branch to be pulled from, typically master.
     * @param {function} callback - A callback to be run on complete.
     */
    pull: function (remote, branch, callback) {
      git.pull(remote, branch, callback);
    },
    /**
     * @description Pushes to a remote branch.
     * @param {string} remote - The remote location of the git repo.
     * @param {string} branch - The branch to be pulled from, typically master.
     * @param {function} callback - A callback to be run on complete.
     */
    push: function (remote, branch, callback) {
      git.push(remote, branch, callback);
    },
    /**
     * @description Commits items that have been added.
     * @param {{full_name: String, username: String, email: String}} user
     * @param {string} message - The commit message to be used.
     * @param {function} callback - A callback to be run on complete.
     */
    commit: function (user, message, callback) {
      var name, username, email;

      if (user) {
        name = user.full_name;
        username = user.username;
        email = user.email;
      }
      git.addConfig('user.name', name || username || 'translationCore User');
      git.addConfig('user.email', email || 'Unknown');
      git.commit(message, callback);
    },
    /**
     * @description Status of the current working directory
     * @param {function} callback - A callback to be run on complete.
     */
    status: function (callback) {
      git.status(callback);
    },
    /**
     * @description Clones a repository
     * @param {string} url - The remote location of the git repo, a .git url
     * @param {string} path - The location to be saved in.
     * @param {function} callback - A callback to be run on complete.
     */
    mirror: function (url, path, callback) {
      if (!url || !path) {
        callback('Missing URL or save path');
        return;
      }
      git.clone(url, path, ['--recursive'], function (err) {
        if (err) {
          console.error(`Failed to clone ${url} to ${path}`, err);

          if (callback) {
            callback(err);
            return;
          }
        }

        if (callback) {
          callback(err);
        }
      });
    },
    /**
     * @description Stages the current working directory.
     * @param {string} path - file or folder to be saved.
     * @param {function} callback - A callback to be run on complete.
     */
    add: function (path, callback) {
      git.add(path, callback);
    },
    /**
     * @description Pulls and pushes to a remote location
     * @param {string} remoteRepo - The remote location of the git repo.
     * @param {string} branch - The branch to be pulled from, typically master.
     * @param {boolean} first - Whether or not this is a fresh repo.
     * @param {function} callback - A callback to be run on complete.
     */
    update: function (remoteRepo, branch, first, callback) {
      var _this = this;

      if (first) {
        this.push(remoteRepo, branch, function (err) {
          callback(err);
        });
      } else {
        this.pull(remoteRepo, branch, function (err) {
          if (err) {
            callback(err);
            return;
          }
          _this.push(remoteRepo, branch, function (err) {
            callback(err);
          });
        });
      }
    },
    /**
     * @description Adds and commits.
     * @param {{full_name: String, username: String, email: String}} user
     * @param {string} message - Message for the commit.
     * @param {string} path - The local path of the repo
     * @param {function} callback - A callback to be run on complete.
     */
    save: function (user, message, path, callback) {
      var _this = this;
      _this.init();
      _this.add(path, function (err) {
        if (err) {
          callback(err);
        }
        _this.commit(user, message, function (err) {
          if (err) {
            callback(err);
          }

          if (callback) {
            callback(null);
          }
        });
      });
    },
    revparse: function (options, callback) {
      return git.revparse(options, callback);
    },
    branchLocal: function (callback) {
      return git.branchLocal(callback);
    },
    branch: function (options, callback) {
      return git.branch(options, callback);
    },
    checkout: function (branch, options, callback) {
      if (!branch) {
        callback('No branch');
        return;
      }
      git.checkout(branch, options, callback);
    },
    remote: function (optionsArray, callback) {
      return git.remote(optionsArray, callback);
    },
    run: function (optionsArray, callback) {
      return git._run(optionsArray, callback);
    },
    addRemote: function (name, repo, callback) {
      git.addRemote(name, repo, callback);
    },
    getRemotes: function (verbose, callback) {
      git.getRemotes(verbose, callback);
    },
  };
}

/**
 * splits the repo url to get repo name
 */
export const parseRepoUrl = (ulr) => {
  let repoName = ulr.trim().match(/^(\w*)(:\/\/|@)([^/:]+)[/:]([^/:]+)\/(.+).git$/) || [''];

  if (repoName.length <= 5) { // if we didn't find enough data, try matching without .git extension
    repoName = ulr.trim().match(/^(\w*)(:\/\/|@)([^/:]+)[/:]([^/:]+)\/([^/]+)/) || [''];
  }

  const repoInfo = {
    name: repoName[5],
    user: repoName[4],
    url: repoName[0],
  };
  return repoInfo;
};

/**
 * @description Returns the name information for the given repository
 * @param {string} projectPath The location of the repository root folder
 * @param {string} remote
 * @returns {Promise<{name: String, url: String}>} - resolves the repo url and the name
 * i.e. {name: 'en_tit', url:'https://github.com/user/en_tit'}
 */
export const getRepoNameInfo = (projectPath, remote = 'origin') => new Promise((resolve, reject) => {
  exec(`git remote get-url ${remote}`, { cwd: projectPath }, (err, stdout = '') => {
    if (!err) {
      const repoInfo = parseRepoUrl(stdout);
      resolve(repoInfo);
    } else {
      reject(err);
    }
  });
});

/**
 * @description Runs a git push command to remote origin for the repo
 * @param {string} projectPath The location of the repository root folder
 * @param {Object} user
 * @param {string} repoName
 * @param {string} branch
 */
export const pushNewRepo = (projectPath, user, repoName, branch = 'master') => new Promise((resolve) => {
  const git = GitApi(projectPath);
  const newRemote = GogsApiHelpers.getUserTokenDoor43Url(user, user.username + '/' + repoName);

  git.push(newRemote, branch, (res) => {
    resolve(res);
  });
});

/**
 * @description Renames the url of the remote origin which will be used for pushing
 * @param {{username}} user
 * @param {string} newName name of the new repo
 * @param {string} projectPath The location of the repository root folder
 */
export const renameRepoLocally = (user, newName, projectPath) => new Promise((resolve) => {
  const git = GitApi(projectPath);

  git.remote(['set-url', 'origin', `${DCS_BASE_URL}/${user.username}/${newName}.git`], (res) => {
    resolve(res);
  });
});

/**
 * @description Gets the remote repository 40 character hash reference
 * @param {string} repoUrl The url of the repository to ping
 * @returns {string} the hash reference
 * @throws {Error} the fetch failed
 */
export const getRemoteRepoHead = (repoUrl) => new Promise((resolve, reject) => {
  exec(`git ls-remote ${repoUrl} HEAD`, (err, stdout) => {
    if (!err) {
      resolve(stdout);
    } else {
      reject(err);
    }
  });
});

/**
 * iterate through git remotes and find match for name
 * @param {string} projectPath
 * @param {string} remoteName
 * @return {Promise<any>}
 */
export const getSavedRemote = (projectPath, remoteName) => new Promise((resolve, reject) => {
  const git = GitApi(projectPath);

  git.getRemotes(true, (err, remotes) => {
    if (!err) {
      let remote = remotes.find((remote) => (remote.name === remoteName));
      resolve(remote);
    } else {
      reject();
    }
  });
});

/**
 * save git remote url
 * @param {string} projectPath
 * @param {string} remoteName
 * @param {string} url
 * @return {Promise<any>}
 */
export const saveRemote = (projectPath, remoteName, url) => new Promise((resolve, reject) => {
  const git = GitApi(projectPath);

  git.addRemote(remoteName, url, (err) => {
    if (err) {
      reject(err);
    }
    resolve();
  });
});

/**
 * clear remote from git
 * @param {string} projectPath
 * @param {string} name
 * @return {Promise<any>}
 */
export const clearRemote = (projectPath, name) => new Promise((resolve, reject) => {
  const git = GitApi(projectPath);

  try {
    git.remote(['rm', name], (res) => { // delete the remote
      resolve(res);
    });
  } catch (e) {
    console.log(e);
    reject(e);
  }
});


