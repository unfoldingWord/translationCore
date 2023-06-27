import types from './ActionTypes';

export const ORDER_HELPS_BY_REF = 'orderHelpsByRef';

/**
 * Adds or updates an application setting
 * @param {string} key the setting key
 * @param {*} value the setting value
 * @return {function(*, *)}
 */
export const setSetting = (key, value) => ({
  type: types.SET_SETTING,
  key,
  value,
});

/**
 * Toggles a setting to true or false.
 * This will coerce a non-boolean setting to boolean.
 * @deprecated use setSetting instead.
 * @param {string} key the setting key
 * @return {function(*, *)}
 */
export const toggleSetting = (key) => ({
  type: types.TOGGLE_SETTING,
  key,
});

/**
 * @description helper function that Updates/changes a tools'/modules' settings.
 * @param {string} moduleNamespace - module name that would be saved
 * as a property of the modulesSettingsReducer object.
 * @param {string} settingsPropertyName - is he property name to be used
 *  to save multiple settings names for a tool/module.
 * @param {object} toolSettingsData - settings data.
 * @return {object} acton object.
 */
export const setToolSettings = (moduleNamespace, settingsPropertyName, toolSettingsData) => ({
  type: types.UPDATE_TOOL_SETTINGS,
  moduleNamespace,
  settingsPropertyName,
  toolSettingsData,
});
