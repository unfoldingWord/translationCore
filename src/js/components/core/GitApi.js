function GitApi(directory) {

  var remote = window.electron.remote;
  var {dialog} = remote;
  var git = require('simple-git')(directory);
  const CheckStore = require('../../stores/CheckStore.js')

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

    mirror: function(url, path, callback) {
      git.clone(url, path, function(err) {
        if (err) {
          dialog.showErrorBox('Clone Error', err);
          if (callback) {
              callback(err);
          }
        }
        if (callback) {
          callback()
        }
      });
    },

    add: function(callback) {
      git.add('./*', callback);
      //Array can be one or more files
    },

    update: function(remoteRepo, branch, first) {
      var _this = this;
      if (first) {
        this.push(remoteRepo, branch, function(err) {
          if (err)
            dialog.showErrorBox('Error', err);
          });
      } else {
        this.pull(remoteRepo, branch, function(err) {
          if (err) {
            dialog.showErrorBox('Error', err);
          }
          _this.push(remoteRepo, branch, function(err) {
            if (err)
              dialog.showErrorBox('Error', err);
            });
        });
      }
    },

    save: function(message, path, callback) {
      var _this = this;
      CheckStore.saveAllToDisk(path, function(){
        _this.add(function(err, data) {
          if (err) {
            dialog.showErrorBox('Error', err);
          }
          _this.commit(message, function(err) {
              if (err) {
                dialog.showErrorBox('Error', err);
              }
              if (callback) {
                callback();
              }
          });
        });
      });
    }
  }
}

module.exports = GitApi;
