import consts from './CoreActionConsts';
import sync from '../components/core/SideBar/GitSync.js';
import fs from 'fs-extra';
import path from 'path-extra';
import gogs from '../components/core/login/GogsApi.js';
import { remote } from 'electron';
const { dialog } = remote;
// actions
import * as getDataActions from './GetDataActions';
import { loadGroupsData, loadProjectDataByType } from '../utils/loadMethods';
// contant declarations
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');
import zipFolder from 'zip-folder';
import { remote } from 'electron';
const { dialog } = remote;

export function onLoad(filePath) {
  return ((dispatch) => {
    dispatch(getDataActions.openProject(filePath));
  })
}

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

export function getProjectsFromFolder() {
  const recentProjects = fs.readdirSync(DEFAULT_SAVE);
  return {
    type: consts.GET_RECENT_PROJECTS,
    recentProjects: recentProjects
  }
}

export function exportToCSV(projectPath, callback) {
  return ((dispatch, getState) => {
    const { groupsDataReducer, remindersReducer, commentsReducer, selectionsReducer, verseEditsReducer, projectDetailsReducer } = getState();
    let manifest = getDataActions.setUpManifestAndParams(projectPath);
    dispatch(getDataActions.addLoadedProjectToStore(projectPath, manifest));
    const params = getState().projectDetailsReducer.params;
    dispatch(getDataActions.clearPreviousData());

    let toolPaths = getToolFolderNames(projectPath);
    if (!toolPaths) callback('Could Not Find Data To Export')
    let dataFolder = path.join(projectPath, 'apps', 'translationCore');
    var fn = function (newPaths) {
      saveAllCSVDataByToolName(newPaths[0], dataFolder, params, (result) => {
        newPaths.shift();
        if (newPaths.length) fn(newPaths)
        else fs.remove(path.join(dataFolder, 'output'));
      })
    }
    fn(toolPaths);
  });
}

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

export function addContextIdToCSV(currentRowArray, contextId) {
  currentRowArray.push(contextId.groupId);
  currentRowArray.push(contextId.occurrence);
  currentRowArray.push(`"${contextId.quote}"`);
  currentRowArray.push(contextId.reference.bookId);
  currentRowArray.push(contextId.reference.chapter);
  currentRowArray.push(contextId.reference.verse);
}

export function getToolFolderNames(projectPath) {
  try {
    return fs.readdirSync(path.join(projectPath, 'apps', 'translationCore', 'index'));
  } catch (e) {
  }
}


export function saveAllCSVDataByToolName(toolName, dataFolder, params, callback) {
  if (toolName == '.DS_Store') callback();
  else {
    loadGroupsData(toolName, dataFolder, params).then((obj) => saveGroupsCSVToFs(obj, dataFolder))
      .then(() => loadProjectDataByType(dataFolder, params, 'reminders')).then((obj) => saveRemindersToCSV(obj, dataFolder))
      .then(() => loadProjectDataByType(dataFolder, params, 'selections')).then((obj) => saveSelectionsToCSV(obj, dataFolder))
      .then(() => loadProjectDataByType(dataFolder, params, 'comments')).then((obj) => saveCommentsToCSV(obj, dataFolder))
      .then(() => loadProjectDataByType(dataFolder, params, 'verseEdits')).then((obj) => saveVerseEditsToCSV(obj, dataFolder))
      .then(() => saveDialog(toolName, dataFolder, callback))
  }
}

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
