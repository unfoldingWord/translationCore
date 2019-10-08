import fs from 'fs-extra';
import path from 'path-extra';
import isEqual from 'deep-equal';
// helpers
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';
import consts from './ActionTypes';
// consts declaration
const CHECKDATA_DIRECTORY = path.join('.apps', 'translationCore', 'checkData');

/**
 * Generates the output directory.
 * @param {object} projectDetailsReducer
 * @param {object} contextIdReducer
 * @param {String} checkDataName - checkDate folder name where data will be saved.
 *  @example 'comments', 'reminders', 'selections', 'verseEdits' etc.
 * @return {String} save path
 */
export function generateLoadPath(projectDetailsReducer, contextIdReducer, checkDataName) {
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
  const PROJECT_SAVE_LOCATION = projectDetailsReducer.projectSaveLocation;

  if (PROJECT_SAVE_LOCATION) {
    let bookAbbreviation = contextIdReducer.contextId.reference.bookId;
    let chapter = contextIdReducer.contextId.reference.chapter.toString();
    let verse = contextIdReducer.contextId.reference.verse.toString();
    let loadPath = path.join(
      PROJECT_SAVE_LOCATION,
      CHECKDATA_DIRECTORY,
      checkDataName,
      bookAbbreviation,
      chapter,
      verse
    );
    return loadPath;
  }
}

/**
 * @description loads checkdata based on given contextId.
 * @param {String} loadPath - load path.
 * @param {object} contextId - groupData unique context Id.
 * @return {object} returns the object loaded from the file system.
 */
export function loadCheckData(loadPath, contextId) {
  let checkDataObject;

  if (loadPath && contextId && fs.existsSync(loadPath)) {
    let files = fs.readdirSync(loadPath);

    files = files.filter(file => // filter the filenames to only use .json
      path.extname(file) === '.json'
    );

    let sorted = files.sort().reverse(); // sort the files to put latest first
    const isQuoteArray = Array.isArray(contextId.quote);

    for (let i = 0, len = sorted.length; i < len; i++) {
      const file = sorted[i];

      // check each file for contextId
      try {
        let readPath = path.join(loadPath, file);
        let _checkDataObject = fs.readJsonSync(readPath);

        if (_checkDataObject && _checkDataObject.contextId &&
          _checkDataObject.contextId.groupId === contextId.groupId &&
          (isQuoteArray ? isEqual(_checkDataObject.contextId.quote, contextId.quote) : (_checkDataObject.contextId.quote === contextId.quote)) &&
          _checkDataObject.contextId.occurrence === contextId.occurrence) {
          checkDataObject = _checkDataObject; // return the first match since it is the latest modified one
          break;
        }
      } catch (err) {
        console.warn('File exists but could not be loaded \n', err);
      }
    }
  }
  /**
  * @description Will return undefined if checkDataObject was not populated
  * so that the load method returns and then dispatches an empty action object
  * to initialized the reducer.
  */
  return checkDataObject;
}

/**
 * @description loads checkdata based on given contextId.
 * @param {String} loadPath - load path.
 * @param {object} contextId - groupData unique context Id.
 * @return {object} returns the object loaded from the file system.
 */
export async function loadCheckDataAsync(loadPath, contextId) {
  let checkDataObject;

  if (loadPath && contextId && await fs.exists(loadPath)) {
    let files = await fs.readdir(loadPath);
    files = files.filter(file => (path.extname(file) === '.json'));
    let sorted = files.sort().reverse(); // sort the files to put latest first
    const isQuoteArray = Array.isArray(contextId.quote);
    console.log(`loadCheckDataAsync(${loadPath}) - found ${sorted.length} files`);

    for (let i = 0, len = sorted.length; i < len; i++) {
      const file = sorted[i];

      // check each file for contextId
      try {
        let readPath = path.join(loadPath, file);
        // eslint-disable-next-line no-await-in-loop
        let _checkDataObject = await fs.readJson(readPath);
        console.log(`loadCheckDataAsync() - loaded ${readPath}`, _checkDataObject);

        if (_checkDataObject && _checkDataObject.contextId &&
          _checkDataObject.contextId.groupId === contextId.groupId &&
          (isQuoteArray ? isEqual(_checkDataObject.contextId.quote, contextId.quote) : (_checkDataObject.contextId.quote === contextId.quote)) &&
          _checkDataObject.contextId.occurrence === contextId.occurrence) {
          console.log(`loadCheckDataAsync(${loadPath}) - found match`);
          checkDataObject = _checkDataObject; // return the first match since it is the latest modified one
          break;
        }
      } catch (err) {
        console.warn('File exists but could not be loaded \n', err);
      }
    }
  }
  console.log(`loadCheckDataAsync(${loadPath}) - returning`, checkDataObject);
  /**
   * @description Will return undefined if checkDataObject was not populated
   * so that the load method returns and then dispatches an empty action object
   * to initialized the reducer.
   */
  return checkDataObject;
}

