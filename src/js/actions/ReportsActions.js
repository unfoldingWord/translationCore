const consts = require('./CoreActionConsts');
const api = window.ModuleApi;

module.exports.loadReports = function () {
  api.Toast.info('Generating reports...', '', 4);
  return {
    type: consts.LOAD_REPORTS,
    val: true
  }
};
