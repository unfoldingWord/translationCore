import consts from './CoreActionConsts';

export const setModuleSettings = (moduleName, moduleSettingsData) => {
  return updateModuleSettings(moduleName, moduleSettingsData);
};

export const changeModuleSettings = (moduleName, moduleSettingsData) => {
  return updateModuleSettings(moduleName, moduleSettingsData);
};

/**
 * @description Updates/changes a tools'/mpdules' settings.
 * @param {string} moduleName - module name that would be saved
 * as a property of the modulesSettingsReducer object.
 * @param {object} moduleSettingsData - settings data.
 * @return {object} acton object.
 */
function updateModuleSettings(moduleName, moduleSettingsData) {
  return {
    type: consts.UPDATE_MODULE_SETTINGS,
    moduleName,
    moduleSettingsData
  };
}

