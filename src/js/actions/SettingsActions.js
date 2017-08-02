import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// constants
const PARENT = path.datadir('translationCore');
const SETTINGS_DIRECTORY = path.join(PARENT, 'settings.json');
/**
 * @description initializes settings. In other words ,creates a
 * settings property and assign a value to it.
 * @param {string} field - settings property name.
 * @param {*} value - any data type to assign to the property as a value.
 * @return {object} action object.
 */
export function setSettings(field, value) {
  return ((dispatch, getState) => {
    let settingsObj = getState().settingsReducer.currentSettings;
    settingsObj[field] = value;
    dispatch({
      type: consts.CHANGE_SETTINGS,
      val: settingsObj
    });
  });
}
/**
 * @description toggles settings any kind of settings to either false or true.
 * @param {string} field - settings property name.
 * @return {object} action object.
 */
export function toggleSettings(field) {
  return ((dispatch, getState) => {
    let settingsObj = getState().settingsReducer.currentSettings;
    settingsObj[field] = !settingsObj[field];
    dispatch({
      type: consts.CHANGE_SETTINGS,
      val: settingsObj
    });
  });
}

/**
 * @description helper function that Updates/changes a tools'/modules' settings.
 * @param {string} moduleNamespace - module name that would be saved
 * as a property of the modulesSettingsReducer object.
 * @param {string} settingsPropertyName - is he property name to be used
 *  to save multiple settings names for a tool/module.
 * @param {object} toolSettingsData - settings data.
 * @return {object} acton object.
 */
export function setToolSettings(moduleNamespace, settingsPropertyName, toolSettingsData) {
  return {
    type: consts.UPDATE_TOOL_SETTINGS,
    moduleNamespace,
    settingsPropertyName,
    toolSettingsData
  };
}

/**
 * @description migrates the toolsSettings to use 'ulb' in the currentPaneSettings instead of 'ulb-en'
 */
export function migrateToolsSettings() {
  return ((dispatch) => {
    if (fs.existsSync(SETTINGS_DIRECTORY)) {
      let settings = fs.readJsonSync(SETTINGS_DIRECTORY);
      if (settings.toolsSettings.ScripturePane && settings.toolsSettings.ScripturePane.currentPaneSettings.includes('ulb-en')) {
        let newCurrentPaneSettings = settings.toolsSettings.ScripturePane.currentPaneSettings.map((bibleId) => {
          switch (bibleId) {
            case 'ulb-en':
              return 'ulb';
            case 'udb-en':
              return 'udb';
            default:
              return bibleId
          }
        });
        dispatch(setToolSettings("ScripturePane", "currentPaneSettings", newCurrentPaneSettings));
      }
    }
  });
}
