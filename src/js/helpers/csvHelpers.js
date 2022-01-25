/* eslint-disable no-throw-literal */
/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import csv from 'csv';
// helpers
import { getQuoteAsString } from 'checking-tool-wrapper';
import * as ResourcesActions from '../actions/ResourcesActions';
// constants
import {
  TRANSLATION_WORDS,
  TRANSLATION_NOTES,
  USER_RESOURCES_PATH,
  TRANSLATION_HELPS,
} from '../common/constants';
import ResourceAPI from './ResourceAPI';
import * as localizationHelpers from './localizationHelpers';
import * as gatewayLanguageHelpers from './gatewayLanguageHelpers';

const cachedGroupIndices = {};
const toolsWithGroupIndices = [TRANSLATION_NOTES, TRANSLATION_WORDS];

/**
  * Gets the group index for a given langCode and toolName with all its category indices flattened into one index.
  * To prevent these files from being read in for every groupName lookup, read them in once and cache them in
  * cachedGroupIndices.
  * @param {string} langCode - language to load the indices
  * @param {string} toolName - toolName to get the indices
  */
function getToolGroupIndex(langCode, toolName) {
  if (! cachedGroupIndices[langCode]) {
    cachedGroupIndices[langCode] = {};
  }

  // load the indices for the given language & tool if not already loaded
  if (!cachedGroupIndices[langCode][toolName] && toolsWithGroupIndices.indexOf(toolName) >= 0) {
    cachedGroupIndices[langCode][toolName] = loadToolGroupIndex(langCode, toolName);
  }
  return cachedGroupIndices[langCode][toolName];
}

/**
 * Loops through a tool's category subdirs to make a flattened list of the indices with id and name and caches it
 * @param {string} langCode - language to load the indices
 * @param {string} toolName - the name of the tool in the same case as its resource directory
 */
