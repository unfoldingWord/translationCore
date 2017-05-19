import consts from './CoreActionConsts';
import fs from 'fs-extra';
import path from 'path-extra';
import gogs from '../components/core/login/GogsApi';
import { remote } from 'electron';
import zipFolder from 'zip-folder';
import git from '../components/core/GitApi.js'
// actions
import * as getDataActions from './GetDataActions';
import { loadGroupsDataToExport, loadProjectDataByTypeToExport } from '../utils/loadMethods';
import * as AlertModalActions from './AlertModalActions';
// contant declarations
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');
const { dialog } = remote;


/**
 * @description - Initiate a project load
 *
 * @param {string} filePath - Path to the project to open i.e. ~/translationCore/{PROJECT_NAME}
 */
export function onLoad(filePath) {
  return (dispatch => {
    dispatch(getDataActions.openProject(filePath));
  });
}

/**
 * Upload project to door 43, based on currently logged in user.
 *
 * @param {string} projectPath - Path to the project to upload
 * @param {object} user - currently logged in user
 */
export function uploadProject(projectPath, user) {
  return (dispatch => {
    var projectName = projectPath.split(path.sep).pop();

    dispatch(
      AlertModalActions.openAlertDialog("Uploading " + projectName + " to Door43. Please wait...", true)
    );

    gogs(user.token).createRepo(user, projectName).then(repo => {
      var newRemote = 'https://' + user.token + '@git.door43.org/' + repo.full_name + '.git';

      git(projectPath).save(user, 'Commit before upload', projectPath, err => {
        if (err) {
          dispatch(
            AlertModalActions.openAlertDialog("Error saving project: " + err)
          )
        } else {
          git(projectPath).push(newRemote, "master", err => {
            if (err) {
              if (err.status === 401 || err.code === "ENOTFOUND" || err.toString().includes("connect ETIMEDOUT") || err.toString().includes("INTERNET_DISCONNECTED") || err.toString().includes("unable to access") || err.toString().includes("The remote end hung up")) {
                dispatch(
                  AlertModalActions.openAlertDialog("Unable to connect to the server. Please check your Internet connection.")
                );
              } else if (err.toString().includes("rejected because the remote contains work")) {
                dispatch(
                  AlertModalActions.openAlertDialog(projectName + ' cannot be uploaded because there have been changes to the translation of that project on your Door43 account.')
                );
              } else if (err.hasOwnProperty('message')) {
                dispatch(
                  AlertModalActions.openAlertDialog('Error Uploading: ' + err.message)
                );
              } else if (err.hasOwnProperty('data') && err.data) {
                dispatch(
                  AlertModalActions.openAlertDialog('Error Uploading: ' + err.data)
                );
              } else {
                dispatch(
                  AlertModalActions.openAlertDialog('Error Uploading: Unknown error')
                );
              }
            } else {
              dispatch({
                type: consts.UPLOAD_PROJECT
              });
              dispatch(
                AlertModalActions.openAlertDialog(projectName + " has been successfully uploaded.")
              )
            }
          })
        }
      })
    }).catch(err => {
        if (user.localUser) {
          dispatch(
              AlertModalActions.openAlertDialog('Error Uploading: You must be logged in with a Door43 account to upload projects.')
          );
        } else if (err.status === 401 || err.code === "ENOTFOUND" || err.toString().includes("connect ETIMEDOUT") || err.toString().includes("INTERNET_DISCONNECTED") || err.toString().includes("unable to access") || err.toString().includes("The remote end hung up")) {
          dispatch(
              AlertModalActions.openAlertDialog('Unable to connect to the server. Please check your Internet connection.')
          );
        } else {
          dispatch (
            AlertModalActions.openAlertDialog("Unknown error while trying to create the repository.")
          )
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
    var loadedSuccessfully = true;
    const { groupsDataReducer, remindersReducer, commentsReducer, selectionsReducer, verseEditsReducer } = getState();
    dispatch(getDataActions.openProject(projectPath, null, true));
    const { params, manifest } = getState().projectDetailsReducer;
    const projectName = `${params.bookAbbr.toUpperCase()}_${manifest.target_language.name}`;
    dispatch(getDataActions.clearPreviousData());

    let toolPaths = getToolFolderNames(projectPath);
    if (!toolPaths) dispatch(AlertModalActions.openAlertDialog('No checks have been performed in this project.'));
    let dataFolder = path.join(projectPath, '.apps', 'translationCore');
    var fn = function (newPaths) {
      saveAllCSVDataByToolName(newPaths[0], dataFolder, params, (result) => {
        loadedSuccessfully = result && loadedSuccessfully;
        newPaths.shift();
        if (newPaths.length) fn(newPaths);
        else {
          saveDialog(dataFolder, projectName, (result) => {
            fs.remove(path.join(dataFolder, 'output'));
            if (loadedSuccessfully && result) dispatch(AlertModalActions.openAlertDialog('Export Successful'));
            else if (!result) dispatch(AlertModalActions.openAlertDialog('Export Cancelled'));
            else dispatch(AlertModalActions.openAlertDialog('Failed To Export'));
          })
        }
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
export function saveVerseEditsToCSV(obj, dataFolder, toolName) {
  return new Promise((resolve, reject) => {
    try {
      let csvString = "after, before, tags, groupId, occurrence, quote, bookId, chapter, verse, username, time\n";
      for (var currentRowObject of obj) {
        let currentRowArray = [];
        const currentRow = currentRowObject.dataObject;
        const { time, username } = currentRowObject;
        currentRowArray.push(`"${currentRow.after.replace('"', '""')}"`);
        currentRowArray.push(`"${currentRow.before.replace('"', '""')}"`);
        currentRowArray.push(`"${currentRow.tags}"`);
        addContextIdToCSV(currentRowArray, currentRow.contextId, username, time);
        csvString += currentRowArray.join(',') + "\n";
      }
      fs.outputFileSync(path.join(dataFolder, 'output', toolName, 'VerseEdits.csv'), csvString);
    } catch (e) {   reject(false) };
    resolve(true);
  });
}

/**
 * @description - Creates csv from object and saves it.
 *
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 */
export function saveCommentsToCSV(obj, dataFolder, toolName) {
  return new Promise((resolve, reject) => {
    try {
      let csvString = "text, groupId, occurrence, quote, bookId, chapter, verse, username, time\n";
      for (var currentRowObject of obj) {
        const currentRow = currentRowObject.dataObject;
        const { time, username } = currentRowObject;
        let currentRowArray = [];
        currentRowArray.push(currentRow.text);
        addContextIdToCSV(currentRowArray, currentRow.contextId, username, time)
        csvString += currentRowArray.join(',') + "\n";
      }
      fs.outputFileSync(path.join(dataFolder, 'output', toolName, 'Comments.csv'), csvString);
    } catch (e) {  reject(false) };
    resolve(true);
  });
}

/**
 * @description - Creates csv from object and saves it.
 *
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 */
export function saveSelectionsToCSV(obj, dataFolder, toolName) {
  return new Promise((resolve, reject) => {
    try {
      let csvString = "text, selection/occurrence, selection/occurrences, groupId, contextId/occurrence, quote, bookId, chapter, verse, username, time\n";
      for (var currentRowObject of obj) {
        const col = currentRowObject.dataObject;
        const { time, username } = currentRowObject;
        for (var currentSelection of col.selections) {
          let currentRowArray = [];
          currentRowArray.push(currentSelection.text);
          currentRowArray.push(currentSelection.occurrence);
          currentRowArray.push(currentSelection.occurrences);
          addContextIdToCSV(currentRowArray, col.contextId, username, time)
          csvString += currentRowArray.join(',') + "\n";
        }
      }
      fs.outputFileSync(path.join(dataFolder, 'output', toolName, 'Selections.csv'), csvString);
    } catch (e) {  reject(false) };
    resolve(true);
  });
}

/**
 * @description - Creates csv from object and saves it.
 *
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 */
export function saveRemindersToCSV(obj, dataFolder, toolName) {
  return new Promise((resolve, reject) => {
    try {
      let csvString = "enabled, groupId, occurrence, quote, bookId, chapter, verse, username, time\n";
      for (var currentRowObject of obj) {
        const currentRow = currentRowObject.dataObject;
       const { time, username } = currentRowObject;
        let currentRowArray = [];
        currentRowArray.push(currentRow.enabled);
        addContextIdToCSV(currentRowArray, currentRow.contextId, username, time)
        csvString += currentRowArray.join(',') + "\n";
      }
      fs.outputFileSync(path.join(dataFolder, 'output', toolName, 'Reminders.csv'), csvString);
    } catch (e) {  reject(false) };
    resolve(true);
  });
}

/**
 * @description - Creates csv from object and saves it.
 *
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 */
export function saveGroupsCSVToFs(obj, dataFolder, toolName) {
  return new Promise((resolve, reject) => {
    try {
      var time = "";
      let csvString = "priority, groupId, occurrence, quote, bookId, chapter, verse\n";
      for (var col in obj) {
        for (var row in obj[col]) {
          const currentRow = obj[col][row];
          let currentRowArray = [];
          currentRowArray.push(currentRow.priority);
          addContextIdToCSV(currentRowArray, currentRow.contextId);
          csvString += currentRowArray.join(',') + "\n";
        }
      }
      fs.outputFileSync(path.join(dataFolder, 'output', toolName, 'CheckInformation.csv'), csvString);
    } catch (e) {  reject(false) };
    resolve(true);
  });
}

/**
 * @description - Creates csv from object and saves it.
 *
 * @param {object} currentRowArray - current csv row
 * @param {object} contextId - contextID object that needs to go onto the csv row
 */
export function addContextIdToCSV(currentRowArray, contextId, username, time) {
  currentRowArray.push(contextId.groupId);
  currentRowArray.push(contextId.occurrence);
  currentRowArray.push(`"${contextId.quote}"`);
  currentRowArray.push(contextId.reference.bookId);
  currentRowArray.push(contextId.reference.chapter);
  currentRowArray.push(contextId.reference.verse);
  if (username) currentRowArray.push(username);
  if (time) currentRowArray.push(time);
}

/**
 * @description - Gets the tool folder names
 *
 * @param {string} projectPath
 */
export function getToolFolderNames(projectPath) {
  try {
    return fs.readdirSync(path.join(projectPath, '.apps', 'translationCore', 'index'));
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
  if (toolName == '.DS_Store') callback(true);
  else {
    loadGroupsDataToExport(toolName, dataFolder, params).then((obj) => saveGroupsCSVToFs(obj, dataFolder, toolName))
      .then(() => loadProjectDataByTypeToExport(dataFolder, params, 'reminders')).then((obj) => saveRemindersToCSV(obj, dataFolder, toolName))
      .then(() => loadProjectDataByTypeToExport(dataFolder, params, 'selections')).then((obj) => saveSelectionsToCSV(obj, dataFolder, toolName))
      .then(() => loadProjectDataByTypeToExport(dataFolder, params, 'comments')).then((obj) => saveCommentsToCSV(obj, dataFolder, toolName))
      .then(() => loadProjectDataByTypeToExport(dataFolder, params, 'verseEdits')).then((obj) => saveVerseEditsToCSV(obj, dataFolder, toolName))
      .then(callback);
  }
}

/**
 * @description - method to save csv output from user selection by dialoag
 *
 * @param {string} toolName - current tool name
 * @param {string} dataFolder - path of the folder to load csv from
 * @param {function} callback - function to call when complete
 */
export function saveDialog(dataFolder, projectName, callback) {
  let source = path.join(dataFolder, 'output');
  let defaultPath = `${path.homedir()}/Desktop/${projectName}.zip`;
  let title = `Project CSV Save Location`;
  dialog.showSaveDialog({
    title: title,
    defaultPath: defaultPath,
    extensions: ['zip']
  }, (fileName) => {
    if (fileName) {
      zipFolder(source, fileName, function (err) {
        if (!err) callback(true);
        else callback(false);
      })
    } else callback(false)
  })
}
