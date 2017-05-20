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
        let chapters = fs.readdirSync(dataPath).filter(folder => {
          return folder !== ".DS_Store";
        });
        chapters.forEach(chapterFolder => {
          let verses = fs.readdirSync(path.join(dataPath, chapterFolder)).filter(folder => {
            return folder !== ".DS_Store";
          });
          verses.forEach(verseFolder => {
            let filePath = path.join(dataPath, chapterFolder, verseFolder);
            let latestFile = loadFile(filePath);
            if (latestFile.contextId.tool === state.currentToolReducer.toolName) {
              toggleGroupDataItems(folderName, latestFile, dispatch);
            }
          });
        });
      });
    }
  });
}

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

function loadFile(loadPath) {
  let files = fs.readdirSync(loadPath);

  files = files.filter(file => { // filter the filenames to only use .json
    return path.extname(file) === '.json';
  });

  let sorted = files.sort().reverse(); // sort the files to use latest
  let readPath = path.join(loadPath, sorted[0]);
  return fs.readJsonSync(readPath);
}

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
