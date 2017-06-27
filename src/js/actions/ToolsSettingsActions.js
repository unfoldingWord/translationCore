import consts from './ActionTypes';

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
