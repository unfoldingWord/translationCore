var UpdateTC = (function(directory, remote, branch) {

var remote = window.electron.remote;
var {dialog} = remote;
var git = require('simple-git')(directory);
var GitApi = require('./GitApi.js');

GitApi.pull(remote, branch, function(err) {
  if (err)
    dialog.showErrorBox(err);
});

GitApi.push(remote, branch, function(err) {
  if (err)
    dialog.showErrorBox(err);
});

});

module.exports = UpdateTC;
