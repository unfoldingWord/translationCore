/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from "ospath";
import csv from 'csv';
// helpers
import * as groupsIndexHelpers from './groupsIndexHelpers';
import ResourceAPI from "./ResourceAPI";
// constants
export const USER_RESOURCES_PATH = path.join(ospath.home(), "translationCore", "resources");
const tHelpsPath = path.join(USER_RESOURCES_PATH, 'en', 'translationHelps');
export const TestThelpsPath = path.join('__tests__', 'fixtures', 'resources', 'en', 'translationHelps');
let tWIndex = [];
let tNIndex = [];
let cachedForTest = false;

 /**
  * To prevent these files from being read in for every groupName lookup, read them in once.
  * @param {boolean} isTest - for unit tests purposes
  */
function cacheIndicies(isTest) {
  // skip loading if indicies have already been loaded
   // unless previously for a test or this is a test, then we want to reload
  if(! cachedForTest && tWIndex.length > 0 && tNIndex.length > 0) {
    return;
  }
  // load tW indices
  tWIndex = loadToolIndices('translationWords', isTest);
  // load tN indices
  tNIndex = loadToolIndices('translationNotes', isTest);
  cachedForTest = isTest;
}

/**
 * Loops through a tool's category subdirs to make a flattened list of the indexes with id and name
 * @param {string} toolName - the name of the tool in the same case as its resource directory
 * @param {boolean} isTest - for unit test purposes
 * @return {array}
 */
function loadToolIndices(toolName, isTest) {
  let index = [];
  try {
    const thPath = isTest ? TestThelpsPath : tHelpsPath;
    const toolPath = path.join(thPath, toolName);
    let versionPath = ResourceAPI.getLatestVersion(toolPath) || toolPath;
    if (fs.pathExistsSync(versionPath)) {
      const isDirectory = (item) => fs.lstatSync(path.join(versionPath, item)).isDirectory();
      const categories = fs.readdirSync(versionPath).filter(isDirectory);
      categories.forEach(category => {
        const indexPath = path.join(versionPath, category, "index.json");
        if (fs.existsSync(indexPath)) {
          try {
            index = index.concat(fs.readJsonSync(indexPath));
          } catch (e) {
            console.error(`Failed to read the category index at ${indexPath}`, e);
          }
        }
      });
    }
  } catch (e) {
    console.error(`Failed to read tool category directories for ${toolName}`, e);
  }
  return index;
}


/**
 * @description - combines all data needed for csv
 * @param {object} data - the data that the rest appends to
 * @param {object} contextId - to be merged in
 * @param {string} username
 * @param {timestamp} timestamp to be converted into date and time
 * @param {boolean} isTest - for unit tests purposes
 * @return {object}
 */
export function combineData(data, contextId, username, timestamp, isTest) {
  const flatContextId = flattenContextId(contextId, isTest);
  const userTimestamp = userTimestampObject(username, timestamp);
  return Object.assign({}, data, flatContextId, userTimestamp);
}
/**
 * @description - flattens the context id for csv usage
 * @param {object} contextId - contextID object that needs to go onto the csv row
 * @param {boolean} isTest - for unit tests purposes
 * @return {object}
 */
export const flattenContextId = (contextId, isTest) => {
  return {
    tool: contextId.tool,
    groupId: contextId.groupId,
    groupName: groupName(contextId, isTest),
    occurrence: contextId.occurrence,
    quote: flattenQuote(contextId.quote),
    bookId: contextId.reference.bookId,
    chapter: contextId.reference.chapter,
    verse: contextId.reference.verse
  };
};

/**
 * Flattens a quote which may be an array of words
 * @param {*} quote
 * @returns {string}
 */
export const flattenQuote = quote => {
  if (Array.isArray(quote)) {
    quote = quote.map(item => item.word).join(" ");
  }
  return quote;
};

/**
 * @description - Returns the corresponding group name i.e. Metaphor
 * given the group id such as figs_metaphor
 * @param {Object} contextId - context id to get toolName and groupName
 * @param {boolean} isTest - for unit tests purposes
 * @return {string}
 */
export const groupName = (contextId, isTest) => {
  cacheIndicies(isTest);

  let indexArray;
  let {tool, groupId} = contextId;
  switch (tool) {
    case 'translationNotes':
      indexArray = tNIndex;
      break;
    case 'translationWords':
      indexArray = tWIndex;
      break;
    default:
      indexArray = undefined;
      // do something later with other resources
  }
  let indexObject = {};
  let groupName;
  if (indexArray) {
    indexArray.forEach( group => {
      indexObject[group.id] = group.name;
    });
    groupName = indexObject[groupId];
    if (!groupName) {
      console.warn('Could not find group name for id: ', groupId, ' in tool: ', tool);
    }
  } else {
    // if other tools don't have an indexArray, just return groupId as groupName
    groupName = groupId;
  }
  return groupName;
};

