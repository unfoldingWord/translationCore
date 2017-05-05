import consts from './CoreActionConsts';
import sync from '../components/core/SideBar/GitSync.js';
import fs from 'fs-extra';
import path from 'path-extra';
import gogs from '../components/core/login/GogsApi.js';
import { remote } from 'electron';
const { dialog } = remote;
// actions
import * as getDataActions from './GetDataActions';
import { showNotification } from './NotificationActions';
import { loadGroupsDataToExport, loadProjectDataByTypeToExport } from '../utils/loadMethods';
// contant declarations
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');
import zipFolder from 'zip-folder';


/**
 * @description - Initiate a project load
 * 
 * @param {string} filePath - Path to the project to open i.e. ~/translationCore/{PROJECT_NAME}
 */
export function onLoad(filePath) {
  return ((dispatch) => {
    dispatch(getDataActions.openProject(filePath));
  })
}

/**
 * Sync project to door 43, based on currently logged in user.
 * 
 * @param {string} projectPath - Path to the project to sync
 * @param {object} manifest - manifest of the project to sync
 * @param {object} lastUser - currently logged in user
 */
export function syncProject(projectPath, manifest, lastUser) {
  return ((dispatch) => {
    var Token = api.getAuthToken('gogs');
    gogs(Token).login(lastUser).then((authenticatedUser) => {
      sync(projectPath, manifest, authenticatedUser);
      dispatch({
        type: consts.SYNC_PROJECT
      })
    }).catch(function (reason) {
      if (reason.status === 401) {
        dialog.showErrorBox('Error Uploading', 'Incorrect username or password');
      } else if (reason.hasOwnProperty('message')) {
        dialog.showErrorBox('Error Uploading', reason.message);
      } else if (reason.hasOwnProperty('data')) {
        let errorMessage = reason.data;
        dialog.showErrorBox('Error Uploading', errorMessage);
      } else {
        dialog.showErrorBox('Error Uploading', 'Unknown Error');
      }
    });
  });
}


/**
 *  Reads projects from the fs in ~/translationCore/
 */
export function getProjectsFromFolder() {
  const recentProjects = fs.readdirSync(DEFAULT_SAVE);
  return {
    type: consts.GET_RECENT_PROJECTS,
    recentProjects: recentProjects
  }
}


/**
 * @description - Wrapper function to handle exporting to CSV
 * 
 * @param {string} projectPath - Path to current project
 */
export function exportToCSV(projectPath) {
  return ((dispatch, getState) => {
    const { groupsDataReducer, remindersReducer, commentsReducer, selectionsReducer, verseEditsReducer } = getState();
    dispatch(getDataActions.openProject(projectPath, null, true));
    const params = getState().projectDetailsReducer.params;
    dispatch(getDataActions.clearPreviousData());

    let toolPaths = getToolFolderNames(projectPath);
    if (!toolPaths) dispatch(showNotification("No Projects In Folder Path", 5));
    let dataFolder = path.join(projectPath, 'apps', 'translationCore');
    var fn = function (newPaths) {
      saveAllCSVDataByToolName(newPaths[0], dataFolder, params, (result) => {
        debugger;
        newPaths.shift();
        if (newPaths.length) fn(newPaths);
        else fs.remove(path.join(dataFolder, 'output'));
      })
    }
    fn(toolPaths);
  });
}

/**
 * @description - Creates csv from object and saves it.
 * 
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 */
export function saveVerseEditsToCSV(obj, dataFolder) {
  let csvString = "after, before, tags, groupId, occurrence, quote, bookId, chapter, verse\n";
  for (var currentRow of obj) {
    let currentRowArray = [];
    currentRowArray.push(`"${currentRow.after.replace('"', '""')}"`);
    currentRowArray.push(`"${currentRow.before.replace('"', '""')}"`);
    currentRowArray.push(`"${currentRow.tags}"`);
    addContextIdToCSV(currentRowArray, currentRow.contextId)
    csvString += currentRowArray.join(',') + "\n";
  }
  fs.outputFileSync(path.join(dataFolder, 'output', 'verseEditsData.csv'), csvString);
}

/**
 * @description - Creates csv from object and saves it.
 * 
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 */
export function saveCommentsToCSV(obj, dataFolder) {
  let csvString = "text, groupId, occurrence, quote, bookId, chapter, verse\n";
  for (var currentRow of obj) {
    let currentRowArray = [];
    currentRowArray.push(currentRow.text);
    addContextIdToCSV(currentRowArray, currentRow.contextId)
    csvString += currentRowArray.join(',') + "\n";
  }
  fs.outputFileSync(path.join(dataFolder, 'output', 'commentsData.csv'), csvString);
}

