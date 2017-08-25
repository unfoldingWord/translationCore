/* eslint-disable no-console */
import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
import zipFolder from 'zip-folder';
import { ipcRenderer } from 'electron';
// actions
import * as AlertModalActions from './AlertModalActions';
// helpers
import * as csvHelpers from '../helpers/csvHelpers';
// utils
import * as csvMethods from '../utils/csvMethods';

/**
 * @description - Wrapper function to handle exporting to CSV
 * @param {string} projectPath - Path to current project
 * @param {string} csvSaveLocation - Path to CSV location
 */
export function exportToCSV(projectPath) {
  return ( (dispatch, getState) => {
    // generate default paths
    const csvSaveLocation = getState().settingsReducer.csvSaveLocation;
    const projectName = projectPath.split(path.sep).pop();
    let defaultPath = getDefaultPath(csvSaveLocation, projectName);
    // prompt user for save location
    const filters = [{ name: 'Zip Files', extensions: ['zip'] }];
    const title = 'Save CSV Export As';
    const options = { defaultPath: defaultPath, filters: filters, title: title };
    let filePath = ipcRenderer.sendSync('save-as', { options: options });
    if (!filePath) {
      dispatch(AlertModalActions.openAlertDialog('Export Cancelled', false));
      return;
    } else {
      dispatch({
        type: consts.SET_CSV_SAVE_LOCATION,
        csvSaveLocation: filePath.split(projectName)[0]
      });
    }
    // show loading dialog
    let message = "Exporting " + projectName + " Please wait...";
    dispatch(AlertModalActions.openAlertDialog(message, true));
    // export the csv and zip it
    exportToCSVZip(projectPath)
    .then( () => {
      message = projectName + " has been successfully exported.";
      dispatch(AlertModalActions.openAlertDialog(message, false));
    })
    .catch( (err) => {
      message = "Export failed: " + err;
      dispatch(AlertModalActions.openAlertDialog(message, false));
    });
  });
}
/**
 * @description - Get the default path for the OS
 * @param {string} csvSaveLocation - Path to CSV location
 * @param {string} projectName - Name of the current project
 */
export const getDefaultPath = (csvSaveLocation, projectName) => {
  let defaultPath;
  const OSX_DOCUMENTS_PATH = path.join(path.homedir(), 'Documents');
  const WIN_DOCUMENTS_PATH = path.join(path.homedir(), 'My Documents');
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
  return defaultPath;
}
/**
 * @description - Chain of saving csv data then zipping it up and saving
 * @param {string} projectPath - Path to current project
 * @param {string} filePath - Path to save the zip file
 */
export const exportToCSVZip = (projectPath, filePath) => {
  return new Promise((resolve, reject) => {
    Promise.resolve(true)
    .then(() => saveAllCSVData(projectPath))
    .then(() => zipCSVData(projectPath, filePath))
    .then(() => {
      csvHelpers.cleanupTmpPath(projectPath);
      resolve(true)
    })
    .catch( (err) => {
      csvHelpers.cleanupTmpPath(projectPath);
      reject(err);
    })
  })
}
/**
 * @description - Zip all of the csv files and save ot filePath
 * @param {string} tmpPath - Path of the csv files
 * @param {string} filePath - Path to save the zip file
 */
export const zipCSVData = (projectPath, filePath) => {
  return new Promise((resolve, reject) => {
    const _tmpPath = csvHelpers.tmpPath(projectPath);
    zipFolder(_tmpPath, filePath, (err) => {
      if (err) {
        reject("Could not create zip file.");
      } else {
        resolve(true);
      }
    });
  });
}
/**
 * @description - Chain of saving all csv data
 * @param {string} projectPath - Path to current project
 * @param {string} filePath - Path to save the zip file
 */
