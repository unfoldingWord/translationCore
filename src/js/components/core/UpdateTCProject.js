var UpdateTC = (function(directory, remote, branch) {

var remote = window.electron.remote;
var {dialog} = remote;
var git = require('simple-git')(directory);
var GitApi = require('./GitApi.js');

GitApi.pull(remote, branch, function(err) {
  if (err)
    dialog.showErrorBox(err);
});

GitApi.add(function(err, data) {
  if (err)
    dialog.showErrorBox(err);
});

var message = "Updating TC project from " + directory;
GitApi.commit(message, function(err) {
  if (err)
    dialog.showErrorBox(err);
});

GitApi.push(remote, branch, function(err) {
  if (err)
    dialog.showErrorBox(err);
});

});

module.exports = UpdateTC;
