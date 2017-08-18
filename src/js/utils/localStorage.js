import isEqual from 'lodash/isEqual';
import {loadSettings, loadUserdata} from './loadMethods';
import {
  saveSettings,
  saveTargetLanguage,
  saveComments,
  saveVerseEdit,
  saveSelections,
  saveReminders,
  saveGroupsIndex,
  saveGroupsData,
  saveLocalUserdata,
  saveProjectManifest
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
      loginReducer: loadUserdata()
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
export const saveState = (prevState, newState) => {
  try {
    saveSettings(newState);
    saveLocalUserdata(newState);
    // save manifest only if it is defined.
    if (newState.projectDetailsReducer.manifest && Object.keys(newState.projectDetailsReducer.manifest).length > 0) {
      saveProjectManifest(newState);
    }
    // only save checkData and targetLanguage reducers if contextId hasn't changed
    if (isEqual(prevState.contextIdReducer.contextId, newState.contextIdReducer.contextId)) {
      if (!isEqual(prevState.commentsReducer, newState.commentsReducer)) saveComments(newState);
      if (!isEqual(prevState.selectionsReducer, newState.selectionsReducer)) saveSelections(newState);
      if (!isEqual(prevState.verseEditReducer, newState.verseEditReducer)) saveVerseEdit(newState);
      if (!isEqual(prevState.remindersReducer, newState.remindersReducer)) saveReminders(newState);
      // only save targetLanguage when data has changed and not empty
      const {targetLanguage} = newState.resourcesReducer.bibles;
      const targetLanguageHasData = (targetLanguage && Object.keys(targetLanguage).length > 0)
      if (targetLanguageHasData && !isEqual(prevState.resourcesReducer.bibles.targetLanguage, targetLanguage)) {
        saveTargetLanguage(newState);
      }
    }
    // TODO: only save groupsIndex and groupsData if project and tool have not changed
    if (
      // make sure project has not changed
      isEqual(prevState.projectDetailsReducer.manifest, newState.projectDetailsReducer.manifest) &&
      // make sure tool has not changed
      isEqual(prevState.toolsReducer.currentToolName, newState.toolsReducer.currentToolName)
    ) {
      saveGroupsIndex(newState);
      saveGroupsData(newState);
    }
  } catch (err) {
    console.warn(err);
  }
};
