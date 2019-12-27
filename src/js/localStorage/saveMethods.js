import fs from 'fs-extra';
import path from 'path-extra';
import isEqual from 'deep-equal';
import { getEditedVerse, getProjectSaveLocation } from '../selectors';
import { generateTimestamp } from '../helpers';
import * as CheckDataLoadActions from '../actions/CheckDataLoadActions';

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
    fs.outputJsonSync(SETTINGS_DIRECTORY, state.settingsReducer, { spaces: 2 });
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
      ...state.commentsReducer,
    };
    let modifiedTimestamp = state.commentsReducer.modifiedTimestamp;
    saveData(state, 'comments', commentsPayload, modifiedTimestamp);
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
      ...state.selectionsReducer,
    };
    let modifiedTimestamp = state.selectionsReducer.modifiedTimestamp;
    saveData(state, 'selections', selectionsPayload, modifiedTimestamp);
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
    const {
      bookId, chapter, verse,
    } = verseEditPayload.contextId.reference;
    const fileName = verseEditPayload.modifiedTimestamp.replace(/[:"]/g, '_');
    const savePath = path.join(
      projectSaveDir,
      CHECKDATA_DIRECTORY,
      'verseEdits',
      bookId,
      chapter.toString(),
      verse.toString(),
      `${fileName}.json`
    );

    if (!fs.existsSync(savePath)) {
      fs.outputJsonSync(savePath, verseEditPayload, { spaces: 2 });
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
      ...state.remindersReducer,
    };
    let modifiedTimestamp = state.remindersReducer.modifiedTimestamp;
    saveData(state, 'reminders', remindersPayload, modifiedTimestamp);
  } catch (err) {
    console.warn(err);
  }
};

/**
  * @description This function saves the invalidated data.
  * @param {object} state - store state object.
  */
export const saveInvalidated = state => {
  try {
    let invalidatedPayload = {
      ...state.contextIdReducer,
      ...state.invalidatedReducer,
    };
    let modifiedTimestamp = state.invalidatedReducer.modifiedTimestamp;
    saveData(state, 'invalidated', invalidatedPayload, modifiedTimestamp);
  } catch (err) {
    console.warn(err);
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

/**
* saves selection data for a context that is not current
* @param {String} gatewayLanguageCode
* @param {String} gatewayLanguageQuote
* @param {Array} selections
* @param {Boolean} invalidated
* @param {String} userName
* @param {Object} contextId
*/
export const saveSelectionsForOtherContext = (state, gatewayLanguageCode, gatewayLanguageQuote, selections, invalidated, userName, contextId) => {
  const selectionData = {
    modifiedTimestamp: generateTimestamp(),
    gatewayLanguageCode,
    gatewayLanguageQuote,
    selections,
    userName,
  };
  const newState = {
    projectDetailsReducer: state.projectDetailsReducer,
    contextIdReducer: { contextId },
    selectionsReducer: selectionData,
  };
  saveSelections(newState);
  saveInvalidatedForOtherContext(state, gatewayLanguageCode, gatewayLanguageQuote, invalidated, userName, contextId); // now update invalidated
};

/**
* saves selection data for a context that is not current
* @param {String} gatewayLanguageCode
* @param {String} gatewayLanguageQuote
* @param {Boolean} invalidated
* @param {String} userName
* @param {Object} contextId
*/
export const saveInvalidatedForOtherContext = (state, gatewayLanguageCode, gatewayLanguageQuote, invalidated, userName, contextId) => {
  delete invalidated.invalidatedChecksTotal;
  delete invalidated.verseEditsTotal;
  delete invalidated.invalidatedAlignmentsTotal;
  const selectionData = {
    modifiedTimestamp: generateTimestamp(),
    gatewayLanguageCode,
    gatewayLanguageQuote,
    invalidated,
    userName,
  };
  const newState = {
    projectDetailsReducer: state.projectDetailsReducer,
    contextIdReducer: { contextId },
    invalidatedReducer: selectionData,
  };
  saveInvalidated(newState);
};
