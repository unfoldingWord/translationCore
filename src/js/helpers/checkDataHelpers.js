import path from 'path-extra';
import isEqual from 'deep-equal';
import { PROJECT_CHECKDATA_DIRECTORY } from '../common/constants';
import { isSameVerse } from './contextIdHelpers';

/**
 * Generates a path to a check data item.
 * @param {object} state - redux store state.
 * @param {string} PROJECT_SAVE_LOCATION - project path/directory.
 * @param {string} checkDataName - comments, reminders, selections and verseEdits folders.
 * @return {string} path/directory to be use to load a file.
 */
export function generatePathToDataItems(state, PROJECT_SAVE_LOCATION, checkDataName) {
  if (PROJECT_SAVE_LOCATION && state) {
    let bookAbbreviation = state.projectDetailsReducer.manifest.project.id;
    let loadPath = path.join(
      PROJECT_SAVE_LOCATION,
      PROJECT_CHECKDATA_DIRECTORY,
      checkDataName,
      bookAbbreviation,
    );
    return loadPath;
  }
}

/**
 * filters and sorts an array.
 * @param {array} array - array to be filtered and sorted.
 * @return {array} filtered and sorted array.
 */
export function filterAndSort(array) {
  let filteredArray = array.filter(folder => folder !== '.DS_Store').sort((a, b) => {
    a = parseInt(a, 10);
    b = parseInt(b, 10);
    return a - b;
  });
  return filteredArray;
}

/**
 * searches groupData for a match for contextId (groupData must be for same groupId)
 * @param {Object} contextId
 * @param {Array} groupData for same groupId as contextId
 * @return {number} - returns index of match or -1
 */
export const findGroupDataItem = (contextId, groupData) => {
  let index = -1;
  const isQuoteString = typeof contextId.quote === 'string';

  for (let i = groupData.length - 1; i >= 0; i--) {
    const grpContextId = groupData[i].contextId;

    if (isSameVerse(grpContextId, contextId) &&
      (grpContextId.occurrence === contextId.occurrence) &&
      (isQuoteString ? (grpContextId.quote === contextId.quote) :
        isEqual(grpContextId.quote, contextId.quote))) {
      index = i;
      break;
    }
  }
  return index;
};

/**
 * get value for check attribute and compare with old value - tricky because there is no consistency in field names and representation of value for checks
 * @param {Object} object
 * @param {String} checkAttr
 * @param {Object} oldGroupObject
 * @return {Boolean} true if value has changed
 */
export function isAttributeChanged(object, checkAttr, oldGroupObject) {
  const oldValue = oldGroupObject[checkAttr];
  let value;

  switch (checkAttr) {
  case 'reminders':
    value = !!object['enabled']; // just want true if enabled
    return value !== !!oldValue; // compare boolean equivalents
  case 'comments':
    value = object['text'];
    return value ? (value !== oldValue) : (!value !== !oldValue); // if text set, do exact match.  Otherwise compare boolean equivalents
  case 'invalidated':
    value = !!object[checkAttr]; // just want true if set
    return value !== !!oldValue; // compare boolean equivalents
  case 'selections': {
    // first check for changes in nothingToSelect
    const oldSelectNothing = oldGroupObject['nothingToSelect'];
    const newSelectNothing = object['nothingToSelect'];
    let changed = (!oldSelectNothing !== !newSelectNothing); // compare boolean equivalents

    if (!changed) { // if no change in nothingToSelect, then compare selections
      value = object[checkAttr];
      const hasSelection = value && value.length;

      if (hasSelection) {
        changed = !isEqual(value, oldValue);
      } else {
        const hasOldSelection = oldValue && oldValue.length;
        changed = (!hasSelection !== !hasOldSelection); // compare boolean equivalents of has selections
      }
    }

    return changed;
  }
  case 'verseEdits':
    return true !== !!oldValue; // TRICKY: verse edit is special case since its value is always true
  default: // put warning in log that this check attribute is not supported
    console.log(`isValueChanged() - unsupported check attribute: ${checkAttr}`);
    return false;
  }
}