export const saveAllCSVData = (projectPath) => {
  return new Promise((resolve, reject) => {
    const toolPaths = csvHelpers.getToolFolderNames(projectPath);
    if (!toolPaths || !toolPaths.length) {
      throw 'No tools have loaded for this project.';
    }
    let iterablePromises = [];
    toolPaths.forEach((toolPath) => {
      const p = new Promise((_resolve) => {
        return saveToolDataToCSV(toolPath, projectPath)
        .then(_resolve);
      });
      iterablePromises.push(p);
    });
    Promise.all(iterablePromises)
    .then(() => saveVerseEditsToCSV(projectPath))
    .then(() => saveRemindersToCSV(projectPath))
    .then(() => saveCommentsToCSV(projectPath))
    .then(() => saveSelectionsToCSV(projectPath))
    .then(resolve)
    .catch(reject);
  });
}
/**
 *
 * @param {string} currentToolName - current tool name
 * @param {string} dataPath - path of the folder to load csv from
 * @param {object} projectId - project Id of current project
 */
export const saveToolDataToCSV = (toolName, projectPath) => {
  return new Promise((resolve, reject) => {
    loadGroupsData(toolName, projectPath)
    .then((object) => saveGroupsToCSV(object, projectPath, toolName))
    .then(() => {
      resolve(true);
    })
    .catch(err => {
      const message = "Problem saving data for " + toolName + "\n Error:" + err;
      reject(message)
    });
  });
}

