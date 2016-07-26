function GitApi(directory) {

  var git = require('simple-git')(directory);

  return {
    init: function(callback) {
      git.init(false, callback);
    },

    pull: function(remote, branch, callback) {
      git.pull(remote, branch, callback);
    },

    push: function(remote, branch, callback) {
      git.push(remote, branch, callback);
    },

    commit: function(message, callback) {
      git.commit(message, callback);
      //commits changes in the current working dir
    },

    status: function(callback) {
      git.status(callback);
      //get status of current repo
    },

    add: function(callback) {
      git.add('./*', callback);
      //Array can be one or more files
    }
  }
}

module.exports = GitApi;
