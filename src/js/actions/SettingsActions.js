const consts = require('./CoreActionConsts');
const api = window.ModuleApi;
const fs = require('fs-extra');
const pathex = require('path-extra');
const PARENT = pathex.datadir('translationCore')
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled');
const dir = pathex.join(PACKAGE_COMPILE_LOCATION, 'settings.json');

module.exports.setSettings = function(field, value) {
  return ((dispatch) => {
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

module.exports.toggleSettings = function(field) {
  return ((dispatch) => {
    fs.readJson(dir, function (err, settingsObj) {
      if(err){
        console.error(err);
      }else {
        settingsObj[field] = !settingsObj[field];
      }
      fs.outputJson(dir, settingsObj);
      dispatch({
        type: consts.CHANGE_SETTINGS,
        val: settingsObj,
      });
    })
  });
};
