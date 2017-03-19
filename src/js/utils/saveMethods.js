 /**
 * @description this file holds all methods that handle saving/persisting data in the
 *  file system add your methods as need and then import them into localstorage.js
 */

import fs from 'fs-extra'
import pathex from 'path-extra'
//consts declaration
const PARENT = pathex.datadir('translationCore')
const SETTINGS_DIRECTORY = pathex.join(PARENT, 'settings.json')
const RESOURCES_DATA_DIR = pathex.join('apps', 'translationCore', 'resources')


export const saveSettings = (state) => {
  fs.outputJson(SETTINGS_DIRECTORY, state.settingsReducer);
}
