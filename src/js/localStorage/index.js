import isEqual from 'deep-equal';
import { getSelectedToolName } from '../selectors';
import { loadSettings, loadUserdata } from './loadMethods';
import {
  saveSettings,
  saveTargetLanguage,
  saveComments,
  saveVerseEdit,
  saveSelections,
  saveReminders,
  saveInvalidated,
  saveGroupsData,
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

    // only save checkData and targetLanguage reducers if contextId hasn't changed
    if (isEqual(prevState.contextIdReducer.contextId, newState.contextIdReducer.contextId)) {
      if (!isEqual(prevState.commentsReducer, newState.commentsReducer)) {
        saveComments(newState);
      }

      if (!isEqual(prevState.selectionsReducer, newState.selectionsReducer)) {
        saveSelections(newState);
      }

      if (!isEqual(prevState.verseEditReducer, newState.verseEditReducer)) {
        saveVerseEdit(newState);
      }

      if (!isEqual(prevState.remindersReducer, newState.remindersReducer)) {
        saveReminders(newState);
      }

      if (!isEqual(prevState.invalidatedReducer, newState.invalidatedReducer)) {
        saveInvalidated(newState);
      }

      // only save targetLanguage when data has changed and not empty
      const { targetLanguage } = newState.resourcesReducer.bibles;
      const targetLanguageHasData = (targetLanguage && Object.keys(targetLanguage).length > 0);

      if (targetLanguageHasData && !isEqual(prevState.resourcesReducer.bibles.targetLanguage, targetLanguage)) {
        saveTargetLanguage(newState);
      }
    }

    if (
      // make sure that groupsData has changed
      !isEqual(prevState.groupsDataReducer.groupsData, newState.groupsDataReducer.groupsData) &&
      // make sure project has not changed
      isEqual(prevState.projectDetailsReducer.manifest, newState.projectDetailsReducer.manifest) &&
      // make sure tool has not changed
      isEqual(getSelectedToolName(prevState), getSelectedToolName(newState))
    ) {
      saveGroupsData(newState, prevState);
    }
  } catch (err) {
    console.warn(err);
  }
};
