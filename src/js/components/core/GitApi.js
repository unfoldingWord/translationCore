var GitApi = (function(directory) {

  var git = require('simple-git')(directory);

  return: {
    init: function() {

    },

    pull: function() {

    },

    push: function() {

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
});
