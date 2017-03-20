import fs from 'fs-extra'
import pathex from 'path-extra'
//consts declaration
const PARENT = pathex.datadir('translationCore')
const SETTINGS_DIRECTORY = pathex.join(PARENT, 'settings.json')
const RESOURCES_DATA_DIR = pathex.join('apps', 'translationCore', 'resources')


export const saveSettings = (state) => {
  fs.outputJson(SETTINGS_DIRECTORY, state.settingsReducer);
}

export const saveResources = (state) => {
  const PROJECT_SAVE_LOCATION = state.projectDetailsReducer.projectSaveLocation;
  let biblesObject = state.resourcesReducer.bibles;
  let resourcesObject = state.resourcesReducer.resources;
  for(var keyName in biblesObject){
    let bibleVersion = keyName + '.json';
    let savePath = pathex.join(
      PROJECT_SAVE_LOCATION,
      RESOURCES_DATA_DIR,
      'bibles',
      bibleVersion
    )
    fs.outputJson(savePath, biblesObject[keyName])
  }
  for(var resources in resourcesObject){
    for(var file in resourcesObject[resources]){
      let savePath = pathex.join(
        PROJECT_SAVE_LOCATION,
        RESOURCES_DATA_DIR,
        resources,
        file
      )
      fs.outputJson(savePath, resourcesObject[resources][file])
    }
  }
}
