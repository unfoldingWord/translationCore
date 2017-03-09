const consts = require('./CoreActionConsts');
const api = window.ModuleApi;
const fs = require('fs-extra');
const pathex = require('path-extra');
const PARENT = pathex.datadir('translationCore')
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled');
const dir = pathex.join(PACKAGE_COMPILE_LOCATION, 'settings.json');

module.exports.setSettings = function(field, value) {
  return ((dispatch, getState) => {
    let settingsObj = getState().settingsReducer.currentSettings;
    settingsObj[field] = value;
    dispatch({
      type: consts.CHANGE_SETTINGS,
      val: settingsObj,
    });
  });
};

module.exports.toggleSettings = function(field) {
  return ((dispatch, getState) => {
    let settingsObj = getState().settingsReducer.currentSettings;
    settingsObj[field] = !settingsObj[field];
    dispatch({
      type: consts.CHANGE_SETTINGS,
      val: settingsObj,
    });
  });
};
