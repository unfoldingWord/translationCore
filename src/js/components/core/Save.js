const CheckStore = require('../../stores/CheckStore.js')
const api = require('../../ModuleApi.js');
const remote = window.electron.remote;
const {dialog} = remote;
const GitApi = require('./GitApi.js');


module.exports = function(message, callback) {
  var path = api.getDataFromCommon('saveLocation');
  CheckStore.saveAllToDisk(path, function(){
    GitApi(path).add(function(err, data) {
      if (err) {
        dialog.showErrorBox('Error', err);
      }
      GitApi(path).commit(message, function(err) {
          if (err) {
            dialog.showErrorBox('Error', err);
          }
          if (callback) {
            callback();
          }
      });
    });
  });
};
