import consts from '../actions/CoreActionConsts';
import fs from 'fs-extra';
import path from 'path-extra';
// consts declaration
const CHECKDATA_DIRECTORY = path.join('.apps', 'translationCore', 'checkData');

/**
 * @description This action adds a groupId as a property to the
 *  groups object and assigns payload as its value.
 * @param {string} groupId - groupId of object ex. figs_metaphor.
 * @param {array} groupsData - array of objects containing group data.
 * @return {object} action object.
 */
export const addGroupData = (groupId, groupsData) => {
  return {
    type: consts.ADD_GROUP_DATA,
    groupId,
    groupsData
  };
};

export const loadGroupsDataFromFS = allGroupsData => {
  return {
    type: consts.LOAD_GROUPS_DATA_FROM_FS,
    allGroupsData
  };
};
/**
 * @description verifies that the data in the checkdata folder is reflected in the menu.
 * @return {object} action object.
 */
export function verifyGroupDataMatchesWithFs() {
  return ((dispatch, getState) => {
    let state = getState();
    const PROJECT_SAVE_LOCATION = state.projectDetailsReducer.projectSaveLocation;
    let checkDataPath;
    if (PROJECT_SAVE_LOCATION) {
      checkDataPath = path.join(
        PROJECT_SAVE_LOCATION,
        CHECKDATA_DIRECTORY
      );
    }
    if (fs.existsSync(checkDataPath)) {
      let folders = fs.readdirSync(checkDataPath).filter(folder => {
        return folder !== ".DS_Store";
      });
      folders.forEach(folderName => {
        let dataPath = generatePathToDataItems(state, PROJECT_SAVE_LOCATION, folderName);
        let chapters = fs.readdirSync(dataPath);
        chapters = filterAndSort(chapters);
        chapters.forEach(chapterFolder => {
          let verses = fs.readdirSync(path.join(dataPath, chapterFolder));
          verses = filterAndSort(verses);
          verses.forEach(verseFolder => {
            let filePath = path.join(dataPath, chapterFolder, verseFolder);
            let latestObjects = getUniqueObjectsFromFolder(filePath);
            latestObjects.forEach(object => {
              if (object.contextId.tool === state.currentToolReducer.toolName) {
                toggleGroupDataItems(folderName, object, dispatch);
              }
            });
          });
        });
      });
    }
  });
}
/**
 * @description generates a path to a check data item.
 * @param {object} state - redux store state.
 * @param {string} PROJECT_SAVE_LOCATION - project path/directory.
 * @param {string} checkDataName - comments, reminders, selections and verseEdits folders.
 * @return {string} path/directory to be use to load a file.
 */
function generatePathToDataItems(state, PROJECT_SAVE_LOCATION, checkDataName) {
  if (PROJECT_SAVE_LOCATION && state) {
    let bookAbbreviation = state.projectDetailsReducer.params.bookAbbr;
    let loadPath = path.join(
      PROJECT_SAVE_LOCATION,
      CHECKDATA_DIRECTORY,
      checkDataName,
      bookAbbreviation
    );
    return loadPath;
  }
}
/**
 * @description filters and sorts an array.
 * @param {array} array - array to be filtered and sorted.
 * @return {array} filtered and sorted array.
 */
function filterAndSort(array) {
  let filteredArray = array.filter(folder => {
    return folder !== ".DS_Store";
  }).sort((a, b) => {
    a = parseInt(a, 10);
    b = parseInt(b, 10);
    return a - b;
  });
  return filteredArray;
}
/**
 * @description gets the objects with the latest timestamp and a unique groupID.
 * @param {string} loadPath - path or directory where check data is saved.
 * @return {array} array of check data objects with latest timestamp and a unique groupID.
 */
function getUniqueObjectsFromFolder(loadPath) {
  let files = fs.readdirSync(loadPath);
  let uniqueCheckDataObjects = [];

  files = files.filter(file => { // filter the filenames to only use .json
    return path.extname(file) === '.json';
  });

  let sorted = files.sort().reverse(); // sort the files to use latest
  let checkDataObjects = sorted.map(file => {
    // get the json of all files
    try {
      let readPath = path.join(loadPath, file)
      let _checkDataObject = fs.readJsonSync(readPath)
      return _checkDataObject;
    } catch (err) {
      console.warn('File exists but could not be loaded \n', err);
      return undefined;
    }
  });

  checkDataObjects.forEach(element => {
    let checkDataObjectsWithSameGroupId = checkDataObjects.filter(_checkDataObject => {
      // filter the checkDataObjects to unique grouId array
      let keep = _checkDataObject.contextId.groupId === element.contextId.groupId && !contains(_checkDataObject, uniqueCheckDataObjects);
      return keep;
    });
    if (checkDataObjectsWithSameGroupId[0]) {
      // return the first one since it is the latest modified one
      uniqueCheckDataObjects.push(checkDataObjectsWithSameGroupId[0]);
    }
    // filter out all checkDataObjects that are already in checkDataObjectsWithSameGroupId.
    checkDataObjects = checkDataObjects.filter(_checkDataObject => {
      return _checkDataObject.contextId.groupId !== element.contextId.groupId;
    });
    // clearing checkDataObjectsWithSameGroupId in order to reuse it for next checkdata object
    checkDataObjectsWithSameGroupId = [];
  });
  return uniqueCheckDataObjects;
}
/**
 * @description returns boolean indicating if object was found in the array (arrayToBeChecked).
 * @param {object} object - obect to check if is included in array.
 * @param {array} arrayToBeChecked - array compare against if object is included.
 * @return {boolean} - true/false: is it included or not.
 */
function contains(object, arrayToBeChecked) {
  let included = arrayToBeChecked.indexOf(object);
  return included >= 0 ? true : false;
}

/**
 * @description dispatches appropiate action based on label string.
 * @param {string} label - string to be use to determine which action to dispatch.
 * @param {object} fileObject - checkdata object.
 * @param {function} dispatch - redux action dispatcher.
 */
function toggleGroupDataItems(label, fileObject, dispatch) {
  switch (label) {
    case "comments":
      dispatch({
        type: consts.TOGGLE_COMMENTS_IN_GROUPDATA,
        contextId: fileObject.contextId,
        text: fileObject.text
      });
      break;
    case "reminders":
      dispatch({
        type: consts.SET_REMINDERS_IN_GROUPDATA,
        contextId: fileObject.contextId,
        boolean: fileObject.enabled
      });
      break;
    case "selections":
      dispatch({
        type: consts.TOGGLE_SELECTIONS_IN_GROUPDATA,
        contextId: fileObject.contextId,
        selections: fileObject.selections
      });
      break;
    case "verseEdits":
      dispatch({
        type: consts.TOGGLE_VERSE_EDITS_IN_GROUPDATA,
        contextId: fileObject.contextId
      });
      break;
    default:
      console.warn("Undefined label in toggleGroupDataItems switch");
      break;
  }
}
