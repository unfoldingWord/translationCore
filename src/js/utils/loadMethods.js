 /**
  * @description this file holds all methods that handle preloading data into the
  *  store add your methods as needed and then import them into localstorage.js to
  *  be used with the loadState method.
  */
import fs from 'fs-extra'
import path from 'path-extra'
//consts declaration
const PARENT = path.datadir('translationCore')
const SETTINGS_DIRECTORY = path.join(PARENT, 'settings.json')
const RESOURCES_DATA_DIR = path.join('apps', 'translationCore', 'resources')


export const loadSettings = () => {
  let settings = undefined;
  try {
    settings = fs.readJsonSync(SETTINGS_DIRECTORY)
  } catch (err) {
    console.warn(err)
  }
  return settings
}
