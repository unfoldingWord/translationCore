/**
 * @module Actions/CheckDataLoad
 */

import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';
// consts declaration
const CHECKDATA_DIRECTORY = path.join('.apps', 'translationCore', 'checkData');
import {recordTargetVerseEdit} from './VerseEditActions';

/**
 * Generates the output directory.
 * @param {Object} state - store state object.
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
 * @description loads checkdata beased on given.
 * @param {String} loadPath - load path.
 * @param {object} contextId - groupData unique context Id.
 * @return {object} returns the object loaded from the file system.
 */
export function loadCheckData(loadPath, contextId) {
  let checkDataObject;

  if (loadPath && contextId && fs.existsSync(loadPath)) {
    let files = fs.readdirSync(loadPath);

    files = files.filter(file => { // filter the filenames to only use .json
      return path.extname(file) === '.json';
    });
    let sorted = files.sort().reverse(); // sort the files to use latest
    let checkDataObjects = [];

    for (let i = 0, len = sorted.length; i < len; i++) {
      const file = sorted[i];
      // get the json of all files to later filter by contextId
      try {
        let readPath = path.join(loadPath, file);
        let _checkDataObject = fs.readJsonSync(readPath);
        checkDataObjects.push(_checkDataObject);
      } catch (err) {
        console.warn('File exists but could not be loaded \n', err);
        checkDataObjects.push(undefined);
      }
    }

    checkDataObjects = checkDataObjects.filter(_checkDataObject => {
      // filter the checkDataObjects to only use the ones that match the current contextId
      let keep = _checkDataObject &&
                _checkDataObject.contextId.groupId === contextId.groupId &&
                _checkDataObject.contextId.quote === contextId.quote &&
                _checkDataObject.contextId.occurrence === contextId.occurrence;
      return keep;
    });
    // return the first one since it is the latest modified one
    checkDataObject = checkDataObjects[0];
  }
  /**
  * @description Will return undefined if checkDataObject was not populated
  * so that the load method returns and then dispatches an empty action object
  * to initialized the reducer.
  */
  return checkDataObject;
}
/**
 * Loads the latest comment file from the file system for the specify contextID.
 * @return {Object} Dispatches an action that loads the commentsReducer with data.
 */
export function loadComments() {
  return (dispatch, getState) => {
    let state = getState();
    let loadPath = generateLoadPath(state.projectDetailsReducer, state.contextIdReducer, 'comments');
    let commentsObject = loadCheckData(loadPath, state.contextIdReducer.contextId);
    if (commentsObject) {
      dispatch({
        type: consts.ADD_COMMENT,
        modifiedTimestamp: commentsObject.modifiedTimestamp,
        text: commentsObject.text,
        userName: commentsObject.userName
      });
    } else {
      // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
      dispatch({
        type: consts.ADD_COMMENT,
        modifiedTimestamp: "",
        text: "",
        userName: ""
      });
    }
  };
}
/**
 * Loads the latest invalidated file from the file system for the specify contextID.
 * @return {Object} Dispatches an action that loads the invalidatedReducer with data.
 */
export function loadInvalidated() {
  return (dispatch, getState) => {
    let state = getState();
    let loadPath = generateLoadPath(state.projectDetailsReducer, state.contextIdReducer, 'invalidated');
    let invalidatedObject = loadCheckData(loadPath, state.contextIdReducer.contextId);
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());

    if (invalidatedObject) {
      dispatch({
        type: consts.SET_INVALIDATED,
        enabled: invalidatedObject.enabled,
        userName: invalidatedObject.userName,
        modifiedTimestamp: invalidatedObject.modifiedTimestamp,
        gatewayLanguageCode,
        gatewayLanguageQuote
      });
    } else {
      // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
      dispatch({
        type: consts.SET_INVALIDATED,
        enabled: false,
        modifiedTimestamp: "",
        userName: "",
        gatewayLanguageCode: null,
        gatewayLanguageQuote: null
      });
    }
  };
}
/**
 * Loads the latest reminders file from the file system for the specify contextID.
 * @return {Object} Dispatches an action that loads the remindersReducer with data.
 */
export function loadReminders() {
  return (dispatch, getState) => {
    let state = getState();
    let loadPath = generateLoadPath(state.projectDetailsReducer, state.contextIdReducer, 'reminders');
    let remindersObject = loadCheckData(loadPath, state.contextIdReducer.contextId);
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());

    if (remindersObject) {
      dispatch({
        type: consts.SET_REMINDER,
        enabled: remindersObject.enabled,
        userName: remindersObject.userName,
        modifiedTimestamp: remindersObject.modifiedTimestamp,
        gatewayLanguageCode,
        gatewayLanguageQuote
      });
    } else {
      // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
      dispatch({
        type: consts.SET_REMINDER,
        enabled: false,
        modifiedTimestamp: "",
        userName: "",
        gatewayLanguageCode: null,
        gatewayLanguageQuote: null
      });
    }
  };
}
/**
 * Loads the latest selections file from the file system for the specific contextID.
 * @return {Object} Dispatches an action that loads the selectionsReducer with data.
 */
export function loadSelections() {
  return (dispatch, getState) => {
    let state = getState();
    let loadPath = generateLoadPath(state.projectDetailsReducer, state.contextIdReducer, 'selections');
    let selectionsObject = loadCheckData(loadPath, state.contextIdReducer.contextId);
    if (selectionsObject) {
      dispatch({
        type: consts.CHANGE_SELECTIONS,
        modifiedTimestamp: selectionsObject.modifiedTimestamp,
        selections: selectionsObject.selections,
        userName: selectionsObject.userName
      });
    } else {
      // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
      dispatch({
        type: consts.CHANGE_SELECTIONS,
        modifiedTimestamp: "",
        selections: [],
        userName: ""
      });
    }
  };
}
/**
 * Loads the latest verseEdit file from the file system for the specific
 * contextID.
 * @deprecated there is no reason to load the verse edits.
 * @return {object} Dispatches an action that loads the verseEditReducer with data.
 */
export function loadVerseEdit() {
  return (dispatch, getState) => {
    const {projectDetailsReducer, contextIdReducer} = getState();
    let loadPath = generateLoadPath(projectDetailsReducer, contextIdReducer, 'verseEdits');
    let verseEditsObject = loadCheckData(loadPath, contextIdReducer.contextId);
    if (verseEditsObject) {
      const {verseBefore, verseAfter, userName, tags, modifiedTimestamp} = verseEditsObject;
      const {bookId, chapter, verse} = contextIdReducer.contextId.reference;
      dispatch(recordTargetVerseEdit(bookId, chapter, verse, verseBefore, verseAfter, tags, userName, modifiedTimestamp, null, null, chapter, verse));
    } else {
      // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
      dispatch(recordTargetVerseEdit('', '', '', '', '', [], [], '', null, null));
    }
  };
}
