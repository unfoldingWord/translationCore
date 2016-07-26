const CheckStore = require('../../stores/CheckStore.js')
const api = require('../../ModuleApi.js');
const remote = window.electron.remote;
const {dialog} = remote;
const GitApi = require('./GitApi.js');


module.exports = function() {
  var path = api.getDataFromCommon('saveLocation');
  CheckStore.saveAllToDisk(path);
  GitApi.add(function(err, data) {
    if (err)
      dialog.showErrorBox(err);
  });

  var message = "Updating TC project from: " + directory;
  GitApi.commit(message, function(err) {
    if (err)
      dialog.showErrorBox(err);
  });
};
