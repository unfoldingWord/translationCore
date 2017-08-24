/* eslint-disable no-console */
import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
import zipFolder from 'zip-folder';
import { ipcRenderer } from 'electron';
// actions
import { loadGroupsDataToExport, loadProjectDataByTypeToExport } from '../utils/loadMethods';
import * as AlertModalActions from './AlertModalActions';
// helpers
import * as csvHelpers from '../helpers/csvHelpers';
// utils
import * as csvMethods from '../utils/csvMethods';

// contant declarations
const OSX_DOCUMENTS_PATH = path.join(path.homedir(), 'Documents');
const WIN_DOCUMENTS_PATH = path.join(path.homedir(), 'My Documents');

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
        let toolPaths = csvHelpers.getToolFolderNames(projectPath);
        if (!toolPaths || !toolPaths.length) {
          throw 'No checks have been performed in this project.';
        }
        return toolPaths;
      })
      .then((toolPaths) => saveAllCSVData(toolPaths, dataFolder, projectId))
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

export const saveAllCSVData = (toolPaths, dataFolder, projectId) => {
  let iterablePromises = [];
  toolPaths.forEach((toolpath) => {
    const p = new Promise((resolve) => {
      return saveAllCSVDataByToolName(toolpath, dataFolder, projectId).then(resolve)
      .then(() => loadProjectDataByTypeToExport(dataFolder, projectId, 'reminders'))
        .then((array) => saveRemindersToCSV(array, dataFolder, indexObject))
      .then(() => loadProjectDataByTypeToExport(dataFolder, projectId, 'selections'))
        .then((array) => saveSelectionsToCSV(array, dataFolder, indexObject))
      .then(() => loadProjectDataByTypeToExport(dataFolder, projectId, 'comments'))
        .then((array) => saveCommentsToCSV(array, dataFolder, indexObject))
      .then(() => loadProjectDataByTypeToExport(dataFolder, projectId, 'verseEdits'))
        .then((array) => saveVerseEditsToCSV(array, dataFolder, indexObject));
    });
    iterablePromises.push(p);
  });
  Promise.all(iterablePromises)
  .then( () => {
    return Promise.resolve(true);
  });
}

/**
 *
 * @param {string} currentToolName - current tool name
 * @param {string} dataFolder - path of the folder to load csv from
 * @param {object} projectId - project Id of current project
 */
export const saveAllCSVDataByToolName = (currentToolName, dataFolder, projectId) => {
  if (currentToolName == '.DS_Store') {
    return Promise.resolve(true);
  } else {
    return loadGroupsDataToExport(currentToolName, dataFolder, projectId)
        .then((obj) => saveGroupsCSVToFs(obj, dataFolder, currentToolName))
      .then(() => {
        return Promise.resolve(true);
      })
      .catch(err => {
        throw "Problem saving data for " + currentToolName + "\n Error:" + err;
      });
  }
}

/**
 * @description - Creates csv from object and saves it.
 * @param {Array} array - array to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export const saveVerseEditsToCSV = (array, dataFolder, indexObject) => {
  const objectArray = array.map( object => {
    const current = object.dataObject;
    const { time, username } = object;
    const data = {
      after: current.verseAfter,
      before: current.verseBefore,
      tags: current.tags
    };
    return csvHelpers.combineData(data, current.contextId, indexObject, username, time);
  });
  const filePath = path.join(dataFolder, 'output', 'check_data', 'VerseEdits.csv');
  csvMethods.generateCSVFile(objectArray, filePath).then( () => {
    return Promise.resolve(true);
  });
}


/**
 * @description - Creates csv from object and saves it.
 * @param {Array} array - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export const saveCommentsToCSV = (array, dataFolder, indexObject) => {
  const objectArray = array.map( object => {
    const { time, username, dataObject } = object;
    const data = { text: dataObject.text }
    return csvHelpers.combineData(data, dataObject.contextId, indexObject, username, time);
  });
  const filePath = path.join(dataFolder, 'output', 'check_data', 'Comments.csv');
  csvMethods.generateCSVFile(objectArray, filePath).then( () => {
    return Promise.resolve(true);
  });
}

/**
 * @description - Creates csv from object and saves it.
 * @param {Array} array - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export const saveSelectionsToCSV = (array, dataFolder, indexObject) => {
  const objectArray = [];
  array.forEach( object => {
    const { time, username } = object;
    const current = object.dataObject;
    current.selections.forEach( selection => {
      const data = {
        text: selection.text,
        "selection/occurrence": selection.occurrence,
        "selection/occurrences": selection.occurrences
      };
      const newObject = csvHelpers.combineData(data, current.contextId, indexObject, username, time);
      objectArray.push(newObject);
    });
  });
  const filePath = path.join(dataFolder, 'output', 'check_data', 'Selections.csv');
  csvMethods.generateCSVFile(objectArray, filePath).then( () => {
    return Promise.resolve(true);
  });
}

/**
 * @description - Creates csv from object and saves it.
 * @param {Array} array - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export const saveRemindersToCSV = (array, dataFolder, indexObject) => {
  const objectArray = array.map( object => {
    const current = object.dataObject;
    const { time, username } = object;
    const data = { enabled: object.enabled }
    return csvHelpers.combineData(data, current.contextId, indexObject, username, time);
  });
  const filePath = path.join(dataFolder, 'output', 'check_data', 'Reminders.csv');
  csvMethods.generateCSVFile(objectArray, filePath).then( () => {
    return Promise.resolve(true);
  });
}

/**
 * @description - Creates csv from object and saves it.
 * @param {object} obj - object to save to the filesystem
 * @param {string} dataFolder - folder to save to filesystem
 * @param {string} currentToolName - name of the tool being saved i.e. translationNotes
 * @param {array} indexObject - Array of index.json with {id, name} keys
 */
export const saveGroupsCSVToFs = (obj, dataFolder, currentToolName) => {
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
  const filePath = path.join(dataFolder, 'output', currentToolName, 'CheckInformation.csv');
  csvMethods.generateCSVFile(objectArray, filePath).then( () => {
    return Promise.resolve(true);
  });
}
