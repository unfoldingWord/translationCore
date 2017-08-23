/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
// utils
import { getGroupName } from '../utils/loadMethods';

/**
 * @description - combines all data needed for csv
 * @param {object} data - the data that the rest appends to
 * @param {object} contextId - to be merged in
 * @param {object} indexObject - to be used to get groupName
 * @param {array} indexObject - Array of index.json with {id, name} keys
 * @param {string} username
 * @param {timestamp} timestamp to be converted into date and time
 * @return {object}
 */
export function combineData(data, contextId, indexObject, username, timestamp) {
  const flatContextId = flattenContextId(contextId, indexObject);
  const userTimestamp = userTimestampObject(username, timestamp);
  const combinedData = Object.assign({}, data, flatContextId, userTimestamp);
  return combinedData;
}
/**
 * @description - flattens the context id for csv usage
 * @param {object} contextId - contextID object that needs to go onto the csv row
 * @param {array} indexObject - Array of index.json with {id, name} keys
 * @return {object}
 */
export const flattenContextId = (contextId, indexObject) => {
  const flatContextId = {
    groupId: contextId.groupId,
    groupName: getGroupName(indexObject, contextId.groupId),
    occurrence: contextId.occurrence,
    quote: contextId.quote,
    bookId: contextId.reference.bookId,
    chapter: contextId.reference.chapter,
    verse: contextId.reference.verse
  }
  return flatContextId;
}
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
}
/**
 * @description - turns a timestamp into date
 * @param {timestamp} timestamp to be converted into date
 */
export const dateFromTimestamp = (timestamp) => {
    const datetime = timestamp.replace(/_/g, ":");
    const dateObj = new Date(datetime)
    //Converts to format as such DD/MM/YYYY
    const date = [pad(dateObj.getMonth() + 1), pad(dateObj.getDate()), dateObj.getFullYear()].join("/");
    return date
}
/**
 * @description - turns a timestamp into time
 * @param {timestamp} timestamp to be converted into time
 */
export const timeFromTimestamp = (timestamp) => {
  const datetime = timestamp.replace(/_/g, ":");
  //Converts to format as such HH:MM:SS
  const time = new Date(datetime).toString().split(" ")[4];
  return time
}
/**
 * @description - Pad numbers to make them sortable and human readable
 * @param {int} number
 */
const pad = (number) => {
  return number < 10 ? 0 + `${number}` : number;
}
/**
 * @description - Gets the tool folder names
 * @param {string} projectPath
 */
export function getToolFolderNames(projectPath) {
  try {
    return fs.readdirSync(path.join(projectPath, '.apps', 'translationCore', 'index'));
  } catch (e) {
    console.log(e);
  }
}
