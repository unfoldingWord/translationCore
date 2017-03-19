import fs from 'fs-extra'
import pathex from 'path-extra'
//consts declaration
const PARENT = pathex.datadir('translationCore')
const SETTINGS_DIRECTORY = pathex.join(PARENT, 'settings.json')
const RESOURCES_DATA_DIR = pathex.join('apps', 'translationCore', 'resources')


export const saveSettings = (state) => {
  fs.outputJson(SETTINGS_DIRECTORY, state.settingsReducer);
}
