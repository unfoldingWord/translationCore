import fs from 'fs-extra'
import path from 'path'
import pathex from 'path-extra'
import { loadSettings } from './loadMethods'
import { saveSettings } from './saveMethods'


export const loadState = () => {
  try {
    const serializedState = {
      settingsReducer: loadSettings()
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
      saveSettings(state)
    }
  } catch(err) {
    console.warn(err);
  }
};
