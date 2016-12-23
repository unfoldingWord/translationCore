/**
 * @author Ian Hoegen
 * @description: This serves is the reducer for settings, it checks for existing
 *               settings, then adds to them.
 **********************************************************************************/

function settingsReducer(oldSettings, newSettings) {
  var settings = oldSettings || {};
  settings[newSettings.name] = newSettings.value;
  return settings;
}

module.exports = settingsReducer;
