import fs from 'fs-extra';
import path from 'path-extra';
import isEqual from 'deep-equal';
import * as CheckDataLoadActions from '../actions/CheckDataLoadActions';
import { LOCAL_USER, SETTINGS_PATH } from '../common/constants';

const CHECKDATA_DIRECTORY = path.join('.apps', 'translationCore', 'checkData');

/**
 * @description saves all data in settingsReducer to the specified directory.
 * @param {object} state - object of reducers (objects).
 * @const {string} SETTINGS_PATH - directory to path where settigns is being saved.
 */
export const saveSettings = state => {
  try {
    fs.outputJsonSync(SETTINGS_PATH, state.settingsReducer, { spaces: 2 });
  } catch (err) {
    console.warn(err);
  }
};

/**
 * @description abstracted function to handle data saving.
 * @param {object} state - store state object.
 * @param {string} checkDataName - checkDate folder name where data will be saved.
 *  @example 'comments', 'reminders', 'selections', 'verseEdits' etc
 * @param {object} payload - object of data: merged contextIdReducer and commentsReducer.
 * @param {string} modifiedTimestamp - timestamp.
 */
export function saveData(state, checkDataName, payload, modifiedTimestamp) {
  try {
    let savePath = generateSavePath(state, checkDataName, modifiedTimestamp);

    if (savePath !== undefined) {
      // since contextId updates and triggers the rest to load, contextId get's updated and fires this.
      // let's not overwrite files, so check to see if it exists.
      const saveDir = path.parse(savePath).dir;
      const existingPayload = CheckDataLoadActions.loadCheckData(saveDir, payload.contextId);

      if (!fs.existsSync(savePath) && !isEqual(existingPayload, payload)) {
        fs.outputJsonSync(savePath, payload, { spaces: 2 });
      }
    } else {
      // no savepath
    }
  } catch (err) {
    console.warn(err);
  }
}


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
 * @description generates the output directory.
 * @param {object} state - store state object.
 * @param {String} checkDataName - checkDate folder name where data is saved.
 *  @example 'ECKDATA_DIRECTORY,
        checkDataName,
        bookId,
        chapter,
        verse,
        fileName.replace(/[:"]/g, '_')
      );
    }comments', 'reminders', 'selections', 'verseEdits' etc.
 * @param {String} modifiedTimestamp - timestamp.
 * that contains the specific timestamp.
 * @return {String} save path.
 */
function generateSavePath(state, checkDataName, modifiedTimestamp) {
  /**
  * @description output directory
  *  /translationCore/ar_eph_text_ulb/.apps/translationCore/checkData/comments/eph/1/3
  * @example PROJECT_SAVE_LOCATION - /translationCore/ar_eph_text_ulb
  * @example CHECKDATA_DIRECTORY - /.apps/translationCore/checkData
  * @example bookAbbreviation - /eph
  * @example checkDataName - /comments
  * @example chapter - /1
  * @example verse - /3
  */
  try {
    const PROJECT_SAVE_LOCATION = state.projectDetailsReducer.projectSaveLocation;

    if (PROJECT_SAVE_LOCATION && state && modifiedTimestamp) {
      let bookAbbreviation = state.contextIdReducer.contextId.reference.bookId;
      let chapter = state.contextIdReducer.contextId.reference.chapter.toString();
      let verse = state.contextIdReducer.contextId.reference.verse.toString();
      let fileName = modifiedTimestamp + '.json';
      let savePath = path.join(
        PROJECT_SAVE_LOCATION,
        CHECKDATA_DIRECTORY,
        checkDataName,
        bookAbbreviation,
        chapter,
        verse,
        fileName.replace(/[:"]/g, '_'),
      );
      return savePath;
    }
  } catch (err) {
    console.warn(err);
  }
}

export function saveLocalUserdata(state) {
  let userdata = state.loginReducer.userdata;

  if (userdata.localUser) {
    localStorage.setItem(LOCAL_USER, JSON.stringify(userdata));
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
