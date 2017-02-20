const consts = require('./CoreActionConsts');
const api = window.ModuleApi;
const fs = require('fs-extra');
const pathex = require('path-extra');
const PARENT = pathex.datadir('translationCore')
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled');

module.exports.setSettings = function(field, value) {
  return ((dispatch) => {
    var dir = pathex.join(PACKAGE_COMPILE_LOCATION, 'settings/settings.json');
    fs.readJson(dir, function (err, settingsObj) {
      if(err){
        settingsObj = {};
      }else {
        if(field && value != undefined){
          settingsObj[field] = value;
        }
      }
      fs.outputJson(dir, settingsObj);
      dispatch({
        type: consts.CHANGE_SETTINGS,
        val: settingsObj,
      });
    })
  });
};
