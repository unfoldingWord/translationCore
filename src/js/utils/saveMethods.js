 /**
 * @description this file holds all methods that handle saving/persisting data in the
 *  file system add your methods as need and then import them into localstorage.js
 */

import fs from 'fs-extra';
import path from 'path-extra';
// consts declaration
const PARENT = path.datadir('translationCore');
const SETTINGS_DIRECTORY = path.join(PARENT, 'settings.json');
const RESOURCES_DATA_DIR = path.join('apps', 'translationCore', 'resources');
const CHECKDATA_DIRECTORY = path.join('apps', 'translationCore', 'checkData');

/**
 * @description saves all data in settingsReducer to the specified directory.
 * @param {object} state - object of reducers (objects).
 * @const {string} SETTINGS_DIRECTORY - directory to path where settigns is being saved.
 */
export const saveSettings = state => {
  fs.outputJson(SETTINGS_DIRECTORY, state.settingsReducer);
};

export const saveResources = state => {
  const PROJECT_SAVE_LOCATION = state.projectDetailsReducer.projectSaveLocation;
  let biblesObject = state.resourcesReducer.bibles;
  let resourcesObject = state.resourcesReducer.resources;
  if (PROJECT_SAVE_LOCATION) {
    for (var keyName in biblesObject) {
      let bibleVersion = keyName + '.json';
      let savePath = path.join(
        PROJECT_SAVE_LOCATION,
        RESOURCES_DATA_DIR,
        'bibles',
        bibleVersion
      );
      fs.outputJson(savePath, biblesObject[keyName]);
    }
    if (PROJECT_SAVE_LOCATION) {
      for (var resources in resourcesObject) {
        for (var file in resourcesObject[resources]) {
          let savePath = path.join(
            PROJECT_SAVE_LOCATION,
            RESOURCES_DATA_DIR,
            resources,
            file
          );
          fs.outputJson(savePath, resourcesObject[resources][file]);
        }
      }
    }
  }
};

/**
 * @description abstracted function to hanlde data saving.
 * @param {object} state - store state object.
 * @param {string} checkDataName - checkDate folder name where data will be saved.
 *  @example 'comments', 'reminders', 'selections', 'verseEdits' etc
 * @param {object} payload - object of data: merged contextIdReducer and commentsReducer.
 */
function saveData(state, checkDataName, payload) {
  try {
    let savePath = generateSavePath(state, checkDataName);
    fs.outputJson(savePath, payload);
  } catch (err) {
    console.warn(err);
  }
}

/**
 * @description generates the output directory.
 * @param {object} state - store state object.
 * @param {string} checkDataName - checkDate folder name where data will be saved.
 *  @example 'comments', 'reminders', 'selections', 'verseEdits' etc.
 * @return {string} save path
 */
function generateSavePath(state, checkDataName) {
  /**
  * @description output directory
  *  /translationCore/ar_eph_text_ulb/apps/translationCore/checkData/comments/eph/1/3
  * @example PROJECT_SAVE_LOCATION - /translationCore/ar_eph_text_ulb
  * @example CHECKDATA_DIRECTORY - /apps/translationCore/checkData
  * @example bookAbbreviation - /eph
  * @example checkDataName - /comments
  * @example chapter - /1
  * @example verse - /3
  */
  const PROJECT_SAVE_LOCATION = state.projectDetailsReducer.projectSaveLocation;
  if (PROJECT_SAVE_LOCATION && state) {
    let bookAbbreviation = state.contextIdReducer.contextId.reference.bookId;
    let chapter = state.contextIdReducer.contextId.reference.chapter.toString();
    let verse = state.contextIdReducer.contextId.reference.verse.toString();
    let fileName = state.commentsReducer.modifiedTimestamp + '.json';
    let savePath = path.join(
      PROJECT_SAVE_LOCATION,
      CHECKDATA_DIRECTORY,
      checkDataName,
      bookAbbreviation,
      chapter,
      verse,
      fileName
    );
    return savePath;
  }
}

/**
 * @param {object} state - store state object.
 */
export const saveComments = state => {
  let commentsPayload = {
    ...state.contextIdReducer,
    ...state.commentsReducer
  };
  saveData(state, "comments", commentsPayload);
};




