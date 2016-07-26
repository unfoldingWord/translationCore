var UpdateTC = (function(remoteRepo, branch, first) {
var api = window.ModuleApi;
var remote = window.electron.remote;
var {dialog} = remote;
var path = api.getDataFromCommon('saveLocation');
var GitApi = require('./GitApi.js');
if (first) {
  GitApi(path).push(remoteRepo, branch, function(err) {
    if (err)
      dialog.showErrorBox('Error', err);
    });
} else {
  GitApi(path).pull(remoteRepo, branch, function(err) {
    if (err) {
      dialog.showErrorBox('Error', err);
    }
    GitApi(path).push(remoteRepo, branch, function(err) {
      if (err)
        dialog.showErrorBox('Error', err);
      });
  });
}



});

module.exports = UpdateTC;
