var GitClone = (function(url, path, callback) {

var remote = window.electron.remote;
var {dialog} = remote;
var git = require('simple-git')(path);

git.mirror(url, path, function(err, callback) {
  if (err)
    dialog.showErrorBox(err);
  callback();
  git.pull(remoteRepo, branch, function(err) {
    if (err) {
      dialog.showErrorBox('Error', err);
    }
});
});


});

module.exports = GitClone;
