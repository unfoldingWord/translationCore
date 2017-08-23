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
      .then((toolPaths) => {
        let promises = Promise.resolve(true);

        toolPaths.forEach((toolpath) => {
          promises = promises.then(() => {
            return saveAllCSVDataByToolName(toolpath, dataFolder, projectId)
              .then( () => { return promises });
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
    return loadGroupsDataToExport(currentToolName, dataFolder, projectId)
        .then((obj) => saveGroupsCSVToFs(obj, dataFolder, currentToolName, indexObject))
      .then(() => loadProjectDataByTypeToExport(dataFolder, projectId, 'reminders'))
        .then((array) => saveRemindersToCSV(array, dataFolder, currentToolName, indexObject))
      .then(() => loadProjectDataByTypeToExport(dataFolder, projectId, 'selections'))
        .then((array) => saveSelectionsToCSV(array, dataFolder, currentToolName, indexObject))
      .then(() => loadProjectDataByTypeToExport(dataFolder, projectId, 'comments'))
        .then((array) => saveCommentsToCSV(array, dataFolder, currentToolName, indexObject))
      .then(() => loadProjectDataByTypeToExport(dataFolder, projectId, 'verseEdits'))
        .then((array) => saveVerseEditsToCSV(array, dataFolder, currentToolName, indexObject))
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
export function saveVerseEditsToCSV(array, dataFolder, currentToolName, indexObject) {
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
  const filePath = path.join(dataFolder, 'output', currentToolName, 'VerseEdits.csv');
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
export function saveCommentsToCSV(array, dataFolder, currentToolName, indexObject) {
  const objectArray = array.map( object => {
    const current = object.dataObject;
    const { time, username } = object;
    const data = { text: object.text }
    return csvHelpers.combineData(data, current.contextId, indexObject, username, time);
  });
  const filePath = path.join(dataFolder, 'output', currentToolName, 'Comments.csv');
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
export function saveSelectionsToCSV(array, dataFolder, currentToolName, indexObject) {
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
  const filePath = path.join(dataFolder, 'output', currentToolName, 'Selections.csv');
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
export function saveRemindersToCSV(array, dataFolder, currentToolName, indexObject) {
  const objectArray = array.map( object => {
    const current = object.dataObject;
    const { time, username } = object;
    const data = { enabled: object.enabled }
    return csvHelpers.combineData(data, current.contextId, indexObject, username, time);
  });
  const filePath = path.join(dataFolder, 'output', currentToolName, 'Reminders.csv');
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
export function saveGroupsCSVToFs(obj, dataFolder, currentToolName, indexObject) {
  let objectArray = [];
  const groupNames = Object.keys(obj);
  groupNames.forEach( groupName => {
    obj[groupName].forEach( groupData => {
      const object = groupData;
      const data = { priority: object.priority }
      const flatContextId = csvHelpers.flattenContextId(object.contextId, indexObject);
      const newObject = Object.assign({}, data, flatContextId);
      objectArray.push(newObject);
    });
  });
  const filePath = path.join(dataFolder, 'output', currentToolName, 'CheckInformation.csv');
  csvMethods.generateCSVFile(objectArray, filePath).then( () => {
    return Promise.resolve(true);
  });
}
