import consts from './ActionTypes';
import React from 'react'
import fs from 'fs-extra';
import path from 'path-extra';
import gogs from '../components/login/GogsApi';
import { shell } from 'electron';
import zipFolder from 'zip-folder';
import git from '../helpers/GitApi.js';
import {ipcRenderer} from 'electron';
// actions
import { loadGroupsDataToExport, loadProjectDataByTypeToExport, getGroupName } from '../utils/loadMethods';
import * as AlertModalActions from './AlertModalActions';
import * as OnlineModeActions from './OnlineModeActions';
// contant declarations
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore', 'projects');
const OSX_DOCUMENTS_PATH = path.join(path.homedir(), 'Documents');
const WIN_DOCUMENTS_PATH = path.join(path.homedir(), 'My Documents');

/**
 * Upload project to door 43, based on currently logged in user.
 *
 * @param {string} projectPath - Path to the project to upload
 * @param {object} user - currently logged in user
 */
export function uploadProject(projectPath, user) {
  return (dispatch => {
    dispatch(OnlineModeActions.confirmOnlineAction(() => {
      var projectName = projectPath.split(path.sep).pop();
      const message = "Uploading " + projectName + " to Door43. Please wait...";
      dispatch(AlertModalActions.openAlertDialog(message, true));
      if (!user.token) {
        const message = "Your login has become invalid. Please log out and log back in.";
        dispatch(AlertModalActions.openAlertDialog(message, false));
        return;
      }

      gogs(user.token).createRepo(user, projectName).then(repo => {
        var newRemote = 'https://' + user.token + '@git.door43.org/' + repo.full_name + '.git';

        git(projectPath).save(user, 'Commit before upload', projectPath, err => {
          if (err) {
            dispatch(AlertModalActions.openAlertDialog("Error saving project: " + err));
          } else {
            git(projectPath).push(newRemote, "master", err => {
              if (err) {
                if (err.status === 401 || err.code === "ENOTFOUND" || err.toString().includes("connect ETIMEDOUT") || err.toString().includes("INTERNET_DISCONNECTED") || err.toString().includes("unable to access") || err.toString().includes("The remote end hung up")) {
                  const message = "Unable to connect to the server. Please check your Internet connection.";
                  dispatch(AlertModalActions.openAlertDialog(message));
                } else if (err.toString().includes("rejected because the remote contains work")) {
                  const message = projectName + ' cannot be uploaded because there have been changes to the translation of that project on your Door43 account.';
                  dispatch(AlertModalActions.openAlertDialog(message));
                } else if (err.hasOwnProperty('message')) {
                  dispatch(AlertModalActions.openAlertDialog('Error Uploading: ' + err.message));
                } else if (err.hasOwnProperty('data') && err.data) {
                  dispatch(AlertModalActions.openAlertDialog('Error Uploading: ' + err.data));
                } else {
                  dispatch(AlertModalActions.openAlertDialog('Error Uploading: Unknown error'));
                }
              } else {
                dispatch(
                  AlertModalActions.openAlertDialog(
                    <div>
                      <span>
                        <span style={{ fontWeight: 'bold' }}>{user.username + ", "}</span>
                        {"your project was uploaded successfully to: "}
                        <a style={{cursor: 'pointer'}} onClick={() => {
                          dispatch(OnlineModeActions.confirmOnlineAction(() => {
                            shell.openExternal('https://git.door43.org/' + user.username + '/' + projectName)
                          }))
                        }}>
                          {"https://git.door43.org/" + user.username + '/' + projectName}
                        </a>
                      </span>
                    </div>
                  )
                )
              }
            })
          }
        });
      })
    }))
  })
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

export function csvTextCleanUp(text) {
  if (!text) return "";
  return text.replace ? `"${text.replace('"', '""')}"` : `"${text}"`;
}


/**
 * @description - Wrapper function to handle exporting to CSV
 *
 * @param {string} projectPath - Path to current project
 * @param {string} csvSaveLocation - Path to CSV location
 */
export function exportToCSV(projectPath) {
  return ((dispatch, getState) => {
    const csvSaveLocation = getState().settingsReducer.csvSaveLocation;
    const projectName = projectPath.split(path.sep).pop();
    let projectId = "";
    const dataFolder = path.join(projectPath, '.apps', 'translationCore');
    const tempFolder = path.join(dataFolder, 'output');
    let defaultPath;
    if (csvSaveLocation) {
      defaultPath = path.join(csvSaveLocation, projectName + '.zip');
    }
    else if (fs.existsSync(OSX_DOCUMENTS_PATH)) {
      defaultPath = path.join(OSX_DOCUMENTS_PATH, projectName + '.zip');
    } else if (fs.existsSync(WIN_DOCUMENTS_PATH)) {
      defaultPath = path.join(WIN_DOCUMENTS_PATH, projectName + '.zip');
    }
    else {
      defaultPath = path.join(path.homedir(), projectName + '.zip');
    }
    let filePath = ipcRenderer.sendSync('save-as', { options: { defaultPath: defaultPath, filters: [{ name: 'Zip Files', extensions: ['zip'] }], title: 'Save CSV Export As' } });
    if (!filePath) {
      dispatch(AlertModalActions.openAlertDialog('Export Cancelled', false));
      return;
    } else {
      dispatch({ type: consts.SET_CSV_SAVE_LOCATION, csvSaveLocation: filePath.split(projectName)[0] })
    }

    dispatch(
      AlertModalActions.openAlertDialog("Exporting " + projectName + " Please wait...", true)
    );

    Promise.resolve(true)
      .then(() => {
        try {
          let manifestPath = path.join(projectPath, 'manifest.json');
          let manifest = JSON.parse(fs.readFileSync(manifestPath));
          projectId = manifest.project.id;
          return true;
        } catch (error) {
          throw 'Cannot read project manifest';
        }
      })
      .then(() => {
        let toolPaths = getToolFolderNames(projectPath);
        if (!toolPaths || !toolPaths.length) {
          throw 'No checks have been performed in this project.';
        }
        return toolPaths;
      })
      .then((toolPaths) => {
        let promises = Promise.resolve(true);

        toolPaths.forEach((toolpath) => {
          promises = promises.then(() => {
            return saveAllCSVDataByToolName(toolpath, dataFolder, projectId);
          });
        });
        return promises;
      })
      .then(() => {
        zipFolder(tempFolder, filePath, (err) => {
          if (err) {
            dispatch(AlertModalActions.openAlertDialog("Export failed: Could not create zip file.", false));
          } else {
            dispatch(AlertModalActions.openAlertDialog(projectName + " has been successfully exported.", false));
          }
          fs.remove(path.join(tempFolder));
        })
      })
      .catch((err) => {
        dispatch(AlertModalActions.openAlertDialog("Export failed: " + err, false));
        fs.remove(path.join(tempFolder));
      });
  });
}

/**
 * @description - Creates csv from object and saves it.
 *
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export function saveVerseEditsToCSV(obj, dataFolder, currentToolName, indexObject) {
  return new Promise((resolve, reject) => {
    try {
      let csvString = "after, before, tags, groupId, groupName, occurrence, quote, bookId, chapter, verse, username, date, time\n";
      for (var currentRowObject of obj) {
        let currentRowArray = [];
        const currentRow = currentRowObject.dataObject;
        const { time, username } = currentRowObject;
        currentRowArray.push(csvTextCleanUp(currentRow.verseAfter));
        currentRowArray.push(csvTextCleanUp(currentRow.verseBefore));
        currentRowArray.push(csvTextCleanUp(currentRow.tags));
        addContextIdToCSV(currentRowArray, currentRow.contextId, username, time, indexObject);
        csvString += currentRowArray.join(',') + "\n";
      }
      fs.outputFileSync(path.join(dataFolder, 'output', currentToolName, 'VerseEdits.csv'), csvString);
    } catch (e) {
      console.warn(e);
      reject(false)
    }
    resolve(true);
  });
}

/**
 * @description - Creates csv from object and saves it.
 *
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export function saveCommentsToCSV(obj, dataFolder, currentToolName, indexObject) {
  return new Promise((resolve, reject) => {
    try {
      let csvString = "text, groupId, groupName, occurrence, quote, bookId, chapter, verse, username, date, time\n";
      for (var currentRowObject of obj) {
        const currentRow = currentRowObject.dataObject;
        const { time, username } = currentRowObject;
        let currentRowArray = [];
        currentRowArray.push(csvTextCleanUp(currentRow.text));
        addContextIdToCSV(currentRowArray, currentRow.contextId, username, time, indexObject)
        csvString += currentRowArray.join(',') + "\n";
      }
      fs.outputFileSync(path.join(dataFolder, 'output', currentToolName, 'Comments.csv'), csvString);
    } catch (e) {
      console.warn(e);
      reject(false)
    }
    resolve(true);
  });
}

/**
 * @description - Creates csv from object and saves it.
 *
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export function saveSelectionsToCSV(obj, dataFolder, currentToolName, indexObject) {
  return new Promise((resolve, reject) => {
    try {
      let csvString = "text, selection/occurrence, selection/occurrences, groupId, groupName, contextId/occurrence, quote, bookId, chapter, verse, username, date, time\n";
      for (var currentRowObject of obj) {
        const col = currentRowObject.dataObject;
        const { time, username } = currentRowObject;
        for (var currentSelection of col.selections) {
          let currentRowArray = [];
          currentRowArray.push(csvTextCleanUp(currentSelection.text));
          currentRowArray.push(currentSelection.occurrence);
          currentRowArray.push(currentSelection.occurrences);
          addContextIdToCSV(currentRowArray, col.contextId, username, time, indexObject)
          csvString += currentRowArray.join(',') + "\n";
        }
      }
      fs.outputFileSync(path.join(dataFolder, 'output', currentToolName, 'Selections.csv'), csvString);
    } catch (e) {
      console.warn(e);
      reject(false)
    }
    resolve(true);
  });
}

/**
 * @description - Creates csv from object and saves it.
 *
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export function saveRemindersToCSV(obj, dataFolder, currentToolName, indexObject) {
  return new Promise((resolve, reject) => {
    try {
      let csvString = "enabled, groupId, groupName, occurrence, quote, bookId, chapter, verse, username, date, time\n";
      for (var currentRowObject of obj) {
        const currentRow = currentRowObject.dataObject;
        const { time, username } = currentRowObject;
        let currentRowArray = [];
        currentRowArray.push(currentRow.enabled);
        addContextIdToCSV(currentRowArray, currentRow.contextId, username, time, indexObject)
        csvString += currentRowArray.join(',') + "\n";
      }
      fs.outputFileSync(path.join(dataFolder, 'output', currentToolName, 'Reminders.csv'), csvString);
    } catch (e) {
      console.warn(e);
      reject(false)
    }
    resolve(true);
  });
}

/**
 * @description - Creates csv from object and saves it.
 *
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export function saveGroupsCSVToFs(obj, dataFolder, currentToolName, indexObject) {
  return new Promise((resolve, reject) => {
    try {
      var time = "";
      let csvString = "priority, groupId, groupName, occurrence, quote, bookId, chapter, verse\n";
      for (var col in obj) {
        for (var row in obj[col]) {
          const currentRow = obj[col][row];
          let currentRowArray = [];
          currentRowArray.push(currentRow.priority);
          addContextIdToCSV(currentRowArray, currentRow.contextId, null, null, indexObject);
          csvString += currentRowArray.join(',') + "\n";
        }
      }
      fs.outputFileSync(path.join(dataFolder, 'output', currentToolName, 'CheckInformation.csv'), csvString);
    } catch (e) {
      console.warn(e);
      reject(false)
    }
    resolve(true);
  });
}

/**
 * @description - Creates csv from object and saves it.
 *
 * @param {object} currentRowArray - current csv row
 * @param {object} contextId - contextID object that needs to go onto the csv row
 * @param {string} username - name coming from projectDetailsReducer i.e. RoyalSix
 * @param {Date} datetime - Date() object to be parsed which includes time/date
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export function addContextIdToCSV(currentRowArray, contextId, username, datetime, indexObject) {
  let groupName = getGroupName(indexObject, contextId.groupId);
  currentRowArray.push(contextId.groupId);
  currentRowArray.push(csvTextCleanUp(groupName));
  currentRowArray.push(contextId.occurrence);
  currentRowArray.push(csvTextCleanUp(contextId.quote));
  currentRowArray.push(contextId.reference.bookId);
  currentRowArray.push(contextId.reference.chapter);
  currentRowArray.push(contextId.reference.verse);
  if (username) currentRowArray.push(username);
  if (datetime) {
    datetime = datetime.replace(/_/g, ":");
    function pad(num) {
      return num < 10 ? 0 + `${num}` : num;
    }
    let dateObj = new Date(datetime)
    let date = [pad(dateObj.getMonth() + 1), pad(dateObj.getDate()), dateObj.getFullYear()].join("/");
    currentRowArray.push(date);
    //Converts to format as such DD/MM/YYYY
    currentRowArray.push(new Date(datetime).toString().split(" ")[4]);
    //Converts to format as such HH:MM:SS
  }
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
 * @param {string} currentToolName - current tool name
 * @param {string} dataFolder - path of the folder to load csv from
 * @param {object} projectId - project Id of current project
 */
export function saveAllCSVDataByToolName(currentToolName, dataFolder, projectId) {
  if (currentToolName == '.DS_Store') {
    return Promise.resolve(true);
  } else {
    let filePath = path.join(dataFolder, 'index', currentToolName, 'index.json')
    let indexObject = fs.readJsonSync(filePath);
    return loadGroupsDataToExport(currentToolName, dataFolder, projectId).then((obj) => saveGroupsCSVToFs(obj, dataFolder, currentToolName, indexObject))
      .then(() => loadProjectDataByTypeToExport(dataFolder, projectId, 'reminders')).then((obj) => saveRemindersToCSV(obj, dataFolder, currentToolName, indexObject))
      .then(() => loadProjectDataByTypeToExport(dataFolder, projectId, 'selections')).then((obj) => saveSelectionsToCSV(obj, dataFolder, currentToolName, indexObject))
      .then(() => loadProjectDataByTypeToExport(dataFolder, projectId, 'comments')).then((obj) => saveCommentsToCSV(obj, dataFolder, currentToolName, indexObject))
      .then(() => loadProjectDataByTypeToExport(dataFolder, projectId, 'verseEdits')).then((obj) => saveVerseEditsToCSV(obj, dataFolder, currentToolName, indexObject))
      .then(() => {
        return Promise.resolve(true);
      })
      .catch(err => {
        throw "Problem saving data for " + currentToolName + "\n Error:" + err;
      });
  }
}
