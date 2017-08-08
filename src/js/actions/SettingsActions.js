import consts from './ActionTypes';

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
