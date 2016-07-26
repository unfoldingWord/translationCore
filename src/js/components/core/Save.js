const CheckStore = require('../../stores/CheckStore.js')
const api = require('../../ModuleApi.js');

module.exports = function() {
  var path = api.getDataFromCommon('saveLocation');
  CheckStore.saveAllToDisk(path);
};