/**
 * @description - Creates csv from object and saves it.
 * 
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 */
export function saveSelectionsToCSV(obj, dataFolder) {
  let csvString = "text, selection/occurrence, selection/occurrences, groupId, contextId/occurrence, quote, bookId, chapter, verse\n";
  for (var col of obj) {
    for (var currentSelection of col.selections) {
      let currentRowArray = [];
      currentRowArray.push(currentSelection.text);
      currentRowArray.push(currentSelection.occurrence);
      currentRowArray.push(currentSelection.occurrences);
      addContextIdToCSV(currentRowArray, col.contextId)
      csvString += currentRowArray.join(',') + "\n";
    }
  }
  fs.outputFileSync(path.join(dataFolder, 'output', 'selectionsData.csv'), csvString);
}

/**
 * @description - Creates csv from object and saves it.
 * 
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 */
export function saveRemindersToCSV(obj, dataFolder) {
  let csvString = "enabled, groupId, occurrence, quote, bookId, chapter, verse\n";
  for (var currentRow of obj) {
    let currentRowArray = [];
    currentRowArray.push(currentRow.enabled);
    addContextIdToCSV(currentRowArray, currentRow.contextId)
    csvString += currentRowArray.join(',') + "\n";
  }
  fs.outputFileSync(path.join(dataFolder, 'output', 'remindersData.csv'), csvString);
}

/**
 * @description - Creates csv from object and saves it.
 * 
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 */
export function saveGroupsCSVToFs(obj, dataFolder) {
  let csvString = "groupId, occurrence, quote, bookId, chapter, verse, priority\n";
  for (var col in obj) {
    for (var row in obj[col]) {
      const currentRow = obj[col][row];
      let currentRowArray = [];
      addContextIdToCSV(currentRowArray, currentRow.contextId)
      currentRowArray.push(currentRow.priority);
      csvString += currentRowArray.join(',') + "\n";
    }
  }
  fs.outputFileSync(path.join(dataFolder, 'output', 'groupsData.csv'), csvString);
}

/**
 * @description - Creates csv from object and saves it.
 * 
 * @param {object} currentRowArray - current csv row
 * @param {object} contextId - contextID object that needs to go onto the csv row
 */
export function addContextIdToCSV(currentRowArray, contextId) {
  currentRowArray.push(contextId.groupId);
  currentRowArray.push(contextId.occurrence);
  currentRowArray.push(`"${contextId.quote}"`);
  currentRowArray.push(contextId.reference.bookId);
  currentRowArray.push(contextId.reference.chapter);
  currentRowArray.push(contextId.reference.verse);
}

/**
 * @description - Gets the tool folder names
 * 
 * @param {string} projectPath 
 */
export function getToolFolderNames(projectPath) {
  try {
    return fs.readdirSync(path.join(projectPath, 'apps', 'translationCore', 'index'));
  } catch (e) {
  }
}

/**
 * 
 * @param {string} toolName - current tool name
 * @param {string} dataFolder - path of the folder to load csv from
 * @param {object} params - params of current project
 * @param {function} callback - called when all promises completed
 */
export function saveAllCSVDataByToolName(toolName, dataFolder, params, callback) {
  if (toolName == '.DS_Store') callback();
  else {
    loadGroupsDataToExport(toolName, dataFolder, params).then((obj) => saveGroupsCSVToFs(obj, dataFolder))
      .then(() => loadProjectDataByTypeToExport(dataFolder, params, 'reminders')).then((obj) => saveRemindersToCSV(obj, dataFolder))
      .then(() => loadProjectDataByTypeToExport(dataFolder, params, 'selections')).then((obj) => saveSelectionsToCSV(obj, dataFolder))
      .then(() => loadProjectDataByTypeToExport(dataFolder, params, 'comments')).then((obj) => saveCommentsToCSV(obj, dataFolder))
      .then(() => loadProjectDataByTypeToExport(dataFolder, params, 'verseEdits')).then((obj) => saveVerseEditsToCSV(obj, dataFolder))
      .then(() => saveDialog(toolName, dataFolder, callback))
  }
}

/**
 * @description - method to save csv output from user selection by dialoag
 * 
 * @param {string} toolName - current tool name
 * @param {string} dataFolder - path of the folder to load csv from
 * @param {function} callback - function to call when complete
 */
export function saveDialog(toolName, dataFolder, callback) {
  let source = path.join(dataFolder, 'output');
  let defaultPath = `${dataFolder}/${toolName}_csv.zip`;
  let title = `${toolName} CSV Save Location`;
  dialog.showSaveDialog({
    title: title,
    defaultPath: defaultPath,
    extensions: ['zip']
  }, (fileName) => {
    if (fileName) {
      zipFolder(source, fileName, function (err) {
        callback(err);
      })
    } else callback('error')
  })
}
