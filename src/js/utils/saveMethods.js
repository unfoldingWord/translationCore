 /**
 * @description this file holds all methods that handle saving/persisting data in the
 *  file system add your methods as need and then import them into localstorage.js
 */

import fs from 'fs-extra'
import path from 'path-extra'
//consts declaration
const PARENT = path.datadir('translationCore')
const SETTINGS_DIRECTORY = path.join(PARENT, 'settings.json')
const RESOURCES_DATA_DIR = path.join('apps', 'translationCore', 'resources')

/**
 * @description saves all data in settingsReducer to the specified directory.
 * @param {object} state
 * @const {string} SETTINGS_DIRECTORY - directory to path where settigns is being saved.
 */
export const saveSettings = (state) => {
  fs.outputJson(SETTINGS_DIRECTORY, state.settingsReducer);
}
