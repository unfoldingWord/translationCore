var UpdateTC = (function(path, remote, branch) {

var remote = window.electron.remote;
var {dialog} = remote;
var git = require('simple-git')(directory);
var GitApi = require('./GitApi.js');

GitApi(path).pull(remote, branch, function(err) {
  if (err) {
    dialog.showErrorBox('Error', err);
  }
  GitApi(path).push(remote, branch, function(err) {
    if (err)
      dialog.showErrorBox('Error', err);
    });
});


});

module.exports = UpdateTC;