/**
 * Loads the latest comment file from the file system for the specify contextID.
 * @param {Object} state - store state object.
 * @return {Object} Dispatches an action that loads the commentsReducer with data.
 */
export async function loadComments(state) {
  let commentsObject = null;

  try {
    let loadPath = generateLoadPath(state.projectDetailsReducer, state.contextIdReducer, 'comments');
    commentsObject = await loadCheckDataAsync(loadPath, state.contextIdReducer.contextId);
  } catch (e) {
    console.log(`loadComments(${state.contextIdReducer.contextId}) - failed`);
  }

  if (commentsObject) {
    return {
      type: consts.ADD_COMMENT,
      modifiedTimestamp: commentsObject.modifiedTimestamp,
      text: commentsObject.text,
      userName: commentsObject.userName,
    };
  } else {
    // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
    return {
      type: consts.ADD_COMMENT,
      modifiedTimestamp: '',
      text: '',
      userName: '',
    };
  }
}
/**
 * Loads the latest invalidated file from the file system for the specify contextID.
 * @param {Object} state - store state object.
 * @return {Object} Dispatches an action that loads the invalidatedReducer with data.
 */
export async function loadInvalidated(state) {
  let invalidatedObject = null;

  try {
    let loadPath = generateLoadPath(state.projectDetailsReducer, state.contextIdReducer, 'invalidated');
    invalidatedObject = await loadCheckDataAsync(loadPath, state.contextIdReducer.contextId);
  } catch (e) {
    console.log(`loadInvalidated(${state.contextIdReducer.contextId}) - failed`);
  }

  if (invalidatedObject) {
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote,
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(state);

    return {
      type: consts.SET_INVALIDATED,
      enabled: invalidatedObject.enabled,
      userName: invalidatedObject.userName,
      modifiedTimestamp: invalidatedObject.modifiedTimestamp,
      gatewayLanguageCode,
      gatewayLanguageQuote,
    };
  } else {
    // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
    return {
      type: consts.SET_INVALIDATED,
      enabled: false,
      modifiedTimestamp: '',
      userName: '',
      gatewayLanguageCode: null,
      gatewayLanguageQuote: null,
    };
  }
}
/**
 * Loads the latest reminders file from the file system for the specify contextID.
 * @param {Object} state - store state object.
 * @return {Object} Dispatches an action that loads the remindersReducer with data.
 */
export async function loadReminders(state) {
  let remindersObject = null;

  try {
    const loadPath = generateLoadPath(state.projectDetailsReducer, state.contextIdReducer, 'reminders');
    remindersObject = await loadCheckDataAsync(loadPath, state.contextIdReducer.contextId);
  } catch (e) {
    console.log(`loadReminders(${state.contextIdReducer.contextId}) - failed`);
  }

  if (remindersObject) {
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote,
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(state);
    return {
      type: consts.SET_REMINDER,
      enabled: remindersObject.enabled,
      userName: remindersObject.userName,
      modifiedTimestamp: remindersObject.modifiedTimestamp,
      gatewayLanguageCode,
      gatewayLanguageQuote,
    };
  } else {
    // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
    return {
      type: consts.SET_REMINDER,
      enabled: false,
      modifiedTimestamp: '',
      userName: '',
      gatewayLanguageCode: null,
      gatewayLanguageQuote: null,
    };
  }
}
/**
 * Loads the latest selections file from the file system for the specific contextID.
 * @param {Object} state - store state object.
 * @return {Object} Dispatches an action that loads the selectionsReducer with data.
 */
export async function loadSelections(state) {
  let selectionsObject = null;

  try {
    const loadPath = generateLoadPath(state.projectDetailsReducer, state.contextIdReducer, 'selections');
    selectionsObject = await loadCheckDataAsync(loadPath, state.contextIdReducer.contextId);
  } catch (e) {
    console.log(`loadSelections(${state.contextIdReducer.contextId}) - failed`);
  }

  if (selectionsObject) {
    const {
      selections,
      modifiedTimestamp,
      nothingToSelect,
      userName,
      gatewayLanguageCode,
      gatewayLanguageQuote,
    } = selectionsObject;

    return {
      type: consts.CHANGE_SELECTIONS,
      selections: selections,
      nothingToSelect: nothingToSelect,
      userName: userName,
      modifiedTimestamp: modifiedTimestamp,
      gatewayLanguageCode: gatewayLanguageCode,
      gatewayLanguageQuote: gatewayLanguageQuote,
    };
  } else {
    // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
    return {
      type: consts.CHANGE_SELECTIONS,
      modifiedTimestamp: null,
      selections: [],
      userName: null,
    };
  }
}
