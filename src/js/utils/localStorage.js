import {loadSettings, loadModulesSettings} from './loadMethods';
import {
  saveSettings,
  saveResources,
  saveComments,
  saveVerseEdit,
  saveSelections,
  saveReminders,
  saveGroupsIndex,
  saveGroupsData,
  saveModuleSettings
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
      modulesSettingsReducer: loadModulesSettings()
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
 * @param {object} state - object of reducers (objects).
 */
export const saveState = state => {
  try {
    saveSettings(state);
    saveResources(state);
    saveComments(state);
    saveSelections(state);
    saveVerseEdit(state);
    saveReminders(state);
    saveGroupsIndex(state);
    saveGroupsData(state);
    saveModuleSettings(state);
  } catch (err) {
    console.warn(err);
  }
};
