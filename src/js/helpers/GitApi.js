/**
 * @author Ian Hoegen & Greg Fuentes
 * @description An internal, core facing, API designed to be used as a bind to
 *              git installed on an users computer.
 * @param {string} directory - The path of the git repo.
 * @return {Object} An internal api
 * @TODO: Refactor using https://github.com/nodegit/nodegit
 **/
import simpleGit from 'simple-git';

function GitApi(directory) {
  var git = simpleGit(directory);

  return {
    /**
     * @description Initializes a git repository.
     * @param {function} callback - A callback to be run on complete.
     */
    init: function(callback) {
      git.init(false, callback);
    },
    /**
     * @description Pulls in from a remote branch.
     * @param {string} remote - The remote location of the git repo.
     * @param {string} branch - The branch to be pulled from, typically master.
     * @param {function} callback - A callback to be run on complete.
     */
    pull: function(remote, branch, callback) {
      git.pull(remote, branch, callback);
    },
    /**
     * @description Pushes to a remote branch.
     * @param {string} remote - The remote location of the git repo.
     * @param {string} branch - The branch to be pulled from, typically master.
     * @param {function} callback - A callback to be run on complete.
     */
    push: function(remote, branch, callback) {
      git.push(remote, branch, callback);
    },
    /**
     * @description Commits items that have been added.
     * @param {string} message - The commit message to be used.
     * @param {function} callback - A callback to be run on complete.
     */
    commit: function(user, message, callback) {
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
    status: function(callback) {
      git.status(callback);
    },
    /**
     * @description Clones a repository
     * @param {string} url - The remote location of the git repo, a .git url
     * @param {string} path - The location to be saved in.
     * @param {function} callback - A callback to be run on complete.
     */
    mirror: function(url, path, callback) {
      if (!url || !path) {
        callback('Missing URL or save path');
        return;
      }
      git.clone(url, path, ['--recursive'], function(err) {
        if (err) {
          console.error(err);
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
     * @param {function} callback - A callback to be run on complete.
     */
    add: function(callback) {
      git.add('./*', callback);
    },
    /**
     * @description Pulls and pushes to a remote location
     * @param {string} remoteRepo - The remote location of the git repo.
     * @param {string} branch - The branch to be pulled from, typically master.
     * @param {boolean} first - Whether or not this is a fresh repo.
     * @param {function} callback - A callback to be run on complete.
     */
    update: function(remoteRepo, branch, first, callback) {
      var _this = this;
      if (first) {
        this.push(remoteRepo, branch, function(err) {
          callback(err);
        });
      } else {
        this.pull(remoteRepo, branch, function(err) {
          if (err) {
            callback(err);
            return;
          }
          _this.push(remoteRepo, branch, function(err) {
            callback(err);
          });
        });
      }
    },
    /**
     * @description Adds and commits.
     * @param {string} message - Message for the commit.
     * @param {string} path - The local path of the repo
     * @param {function} callback - A callback to be run on complete.
     */
    save: function(user, message, path, callback) {
      var _this = this;
      _this.init();
      _this.add(function(err) {
        if (err) callback(err);
        _this.commit(user, message, function(err) {
          if (err) callback(err);
          if (callback) callback(null);
        });
      });
    },
    revparse: function(options, callback){
      return git.revparse(options, callback);
    },
    listRemote: function(options, callback){
      return git.listRemote(options, callback);
    },
    checkout: function(branch, callback) {
      if (!branch) {
        callback("No branch");
        return;
      }
      git.checkout(branch, callback);
    }
  };
}

module.exports = GitApi;
