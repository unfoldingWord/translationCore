 /**
  * @description this file holds all methods that handle preloading data into the
  *  store add your methods as needed and then import them into localstorage.js to
  *  be used with the loadState method.
  */
import fs from 'fs-extra';
import path from 'path-extra';
//  consts declaration
const PARENT = path.datadir('translationCore');
const SETTINGS_DIRECTORY = path.join(PARENT, 'settings.json');
const MODULES_SETTINGS_DIRECTORY = path.join(PARENT, 'modulesSettings.json');

export const loadSettings = () => {
  // defining as undefined so that we dont forget that we must
  // return undefined, never null
  let settings = undefined;
  try {
    if (fs.existsSync(SETTINGS_DIRECTORY)) {
      settings = fs.readJsonSync(SETTINGS_DIRECTORY);
    } else {
      console.log("No settings file found therefore it will be created when the settings reducer is fully loaded");
    }
  } catch (err) {
    console.warn(err);
  }
  return settings;
};

/**
 * @description loads the modules settings from file system.
 * @const MODULES_SETTINGS_DIRECTORY - directory where module settings is located.
 * @return {object} action object.
 */
export function loadModulesSettings() {
  try {
    if (fs.existsSync(MODULES_SETTINGS_DIRECTORY)) {
      let modulesSettings = fs.readJsonSync(MODULES_SETTINGS_DIRECTORY);
      console.log(modulesSettings)
      return modulesSettings;
    } else {
      // no module settings file found and/or directory not found.
      return {};
    }
  } catch (err) {
    console.warn(err);
    return {};
  }
}
