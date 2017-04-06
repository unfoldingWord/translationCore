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
  // return undefined never null
  let settings = undefined;
  try {
    settings = fs.readJsonSync(SETTINGS_DIRECTORY);
  } catch (err) {
    console.warn(err);
  }
  return settings;
};

/**
 * @description
 * @const MODULES_SETTINGS_DIRECTORY - directory where module settings is located.
 * @return {object} action object.
 */
export function loadModulesSettings() {
  try {
    if (fs.existsSync(MODULES_SETTINGS_DIRECTORY)) {
      let moduleSettings = fs.readJsonSync(MODULES_SETTINGS_DIRECTORY);
      return moduleSettings;
    } else {
      // no module settings file found and/or directory not found.
      return {};
    }
  } catch (err) {
    console.warn(err);
    return {};
  }
}