// TODO: change readJson to readJsonSync
export function loadGroupsData(toolName, projectPath) {
  return new Promise((resolve, reject) => {
    const dataPath = csvHelpers.dataPath(projectPath);
    const projectId = csvHelpers.getProjectId(projectPath);
    const groupsDataFolderPath = path.join(dataPath, 'index', toolName, projectId);
    if (fs.existsSync(groupsDataFolderPath)) {
      const groupDataFiles = fs.readdirSync(groupsDataFolderPath);
      var groupsData = {};
      groupDataFiles.forEach(groupDataFile => {
        if (path.extname(groupDataFile) === '.json') {
          const groupId = groupDataFile.split('.')[0];
          const groupDataPath = path.join(groupsDataFolderPath, groupDataFile);
          const groupData = fs.readJsonSync(groupDataPath);
          groupsData[groupId] = groupData;
        }
      });
      resolve(groupsData);
    } else {
      const err = 'Group Data path does not exist: ' + groupsDataFolderPath;
      console.log(err)
      reject(err);
    }
  });
}
/**
 * @description - Creates csv from object and saves it.
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataPath - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export const saveGroupsToCSV = (obj, projectPath, toolName) => {
  return new Promise((resolve, reject) => {
    let objectArray = [];
    const groupNames = Object.keys(obj);
    groupNames.forEach( groupName => {
      obj[groupName].forEach( groupData => {
        const object = groupData;
        const data = { priority: object.priority }
        const flatContextId = csvHelpers.flattenContextId(object.contextId);
        const newObject = Object.assign({}, data, flatContextId);
        objectArray.push(newObject);
      });
    });
    const dataPath = csvHelpers.dataPath(projectPath);
    const filePath = path.join(dataPath, 'output', toolName + '_CheckInformation.csv');
    csvMethods.generateCSVFile(objectArray, filePath)
    .then( () => {
      return resolve(true);
    })
    .catch((err) => {
      console.log('saveGroupsToCSV: ', err);
      reject(err);
    });
  });
}
/**
 * @description - Creates csv from object and saves it.
 * @param {Array} array - array to save to the filesystem
 * @param {string} dataPath - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export const saveVerseEditsToCSV  = (projectPath) => {
  return new Promise ((resolve, reject) => {
    loadProjectDataByType(projectPath, 'verseEdits')
    .then((array) => {
      const objectArray = array.map( data => {
        const _data = {
          after: data.verseAfter,
          before: data.verseBefore,
          tags: data.tags
        };
        return csvHelpers.combineData(_data, data.contextId, data.userName, data.modifiedTimestamp);
      });
      const dataPath = csvHelpers.dataPath(projectPath);
      const filePath = path.join(dataPath, 'output', 'VerseEdits.csv');
      csvMethods.generateCSVFile(objectArray, filePath).then( () => {
        resolve(true);
      });
    })
    .catch(reject);
  })
}
/**
 * @description - Creates csv from object and saves it.
 * @param {Array} array - object to save to the filesystem
 * @param {string} dataPath - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export const saveCommentsToCSV  = (projectPath) => {
  return new Promise ((resolve, reject) => {
    loadProjectDataByType(projectPath, 'comments')
    .then((array) => {
      const objectArray = array.map( data => {
        const _data = { text: data.text }
        return csvHelpers.combineData(_data, data.contextId, data.userName, data.modifiedTimestamp);
      });
      const dataPath = csvHelpers.dataPath(projectPath);
      const filePath = path.join(dataPath, 'output', 'Comments.csv');
      csvMethods.generateCSVFile(objectArray, filePath).then( () => {
        resolve(true);
      });
    })
    .catch(reject);
  })
}
/**
 * @description - Creates csv from object and saves it.
 * @param {Array} array - object to save to the filesystem
 * @param {string} dataPath - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export const saveSelectionsToCSV = (projectPath) => {
  return new Promise ((resolve, reject) => {
    loadProjectDataByType(projectPath, 'selections')
    .then((array) => {
      const objectArray = [];
      array.forEach( data => {
        data.selections.forEach( selection => {
          const _data = {
            text: selection.text,
            "selection/occurrence": selection.occurrence,
            "selection/occurrences": selection.occurrences
          };
          const newObject = csvHelpers.combineData(_data, data.contextId, data.userName, data.modifiedTimestamp);
          objectArray.push(newObject);
        });
      });
      const dataPath = csvHelpers.dataPath(projectPath);
      const filePath = path.join(dataPath, 'output', 'Selections.csv');
      csvMethods.generateCSVFile(objectArray, filePath).then( () => {
        resolve(true);
      });
    })
    .catch(reject);
  })
}
/**
 * @description - Creates csv from object and saves it.
 * @param {Array} array - object to save to the filesystem
 * @param {string} dataPath - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export const saveRemindersToCSV = (projectPath) => {
  return new Promise ((resolve, reject) => {
    loadProjectDataByType(projectPath, 'reminders')
    .then((array) => {
      const objectArray = array.map( data => {
        const _data = { enabled: data.enabled }
        return csvHelpers.combineData(_data, data.contextId, data.userName, data.modifiedTimestamp);
      });
      const dataPath = csvHelpers.dataPath(projectPath);
      const filePath = path.join(dataPath, 'output', 'Reminders.csv');
      csvMethods.generateCSVFile(objectArray, filePath).then( () => {
        resolve(true);
      });
    })
    .catch(reject);
  })
}

export function loadProjectDataByType(projectPath, type) {
  return new Promise((resolve) => {
    let checkDataArray = [];
    const dataPath = csvHelpers.dataPath(projectPath);
    const projectId = csvHelpers.getProjectId(projectPath);
    const chaptersPath = path.join(dataPath, 'checkData', type, projectId);
    if (fs.existsSync(chaptersPath)) {
      let chapters = fs.readdirSync(chaptersPath);
      for (var chapter of chapters) {
        if (!parseInt(chapter)) continue;
        let verses = fs.readdirSync(path.join(chaptersPath, chapter));
        verses.forEach(verse => {
          if (!parseInt(verse)) return;
          let versePath = path.join(chaptersPath, chapter, verse);
          let verseFiles = fs.readdirSync(versePath);
          verseFiles.forEach(dataFile => {
            const verseDataPath = path.join(versePath, dataFile);
            let data = fs.readJsonSync(verseDataPath);
            data.userName = data.userName || "Anonymous";
            checkDataArray.push(data);
          });
        });
      }
    }
    resolve(checkDataArray);
  });
}
