import {loadSettings} from './loadMethods';
import {saveSettings, saveResources} from './saveMethods';

/**
 * @description loads state needed to set up reducers with preloaded data
 * Takes in loadSettings()
 * @return {object} - preloaded state
 */
export const loadState = () => {
  try {
    const serializedState = {
      settingsReducer: loadSettings()
    };
    if (serializedState === null) {
      //  returning undefined to allow the reducers to initialize the app state
      return undefined;
    }
    return serializedState;
  } catch (err) {
    console.warn(err);
    //  returning undefined to allow the reducers to initialize the app state
    return undefined;
  }
};

/**
 * @description saves state to the filesystem on state change
 * Takes in saveSettings()
 * @param {object} state - object of reducers (objects).
 */
export const saveState = state => {
  try {
    if (state.settingsReducer) {
      saveSettings(state);
    }
    if (state.resourcesReducer) {
      saveResources(state);
    }
  } catch (err) {
    console.warn(err);
  }
};
