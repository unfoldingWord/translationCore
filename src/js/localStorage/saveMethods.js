 /**
 * @description this file holds all methods that handle saving/persisting data in the
 *  file system add your methods as need and then import them into localstorage.js
 */

import fs from 'fs-extra';
import path from 'path-extra';
import {getEditedVerse, getProjectSaveLocation} from '../selectors';

const PARENT = path.datadir('translationCore');
const SETTINGS_DIRECTORY = path.join(PARENT, 'settings.json');
const CHECKDATA_DIRECTORY = path.join('.apps', 'translationCore', 'checkData');
const INDEX_DIRECTORY = path.join('.apps', 'translationCore', 'index');
/**
 * @description saves all data in settingsReducer to the specified directory.
 * @param {object} state - object of reducers (objects).
 * @const {string} SETTINGS_DIRECTORY - directory to path where settigns is being saved.
 */
export const saveSettings = state => {
  try {
    fs.outputJsonSync(SETTINGS_DIRECTORY, state.settingsReducer);
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
function saveData(state, checkDataName, payload, modifiedTimestamp) {
  try {
    let savePath = generateSavePath(state, checkDataName, modifiedTimestamp);
    if (savePath !== undefined) {
      // since contextId updates and triggers the rest to load, contextId get's updated and fires this.
      // let's not overwrite files, so check to see if it exists.
      if (!fs.existsSync(savePath)) {
        fs.outputJsonSync(savePath, payload, err => {console.log(err)});
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
      for (let chapter in currentTargetLanguageChapters) {
        const fileName = chapter + '.json';
        const savePath = path.join(PROJECT_SAVE_LOCATION, bookAbbr, fileName);
        const chapterData = currentTargetLanguageChapters[chapter];
        try {
          fs.outputJsonSync(savePath, chapterData);
        } catch (err) {
          console.warn(err);
        }
      }
    }
};

/**
 * @description this function saves the current alignmentData into the file system.
 * @param {object} state - store state object.
 */
export const saveAlignmentData = state => {
  const {projectDetailsReducer, wordAlignmentReducer} = state;
  const {projectSaveLocation, manifest} = projectDetailsReducer;
  const bookAbbr = manifest.project.id;
  const {alignmentData} = wordAlignmentReducer;

  if (projectSaveLocation && bookAbbr && alignmentData) {
      for (let chapter in alignmentData) {
        const alignmentDataPath = path.join('.apps', 'translationCore', 'alignmentData');
        const filePath = path.join(alignmentDataPath, bookAbbr, chapter + '.json');
        const savePath = path.join(projectSaveLocation, filePath);
        const chapterData = alignmentData[chapter];
        try {
          fs.outputFileSync(savePath, JSON.stringify(chapterData, null, 2));
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
          fileName.replace(/[:"]/g, '_')
      );
      return savePath;
    }
  } catch (err) {
    console.warn(err);
  }
}

/**
 * @description This function saves the comments data.
 * @param {object} state - store state object.
 */
export const saveComments = state => {
  try {
    let commentsPayload = {
      ...state.contextIdReducer,
      ...state.commentsReducer
    };
    let modifiedTimestamp = state.commentsReducer.modifiedTimestamp;
    saveData(state, "comments", commentsPayload, modifiedTimestamp);
  } catch (err) {
    console.warn(err);
  }
};

/**
 * @description This function saves the selections data.
 * @param {Object} state - The state object courtesy of the store
 */
export const saveSelections = state => {
  try {
    let selectionsPayload = {
      ...state.contextIdReducer,
      ...state.selectionsReducer
    };
    let modifiedTimestamp = state.selectionsReducer.modifiedTimestamp;
    saveData(state, "selections", selectionsPayload, modifiedTimestamp);
  } catch (err) {
    console.warn(err);
  }
};
 /**
 * @description This function saves the verse Edit data.
 * @param {object} state - store state object.
 */
export const saveVerseEdit = state => {
  try {
    const projectSaveDir = getProjectSaveLocation(state);
    const verseEditPayload = getEditedVerse(state, state.contextIdReducer.contextId.tool);
    const {bookId, chapter, verse} = verseEditPayload.contextId.reference;
    const fileName = verseEditPayload.modifiedTimestamp.replace(/[:"]/g, '_');
    const savePath = path.join(
      projectSaveDir,
      CHECKDATA_DIRECTORY,
      "verseEdits",
      bookId,
      chapter.toString(),
      verse.toString(),
      `${fileName}.json`
    );
    if(!fs.existsSync(savePath)) {
      fs.outputJsonSync(savePath, verseEditPayload, err => {console.log(err)});
    }
  } catch (err) {
    console.warn(err);
  }
};

/**
 * @description This function saves the reminders data.
 * @param {object} state - store state object.
 */
export const saveReminders = state => {
  try {
    let remindersPayload = {
      ...state.contextIdReducer,
      ...state.remindersReducer
    };
    let modifiedTimestamp = state.remindersReducer.modifiedTimestamp;
    saveData(state, "reminders", remindersPayload, modifiedTimestamp);
  } catch (err) {
    console.warn(err);
  }
};
/**
 * @description saves the groups data by groupId name.
 * @param {object} state - store state object.
 */
export const saveGroupsData = state => {
  try {
    const PROJECT_SAVE_LOCATION = state.projectDetailsReducer.projectSaveLocation;
    let currentToolName = state.contextIdReducer.contextId ?
               state.contextIdReducer.contextId.tool : undefined;
    let bookAbbreviation = state.contextIdReducer.contextId ?
                           state.contextIdReducer.contextId.reference.bookId : undefined;
    if (PROJECT_SAVE_LOCATION && currentToolName && bookAbbreviation) {
      let groupsData = state.groupsDataReducer.groupsData;
      for (let groupID in groupsData) {
        let fileName = groupID + ".json";
        let savePath = path.join(PROJECT_SAVE_LOCATION, INDEX_DIRECTORY, currentToolName, bookAbbreviation, fileName);
        fs.outputJsonSync(savePath, groupsData[groupID]);
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
 * saves the current projects manifest file when the manifest state is changed.
 * @param {object} state - app state.
 */
export function saveProjectManifest(state) {
  const { manifest, projectSaveLocation } = state.projectDetailsReducer;
  const fileName = 'manifest.json';
  const savePath = path.join(projectSaveLocation, fileName);

  fs.outputJsonSync(savePath, manifest);
}