/**
 * @description - turns a username and timestamp into usable object for csv
 * @param {string} username
 * @param {timestamp} timestamp to be converted into date and time
 */
export const userTimestampObject = (username, timestamp) => {
  return {
    username,
    date: dateFromTimestamp(timestamp),
    time: timeFromTimestamp(timestamp)
  };
};
/**
 * @description - turns a timestamp into date
 * @param {timestamp} timestamp to be converted into date
 */
export const dateFromTimestamp = (timestamp) => {
    const datetime = timestamp.replace(/_/g, ":");
    const dateObj = new Date(datetime);
    //Converts to format as such DD/MM/YYYY
    const date = [pad(dateObj.getMonth() + 1), pad(dateObj.getDate()), dateObj.getFullYear()].join("/");
    return date;
};
/**
 * @description - turns a timestamp into time
 * @param {timestamp} timestamp to be converted into time
 */
export const timeFromTimestamp = (timestamp) => {
  const datetime = timestamp.replace(/_/g, ":");
  //Converts to format as such HH:MM:SS
  const time = new Date(datetime).toString().split(" ")[4];
  return time;
};
/**
 * @description - Pad numbers to make them sortable and human readable
 * @param {int} number
 */
const pad = (number) => {
  return number < 10 ? 0 + `${number}` : number;
};
/**
 * @description - Gets the tool folder names
 * @param {string} projectPath
 */
export function getToolFolderNames(projectPath) {
  const _dataPath = dataPath(projectPath);
  let toolsPath = path.join(_dataPath, 'index');
  if (fs.existsSync(toolsPath)) {
    let toolNames = fs.readdirSync(toolsPath)
    .filter(file => { return fs.lstatSync(path.join(toolsPath, file)).isDirectory() });
    return toolNames;
    // TODO! check to see if it is a directory and only return those
  } else {
    console.log('Could not find index path for tool information');
  }
}
export const dataPath = (projectPath) => {
  return path.join(projectPath, '.apps', 'translationCore');
};
export const tmpPath = (projectPath) => {
  return path.join(dataPath(projectPath), 'output');
};
/**
 * @description - cleanup the temporary csv files
 * @param {string} tmpPath - Path to cleanup
 */
export const cleanupTmpPath = (projectPath) => {
  const _tmpPath = tmpPath(projectPath);
  if (fs.existsSync(_tmpPath)) {
    fs.removeSync(path.join(_tmpPath));
  }
};
/**
 * @description - get the project id from the manifest in the projectPath
 * @param {string} projectPath - Path to current project
 */
export const getProjectId = (projectPath) => {
  let projectId;
  const manifestPath = path.join(projectPath, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readJsonSync(manifestPath);
    projectId = (manifest && manifest.project) ? manifest.project.id : undefined;
    return projectId;
  }
  throw 'Cannot read project manifest: ', manifestPath;
};
/**
 * @description - Generates a CSVString from an array of objects
 * @param {Array} objectArray - array of objects to convert to csv
 * @param {function} callback - The callback that passes err, csv string output
 */
export const generateCSVString = (objectArray, callback) => {
  if (objectArray.length > 0) {
    // extract the headers from the objectArray, assuming first is representative
    const headers = Object.keys(objectArray[0]);
    // loop through the objectArray to generate a row from each object in the array
    const rows = objectArray.map(object => {
      // use the headers to get the values of each object to create the row
      const row = headers.map(header => {
        return object[header];
      });
      return row;
    });
    // make the headers the first row and append the rows
    const data = [headers].concat(rows);
    csv.stringify(data, function(err, data){
      callback(err, data);
    });
  } else { // there is no data, give back enough data to create an empty file.
    const data = [['No data']];
    callback(null, data);
  }
};
/**
 * @description - Generates a CSV and writes to File from an array of objects
 * @param {Array} objectArray - array of objects to convert to csv
 * @param {string} filePath - path of the file to write
 */
export const generateCSVFile = (objectArray, filePath) => {
  return new Promise(function(resolve, reject) {
    generateCSVString(objectArray, (err, csvString) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        try {
          if (csvString) {
            fs.outputFileSync(filePath, csvString);
          }
          resolve(true);
        } catch (_err) {
          console.log(_err);
          reject(_err);
        }
      }
    });
  });
};

/**
 * loads the groups index array using the toolname
 * from objectData
 * @param {Object} objectData
 */
export function getGroupsIndexForCsvExport(objectData) {
  try {
    let groupsIndex = [];
    if (objectData && objectData.contextId && objectData.contextId.tool && objectData.contextId.groupId) {
      const toolName = objectData.contextId.tool;
      groupsIndex = groupsIndexHelpers.getGroupsIndex('en', toolName);
    }
  return groupsIndex;
  } catch (error) {
    console.error(error);
  }
}
