import fs from 'fs-extra';
import path from 'path-extra';
import isEqual from 'deep-equal';

const PARENT = path.datadir('translationCore');
const SETTINGS_DIRECTORY = path.join(PARENT, 'settings.json');
const INDEX_DIRECTORY = path.join('.apps', 'translationCore', 'index');

/**
 * @description saves all data in settingsReducer to the specified directory.
 * @param {object} state - object of reducers (objects).
 * @const {string} SETTINGS_DIRECTORY - directory to path where settigns is being saved.
 */
export const saveSettings = state => {
  try {
    fs.outputJsonSync(SETTINGS_DIRECTORY, state.settingsReducer, { spaces: 2 });
  } catch (err) {
    console.warn(err);
  }
};

/**
 * @description this function saves the current target language chapter into the file system.
 * @param {object} state - store state object.
 */
export const saveTargetLanguage = state => {
  const PROJECT_SAVE_LOCATION = state.projectDetailsReducer.projectSaveLocation;
  const bookAbbr = state.projectDetailsReducer.manifest.project.id;
  let currentTargetLanguageChapters = state.resourcesReducer.bibles.targetLanguage.targetBible;

  if (PROJECT_SAVE_LOCATION && bookAbbr && currentTargetLanguageChapters) {
    for (const chapter in currentTargetLanguageChapters) {
      const fileName = chapter + '.json';
      const savePath = path.join(PROJECT_SAVE_LOCATION, bookAbbr, fileName);
      const chapterData = currentTargetLanguageChapters[chapter];

      try {
        fs.outputJsonSync(savePath, chapterData, { spaces: 2 });
      } catch (err) {
        console.warn(err);
      }
    }
  }
};

/**
 * @description saves the groups data by groupId name.
 * @param {object} state - store state object.
 * @param {object} prevState - previous store state object.
 */
export const saveGroupsData = (state, prevState) => {
  try {
    const PROJECT_SAVE_LOCATION = state.projectDetailsReducer.projectSaveLocation;
    const toolName = state.contextIdReducer.contextId ?
      state.contextIdReducer.contextId.tool : undefined;
    const bookAbbreviation = state.contextIdReducer.contextId ?
      state.contextIdReducer.contextId.reference.bookId : undefined;

    if (PROJECT_SAVE_LOCATION && toolName && bookAbbreviation) {
      const groupsData = state.groupsDataReducer.groupsData;
      const oldGroupsData = prevState.groupsDataReducer.groupsData;

      for (const groupID in groupsData) {
        if (groupsData[groupID] && !isEqual(groupsData[groupID], oldGroupsData[groupID])) {
          const fileName = groupID + '.json';
          const savePath = path.join(PROJECT_SAVE_LOCATION, INDEX_DIRECTORY, toolName, bookAbbreviation, fileName);
          fs.outputJsonSync(savePath, groupsData[groupID], { spaces: 2 });
        }
      }
    } else {
      // saveGroupsData: missing required data
    }
  } catch (err) {
    console.warn(err);
  }
};

export function saveLocalUserdata(state) {
  let userdata = state.loginReducer.userdata;

  if (userdata.localUser) {
    localStorage.setItem('localUser', JSON.stringify(userdata));
  }
}

/**
 * saves the current project's manifest file when the manifest state is changed.
 * @param {object} state - app state.
 */
export function saveProjectManifest(state) {
  const { manifest, projectSaveLocation } = state.projectDetailsReducer;

  if (projectSaveLocation && manifest && Object.keys(manifest).length > 0) {
    const fileName = 'manifest.json';
    const savePath = path.join(projectSaveLocation, fileName);
    fs.outputJsonSync(savePath, manifest, { spaces: 2 });
  }
}

/**
  * saves the current project's settings file when the settings state is changed.
  * @param {object} state - app state.
  */
export function saveProjectSettings(state) {
  const { settings, projectSaveLocation } = state.projectDetailsReducer;

  if (projectSaveLocation && settings && Object.keys(settings).length > 0) {
    const fileName = 'settings.json';
    const savePath = path.join(projectSaveLocation, fileName);
    fs.outputJsonSync(savePath, settings, { spaces: 2 });
  }
}
