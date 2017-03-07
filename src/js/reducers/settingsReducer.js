const consts = require('../actions/CoreActionConsts');
const api = window.ModuleApi;
const merge = require('lodash.merge');
const fs = require('fs-extra');
const pathex = require('path-extra');
const PARENT = pathex.datadir('translationCore')
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled');
const dir = pathex.join(PACKAGE_COMPILE_LOCATION, 'settings.json');

const initialState = {
  currentSettings: fs.readJsonSync(dir),
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.CHANGE_SETTINGS:
      return merge({}, state, {
        currentSettings: action.val
      });
      break;
    default:
      return state;
  }
}
