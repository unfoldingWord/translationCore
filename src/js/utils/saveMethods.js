 /**
 * @description this file holds all methods that handle saving/persisting data in the
 *  file system add your methods as need and then import them into localstorage.js
 */
import fs from 'fs-extra';
import path from 'path-extra';
// consts declaration
const PARENT = path.datadir('translationCore');
const SETTINGS_DIRECTORY = path.join(PARENT, 'settings.json');
const MODULES_SETTINGS_DIRECTORY = path.join(PARENT, 'modulesSettings.json');
const RESOURCES_DATA_DIR = path.join('.apps', 'translationCore', 'resources');
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
 * @description save all the modules settings in a json file in the specified directory.
 * @param {object} state - object of reducers (objects).
 * @const {string} MODULES_SETTINGS_DIRECTORY - directory where module settigns is being saved.
 */
export const saveModuleSettings = state => {
  try {
    fs.outputJsonSync(MODULES_SETTINGS_DIRECTORY, state.modulesSettingsReducer);
  } catch (err) {
    console.warn(err);
  }
};
/**
 * @description this function saves bibles, tN and tW reosuces into the file system.
 * @param {object} state - store state object.
 */
export const saveResources = state => {
  try {
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
        fs.outputJsonSync(savePath, biblesObject[keyName]);
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
            fs.outputJsonSync(savePath, resourcesObject[resources][file]);
          }
        }
      }
    }
  } catch (err) {
    console.warn(err)
  }
};

/**
 * @description abstracted function to hanlde data saving.
 * @param {object} state - store state object.
 * @param {string} checkDataName - checkDate folder name where data will be saved.
 *  @example 'comments', 'reminders', 'selections', 'verseEdits' etc
 * @param {object} payload - object of data: merged contextIdReducer and commentsReducer.
 * @param {sting} modifiedTimestamp - timestamp.
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
 *@description recursively generetes directory to fix windows specific issue.
 *@param {string} path - filepath of where you want to create a directory
 *@param {function} callback - callback function.
 */

function mkdirRecursive(path, callback) {
  let controlledPaths = []
  let paths = path.split(
    '/' // Put each path in an array
  ).filter(
    p => p != '.' // Skip root path indicator (.)
  ).reduce((memo, item) => {
    // Previous item prepended to each item so we preserve realpaths
    const prevItem = memo.length > 0 ? memo.join('/').replace(/\.\//g, '')+'/' : ''
    controlledPaths.push('./'+prevItem+item)
    return [...memo, './'+prevItem+item]
  }, []).map(dir => {
    fs.mkdir(dir, err => {
      if (err && err.code != 'EEXIST') throw err
      // Delete created directory (or skipped) from controlledPath
      controlledPaths.splice(controlledPaths.indexOf(dir), 1)
      if (controlledPaths.length === 0) {
        return callback()
      }
    })
  })
}

/**
 * @description generates the output directory.
 * @param {object} state - store state object.
 * @param {string} checkDataName - checkDate folder name where data is saved.
 *  @example 'comments', 'reminders', 'selections', 'verseEdits' etc.
 * @param {string} modifiedTimestamp - timestamp.
 * that contains the specific timestamp.
 * @return {string} save path.
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
    console.warn(err)
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
    console.warn(err)
  }
};
 /**
 * @description This function saves the verse Edit data.
 * @param {object} state - store state object.
 */
export const saveVerseEdit = state => {
  try {
    let verseEditPayload = {
      ...state.contextIdReducer,
      ...state.verseEditReducer
    };
    let modifiedTimestamp = state.verseEditReducer.modifiedTimestamp;
    saveData(state, "verseEdits", verseEditPayload, modifiedTimestamp);
  } catch (err) {
    console.warn(err)
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
    console.warn(err)
  }
};
/**
 * @description saves the groups index array in the file system.
 * @param {object} state - store state object.
 */
export const saveGroupsIndex = state => {
  try {
    const PROJECT_SAVE_LOCATION = state.projectDetailsReducer.projectSaveLocation;
    let toolName = state.contextIdReducer.contextId ?
               state.contextIdReducer.contextId.tool : undefined;
    let fileName = "index.json";
    let groupsIndex = state.groupsIndexReducer.groupsIndex;
    // Not saving if the array is empty.
    // without this if it will overwrite the data in the filesystem.
    if (groupsIndex.length > 0) {
      if (toolName && PROJECT_SAVE_LOCATION && groupsIndex) {
        let savePath = path.join(PROJECT_SAVE_LOCATION, INDEX_DIRECTORY, toolName, fileName);
        fs.outputJsonSync(savePath, groupsIndex);
      } else {
        // saveGroupsIndex: missing required data
      }
    }
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
    let toolName = state.contextIdReducer.contextId ?
               state.contextIdReducer.contextId.tool : undefined;
    let bookAbbreviation = state.contextIdReducer.contextId ?
                           state.contextIdReducer.contextId.reference.bookId : undefined;
    if (PROJECT_SAVE_LOCATION && toolName && bookAbbreviation) {
      let groupsData = state.groupsDataReducer.groupsData;
      for (let groupID in groupsData) {
        let fileName = groupID + ".json";
        let savePath = path.join(PROJECT_SAVE_LOCATION, INDEX_DIRECTORY, toolName, bookAbbreviation, fileName);
        fs.outputJsonSync(savePath, groupsData[groupID]);
      }
    } else {
      // saveGroupsData: missing required data
    }
  } catch (err) {
    console.warn(err);
  }
};
/**
 * @description saves the contextId data.
 * @param {object} state - store state object.
 */
export const saveContextId = (state, contextId) => {
  try {
    let {projectSaveLocation} = state.projectDetailsReducer
    let toolName = contextId ? contextId.tool : undefined
    let bookId = contextId ? contextId.reference.bookId : undefined
    if (projectSaveLocation && toolName && bookId) {
      let fileName = "contextId.json"
      let savePath = path.join(projectSaveLocation, INDEX_DIRECTORY, toolName, bookId, "currentContextId", fileName)
      fs.outputJsonSync(savePath, contextId)
    } else {
      // saveCurrentContextId: missing required data
    }
  } catch (err) {
    console.warn(err)
  }
};

export function saveLocalUserdata(state) {
  let userdata = state.loginReducer.userdata;

  if (userdata.localUser) {
    localStorage.setItem('localUser', JSON.stringify(userdata));
  }
}
