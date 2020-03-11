import isEqual from 'deep-equal';
import { loadSettings, loadUserdata } from './loadMethods';
import {
  saveSettings,
  saveTargetLanguage,
  saveLocalUserdata,
  saveProjectManifest,
  saveProjectSettings,
} from './saveMethods';

/**
 * @description loads state needed to set up reducers with preloaded data
 * Takes in loadSettings()
 * @return {object} - preloaded state
 */
export const loadState = () => {
  try {
    const serializedState = {
      settingsReducer: loadSettings(),
      loginReducer: loadUserdata(),
    };

    if (serializedState === null) {
      //  returning undefined to allow the reducers to initialize the app state
      return undefined;
    }
    return serializedState;
  } catch (err) {
    // not using console.error because in some cases we still want the app to continue
    // and by making it undefined the reducers will be initialized with its default state.
    console.warn(err);
    //  returning undefined to allow the reducers to initialize the app state
    return undefined;
  }
};

/**
 * @description saves state to the filesystem on state change
 * Takes in saveSettings()
 * @param {object} prevState - object of reducers (objects).
 * @param {object} newState - object of reducers (objects).
 */
export const saveState = (prevState, newState) => {
  try {
    saveSettings(newState);
    saveLocalUserdata(newState);

    // save manifest only if it is defined.
    if (newState.projectDetailsReducer.projectSaveLocation && newState.projectDetailsReducer.manifest && Object.keys(newState.projectDetailsReducer.manifest).length > 0) {
      saveProjectManifest(newState);
    }

    if (newState.projectDetailsReducer.projectSaveLocation && newState.projectDetailsReducer.settings && Object.keys(newState.projectDetailsReducer.settings).length > 0) {
      saveProjectSettings(newState);
    }

    // only save targetLanguage when data has changed and not empty
    const { targetLanguage } = newState.resourcesReducer.bibles;
    const targetLanguageHasData = (targetLanguage && Object.keys(targetLanguage).length > 0);

    if (targetLanguageHasData && !isEqual(prevState.resourcesReducer.bibles.targetLanguage, targetLanguage)) {
      saveTargetLanguage(newState);
    }
  } catch (err) {
    console.warn(err);
  }
};