function loadToolGroupIndex(langCode, toolName) {
  let index = [];

  try {
    const toolPath = path.join(USER_RESOURCES_PATH, langCode, TRANSLATION_HELPS, toolName);
    let versionPath = ResourceAPI.getLatestVersion(toolPath) || toolPath;

    if (fs.pathExistsSync(versionPath)) {
      const isDirectory = (item) => fs.lstatSync(path.join(versionPath, item)).isDirectory();
      const categories = fs.readdirSync(versionPath).filter(isDirectory);

      categories.forEach(category => {
        const indexPath = path.join(versionPath, category, 'index.json');

        if (fs.existsSync(indexPath)) {
          try {
            const items = fs.readJsonSync(indexPath);

            items.forEach(item => {
              item.category = category; // adds the category as a field since this is being flattened from the directory
              index.push(item);
            });
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
 * @param {string} gatewayLanguageCode
 * @param {string} gatewayLanguageQuote
 * @param {string} username
 * @param {timestamp} timestamp to be converted into date and time
 * @param {function} translate - the translation function
 * @param {string} glOwner
 * @return {object}
 */
export function combineData(data, contextId, gatewayLanguageCode, gatewayLanguageQuote, username, timestamp, translate, glOwner) {
  const flatContextId = flattenContextId(contextId, gatewayLanguageCode, gatewayLanguageQuote, translate, glOwner);
  const userTimestamp = userTimestampObject(username, timestamp);
  return Object.assign({}, data, flatContextId, userTimestamp);
}

/**
 * @description - flattens the context id for csv usage
 * @param {object} contextId - contextID object that needs to go onto the csv row
 * @param {string} gatewayLanguageCode - language code, if empty, will use 'en' and find the GL Quote by it
 * @param {string} gatewayLanguageQuote - language quote, can be empty
 * @param {function} translate - translation function
 * @param {string} glOwner
 * @return {object}
 */
export const flattenContextId = (contextId, gatewayLanguageCode, gatewayLanguageQuote, translate, glOwner) => {
  // if GL code not given, use 'en'
  gatewayLanguageCode = gatewayLanguageCode || 'en';
  // if GL quote not given, get it from the aligned 'ult' Bible of that language, otherwise 'N/A'
  gatewayLanguageQuote = gatewayLanguageQuote || getGLQuoteFromAlignedBible(contextId, gatewayLanguageCode, glOwner) || 'N/A';
  // if no occurrenceNote in contextId, 'N/A'
  const occurrenceNote = contextId.occurrenceNote || 'N/A';
  const verse_ = contextId.verseSpan || contextId.reference.verse; // use verse span if given
  return {
    tool: contextId.tool,
    type: groupCategoryTranslated(contextId, gatewayLanguageCode, translate),
    groupId: contextId.groupId,
    groupName: groupName(contextId, gatewayLanguageCode),
    occurrence: contextId.occurrence,
    quote: getQuoteAsString(contextId.quote),
    gatewayLanguageCode: gatewayLanguageCode,
    gatewayLanguageQuote: gatewayLanguageQuote,
    occurrenceNote: occurrenceNote,
    checkId: contextId.checkId || '',
    bookId: contextId.reference.bookId,
    chapter: contextId.reference.chapter,
    verse: verse_,
  };
};

/**
 * Gets the GL Quote information to add to the contextId
 * @param {object} contextId
 * @param {string} langCode - language code which to get the quote from the aligned Bible
 * @param {string} owner
 * @return {object}
 */
export const getGLQuoteFromAlignedBible = (contextId, langCode, owner) => {
  const glBibleId = 'ult'; // TODO: Dynamically get all Bibles for the glCode to find GL Quote from aligned Bible
  const bookId = contextId.reference.bookId;
  const bible = ResourcesActions.loadBookResource(glBibleId, bookId, langCode, owner); // this is cached in the called function
  return gatewayLanguageHelpers.getAlignedTextFromBible(contextId, bible);
};

/**
 * @description - Returns the corresponding group name i.e. Metaphor
 * when given the group id of figs-metaphor
 * @param {Object} contextId - context id to get toolName and groupName
 * @param {string} langCode - language to get the groupName
 * @return {string}
 */
export const groupName = (contextId, langCode) => {
  const { tool, groupId } = contextId;
  const groupIndex = getToolGroupIndex(langCode, tool);
  const indexObject = {};
  let groupName;

  if (groupIndex) {
    groupIndex.forEach(group => {
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
 * @description - Returns the corresponding group parent category, i.e. figures
 * when given the group id of figs-metaphor
 * @param {Object} contextId - context id to get toolName and groupName
 * @param {string} langCode - language to get the groupCategory
 * @return {string}
 */
export const groupCategory = (contextId, langCode) => {
  const { tool, groupId } = contextId;
  const groupIndex = getToolGroupIndex(langCode, tool);
  const indexObject = {};

  if (groupIndex) {
    groupIndex.forEach(group => {
      indexObject[group.id] = group.category;
    });

    if (!indexObject[groupId]) {
      console.warn('Could not find group name for id: ', groupId, ' in tool: ', tool);
    } else {
      return indexObject[groupId];
    }
  }
};

/**
 * @description - Returns the human readable (translated) string of the group category
 * @param {Object} contextId - context id to get toolName and groupName
 * @param {string} langCode - language of the groupCategory
 * @param {function} translate - translation function
 * @return {string}
 */
export const groupCategoryTranslated = (contextId, langCode, translate) => {
  const category = groupCategory(contextId, langCode);

  if (category) {
    // We return the translation, unless that tool_card_categories.<category> doesn't exist, then just return category
    return localizationHelpers.getTranslation(translate, 'tool_card_categories.' + category, category);
  }
};

/**
 * @description - turns a username and timestamp into usable object for csv
 * @param {string} username
 * @param {timestamp} timestamp to be converted into date and time
 */
export const userTimestampObject = (username, timestamp) => ({
  username,
  date: dateFromTimestamp(timestamp),
  time: timeFromTimestamp(timestamp),
});

/**
 * @description - turns a timestamp into date
 * @param {timestamp} timestamp to be converted into date
 */
export const dateFromTimestamp = (timestamp) => {
  const datetime = timestamp.replace(/_/g, ':');
  const dateObj = new Date(datetime);
  //Converts to format as such DD/MM/YYYY
  const date = [pad(dateObj.getMonth() + 1), pad(dateObj.getDate()), dateObj.getFullYear()].join('/');
  return date;
};

/**
 * @description - turns a timestamp into time
 * @param {timestamp} timestamp to be converted into time
 */
export const timeFromTimestamp = (timestamp) => {
  const datetime = timestamp.replace(/_/g, ':');
  //Converts to format as such HH:MM:SS
  const time = new Date(datetime).toString().split(' ')[4];
  return time;
};

/**
 * @description - Pad numbers to make them sortable and human readable
 * @param {int} number
 */
const pad = (number) => number < 10 ? 0 + `${number}` : number;

/**
 * @description - Gets the tool folder names
 * @param {string} projectPath
 */
export function getToolFolderNames(projectPath) {
  const _dataPath = dataPath(projectPath);
  let toolsPath = path.join(_dataPath, 'index');

  if (fs.existsSync(toolsPath)) {
    let toolNames = fs.readdirSync(toolsPath)
      .filter(file => fs.lstatSync(path.join(toolsPath, file)).isDirectory());
    return toolNames;
    // TODO: check to see if it is a directory and only return those
  } else {
    console.warn('Could not find index path for tool information');
  }
}

export const dataPath = (projectPath) => path.join(projectPath, '.apps', 'translationCore');

export const tmpPath = (projectPath) => path.join(dataPath(projectPath), 'output');

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
  throw `Cannot read project manifest: ${manifestPath}`;
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
      const row = headers.map(header => object[header]);
      return row;
    });
    // make the headers the first row and append the rows
    const data = [headers].concat(rows);

    csv.stringify(data, function (err, data){
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
export const generateCSVFile = (objectArray, filePath) => new Promise(function (resolve, reject) {
  generateCSVString(objectArray, (err, csvString) => {
    if (err) {
      console.error(err);
      reject(err);
    } else {
      try {
        if (csvString) {
          fs.outputFileSync(filePath, csvString);
        }
        resolve(true);
      } catch (_err) {
        console.error(_err);
        reject(_err);
      }
    }
  });
});
