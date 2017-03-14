import fs from 'fs-extra'
import pathex from 'path-extra'
//translationCore PARENT directory
const PARENT = pathex.datadir('translationCore')
//settings.json directory 
const settingsDirectory = pathex.join(PARENT, 'settings.json');

export const loadState = () => {
  try {
    const serializedState = {
      settingsReducer: loadSettings(),
    }
    if(serializedState === null){
      //returning undefined to allow the reducers to initialize the app state
      return undefined;
    }
    return serializedState;
  } catch(err) {
    console.warn(err);
    //returning undefined to allow the reducers to initialize the app state
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    if(state.settingsReducer){
      fs.outputJson(settingsDirectory, state.settingsReducer);
    }
  } catch(err) {
    console.warn(err);
  }
};

//Helpers TODO: will probably move this function helpers to a separate file.
const loadSettings = () => {
  let settings = undefined;
  try {
    settings = fs.readJsonSync(settingsDirectory)
  } catch (err) {
    console.warn(err)
  }
  return settings
};
