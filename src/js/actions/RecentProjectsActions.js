import consts from './CoreActionConsts';
import sync from '../components/core/SideBar/GitSync.js';
import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as getDataActions from './GetDataActions';
import { loadGroupsData, loadCheckDataData } from '../utils/loadMethods';
// contant declarations
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');

export function onLoad(filePath) {
  return ((dispatch) => {
    dispatch(getDataActions.openProject(filePath));
  })
}

export function syncProject(projectPath) {
  sync(projectPath, manifest);
  return {
    type: consts.SYNC_PROJECT
  }
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
    for (var tool of toolPaths) {
      if (tool == '.DS_Store') continue;
      let dataFolder = path.join(projectPath, 'apps', 'translationCore');

      loadGroupsData(tool, dataFolder, params)
        .then((obj) => saveGroupsCSVToFs(obj, dataFolder))

      loadCheckDataData(dataFolder, params, 'reminders')
        .then((obj) => saveRemindersToCSV(obj, dataFolder))

      loadCheckDataData(dataFolder, params, 'selections')
        .then((obj) => saveSelectionsToCSV(obj, dataFolder))

      loadCheckDataData(dataFolder, params, 'comments')
        .then((obj) => saveCommentsToCSV(obj, dataFolder))

      loadCheckDataData(dataFolder, params, 'verseEdits')
        .then((obj) => saveVerseEditsToCSV(obj, dataFolder))
    }
     callback('Exported To CSV');
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
  } catch(e) {
  }
}
