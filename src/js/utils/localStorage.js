import fs from 'fs-extra'
import path from 'path'
import pathex from 'path-extra'
import { loadSettings } from './loadMethods'
import { saveSettings } from './saveMethods'

/**
 * @description loads state needed to set up reducers with preloaded data
 * Takes in loadSettings()
 * @returns {object} - preloaded state
 */
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

/**
 * @description saves state to the filesystem on state change
 * Takes in saveSettings()
 * @returns {object} - preloaded state
 */
export const saveState = (state) => {
  try {
    if(state.settingsReducer){
      saveSettings(state)
    }
  } catch(err) {
    console.warn(err);
  }
};
