var GitApi = (function(directory) {

  var git = require('simple-git')(directory);

  return: {
    init: function(callback) {
      git.init(false, callback);
    },

    pull: function(remote, branch, callback) {
      git.pull(remote, branch, callback);
    },

    push: function(remote, branch, callback) {
      git.push(remote, branch, callback);
    },

    commit: function() {

    },

    status: function() {

    },

    add: function() {

    }
  }
});
