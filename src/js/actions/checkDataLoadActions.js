import consts from '../actions/CoreActionConsts';
import fs from 'fs-extra';
import path from 'path-extra';
// consts declaration
const CHECKDATA_DIRECTORY = path.join('apps', 'translationCore', 'checkData');

/**
 * @description generates the output directory.
 * @param {object} state - store state object.
 * @param {string} checkDataName - checkDate folder name where data will be saved.
 *  @example 'comments', 'reminders', 'selections', 'verseEdits' etc.
 * @return {string} save path
 */
function generateLoadPath(state, checkDataName) {
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
 * @param {string} loadPath - load path.
 * @return {object} returns the object loaded from the file system.
 */
function loadCheckData(loadPath) {
  try {
    let files = fs.readdirSync(loadPath);
    let ext = '.json';
    let fileName = '';
    let sorted = files.sort((a, b) => {
      if (path.extname(a) === ext && path.extname(b) === ext) {
        // Turn strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(b) - new Date(a);
      }
    });
    sorted.forEach((file, index) => {
      if (path.extname(file) === ext && index === files.length - 1) {
        fileName = file;
      }
    });
    let readPath = path.join(loadPath, fileName);
    console.log(readPath)
    let checkDataObject = fs.readJsonSync(readPath);
    return checkDataObject;
  } catch (err) {
    /**
     * @description Will return undefined so that the load method returns and then
     * dispatches an empty action object to initialized the reducer.
     */
    console.warn('No file found in the directory therefore an empty reducer will be initialiazed instead \n', err);
    return undefined;
  }
}
/**
 * @description loads the latest comment file from the file system for the specify
 * contextID.
 * @return {object} Dispatches an action that loads the commentsReducer with data.
 */
export function loadComments() {
  return (dispatch, getState) => {
    let state = getState();
    let loadPath = generateLoadPath(state, 'comments');
    let commentsObject = loadCheckData(loadPath);
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
 * @description loads the latest reminders file from the file system for the specify
 * contextID.
 * @return {object} Dispatches an action that loads the remindersReducer with data.
 */
export function loadReminders() {
  return (dispatch, getState) => {
    let state = getState();
    let loadPath = generateLoadPath(state, 'reminders');
    let remindersObject = loadCheckData(loadPath);
    if (remindersObject) {
      dispatch({
        type: consts.TOGGLE_REMINDER,
        modifiedTimestamp: remindersObject.modifiedTimestamp,
        userName: remindersObject.userName
      });
    } else {
      // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
      dispatch({
        type: consts.TOGGLE_REMINDER,
        modifiedTimestamp: "",
        userName: ""
      });
    }
  };
}
/**
 * @description loads the latest selections file from the file system for the specify
 * contextID.
 * @return {object} Dispatches an action that loads the selectionsReducer with data.
 */
export function loadSelections() {
  return (dispatch, getState) => {
    let state = getState();
    let loadPath = generateLoadPath(state, 'selections');
    let selectionsObject = loadCheckData(loadPath);
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
 * @description loads the latest verseEdit file from the file system for the specify
 * contextID.
 * @return {object} Dispatches an action that loads the verseEditReducer with data.
 */
export function loadVerseEdit() {
  return (dispatch, getState) => {
    let state = getState();
    let loadPath = generateLoadPath(state, 'verseEdits');
    let verseEditsObject = loadCheckData(loadPath);
    if (verseEditsObject) {
      dispatch({
        type: consts.ADD_VERSE_EDIT,
        before: verseEditsObject.before,
        after: verseEditsObject.after,
        tags: verseEditsObject.tags,
        userName: verseEditsObject.userName,
        modifiedTimestamp: verseEditsObject.modifiedTimestamp
      });
    } else {
      // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
      dispatch({
        type: consts.ADD_VERSE_EDIT,
        before: "",
        after: "",
        tags: [],
        userName: [],
        modifiedTimestamp: ""
      });
    }
  };
}
