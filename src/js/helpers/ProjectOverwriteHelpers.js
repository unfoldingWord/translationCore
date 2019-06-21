import fs from 'fs-extra';
import path from 'path-extra';
import {generateTimestamp} from './index';
import usfm from "usfm-js";
import {checkSelectionOccurrences} from 'selections';
import isEqual from 'deep-equal';
import * as AlertModalActions from '../actions/AlertModalActions';
import {getTranslate, getToolsByKey} from '../selectors';
import {loadProjectGroupData} from './ResourcesHelpers';
const CHECKDATA_DIRECTORY = path.join('.apps', 'translationCore', 'checkData');

/**
 * @description Copies existing project checks from the old project path to the new project path
 * @param {String} oldProjectPath
 * @param {String} newProjectPath
 * @param {function} translate
 */
export const mergeOldProjectToNewProject = (oldProjectPath, newProjectPath, userName, dispatch) => {
  // if project path doesn't exist, it must have been deleted after tC was started. We throw an error and tell them to import the project again
  if (fs.existsSync(oldProjectPath) && fs.existsSync(newProjectPath)) {
    let oldAppsPath = path.join(oldProjectPath, '.apps');
    let newAppsPath = path.join(newProjectPath, '.apps');
    if (fs.existsSync(oldAppsPath)) {
      if (!fs.existsSync(newAppsPath)) {
        // There is no .apps data in the new path, so we just copy over the old .apps path and we are good to go
        fs.copySync(oldAppsPath, newAppsPath);
      } else {
        // There is alignment data in the new project path, so we need to move it out, preserve any
        // check data, and then copy any new alignment data from the new project path to the alignment data
        // from the old project path
        let alignmentPath = path.join(newAppsPath, 'translationCore', 'alignmentData');
        if (fs.existsSync(alignmentPath)) {
          const bookId = getBookId(newProjectPath);
          let tempAlignmentPath = path.join(newProjectPath, '.temp_alignmentData');
          fs.moveSync(alignmentPath, tempAlignmentPath); // moving new alignment data to a temp dir
          fs.removeSync(newAppsPath); // .apps dir can be removed since we only need new alignment data
          fs.copySync(oldAppsPath, newAppsPath); // copying the old project's .apps dir to preserve it
          // Now we overwrite any alignment data of the old project path from the new project path
          copyAlignmentData(path.join(tempAlignmentPath, bookId), path.join(alignmentPath, bookId));
          fs.removeSync(tempAlignmentPath); // Done with the temp alignment dir
        }
      }
    }
    // Copy the .git history of the old project into the new if it doesn't have it
    const oldGitPath = path.join(oldProjectPath, '.git');
    const newGitPath = path.join(newProjectPath, '.git');
    if (! fs.existsSync(newGitPath) && fs.existsSync(oldGitPath)) {
      fs.copySync(oldGitPath, newGitPath);
    }
    dispatch(createVerseEditsForAllChangedVerses(oldProjectPath, newProjectPath, userName));
  }
};

export const copyAlignmentData = (fromDir, toDir) => {
  let fromFiles = fs.readdirSync(fromDir).filter(file => path.extname(file) === '.json').sort();
  let toFiles = [];
  if (fs.existsSync(toDir))
    toFiles = fs.readdirSync(toDir).filter(file => path.extname(file) === '.json').sort();
  fs.mkdirpSync(toDir);
  fromFiles.forEach(file => {
    let fromFileJson = fs.readJsonSync(path.join(fromDir, file));
    let toFileJson = {};
    const toFileIndex = toFiles.indexOf(file);
    if (toFileIndex >= 0) {
      toFileJson = fs.readJsonSync(path.join(toDir, toFiles[toFileIndex]));
    }
    Object.keys(fromFileJson).forEach(function (verseNum) {
      if(!toFileJson[verseNum] || !toFileJson[verseNum].alignments) {
        toFileJson[verseNum] = fromFileJson[verseNum];
      }  else {
        const alignments = fromFileJson[verseNum].alignments;
        let hasAlignments = false;
        alignments.forEach(alignment => {
          if (alignment.bottomWords.length > 0) {
            hasAlignments = true;
          }
        });
        if (hasAlignments) {
          toFileJson[verseNum] = fromFileJson[verseNum];
        }
      }
    });
    fs.writeJsonSync(path.join(toDir, file), toFileJson);
  });
};

export const getBookId = (projectPath) => {
  const manifest = fs.readJsonSync(path.join(projectPath, 'manifest.json'));
  return manifest.project.id;
};

export const getProjectName = (projectPath) => {
  return path.basename(projectPath);
};

export const createVerseEditsForAllChangedVerses = (oldProjectPath, newProjectPath, userName) => {
  return (dispatch, getState) => {
    const bookId = getBookId(newProjectPath);
    const oldBiblePath = path.join(oldProjectPath, bookId);
    const newBiblePath = path.join(newProjectPath, bookId);
    if (!fs.pathExistsSync(oldBiblePath) || !fs.pathExistsSync(newBiblePath))
      return;
    const chapterFiles = fs.readdirSync(oldBiblePath).filter(filename => path.extname(filename) == '.json' && parseInt(path.basename(filename)));
    chapterFiles.forEach(filename => {
      try {
        const chapter = parseInt(path.basename(filename));
        const oldChapterVerses = fs.readJsonSync(path.join(oldBiblePath, filename));
        const newChapterVerses = fs.readJsonSync(path.join(newBiblePath, filename));
        Object.keys(newChapterVerses).forEach(verse => {
          let verseBefore = oldChapterVerses[verse];
          let verseAfter = newChapterVerses[verse];
          verse = parseInt(verse);
          if (verseBefore != verseAfter) {
            //An external edit happened
            createExternalVerseEdit(newProjectPath, verseBefore, verseAfter, bookId, chapter, verse, userName);
            const tools = getToolsByKey(getState());
            for (var toolName in tools) {
              dispatch(validateSelectionsForTool(newProjectPath, chapter, verse, bookId, verseAfter, userName, toolName));
            }
          }
        });
      } catch (error) {
        console.log(error);
      }
    });
  };
};

export function validateSelectionsForTool(projectSaveLocation, chapter, verse, bookId, targetVerse, userName, toolName) {
  return (dispatch, getState) => {
    const contextId = {
      reference: {
        bookId,
        chapter: parseInt(chapter),
        verse: parseInt(verse)
      }
    };
    const groupsData = loadProjectGroupData(toolName, projectSaveLocation);
    const groupsDataForVerse = getGroupDataForVerse(groupsData, contextId, name);
    let filtered = null;
    let selectionsChanged = false;
    for (let groupItemKey of Object.keys(groupsDataForVerse)) {
      const groupItem = groupsDataForVerse[groupItemKey];
      for (let checkingOccurrence of groupItem) {
        const selections = checkingOccurrence.selections;
        if (!sameContext(contextId, checkingOccurrence.contextId)) {
          if (selections && selections.length) {
            if (!filtered) {  // for performance, we filter the verse only once and only if there is a selection
              filtered = usfm.removeMarker(targetVerse); // remove USFM markers
            }
            const validSelections = checkSelectionOccurrences(filtered, selections);
            if (selections.length !== validSelections.length) {
              const selectionsObject = getSelectionsFromChapterAndVerseCombo(
                bookId,
                chapter,
                verse,
                projectSaveLocation,
                checkingOccurrence.contextId.quote
              );
              //If selections are changed, they need to be clearded
              selectionsChanged = true;
              const invalidatedCheckPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'checkData', 'invalidated', bookId, chapter.toString(), verse.toString());
              const invalidatedPayload = {
                ...selectionsObject,
                invalidated: true,
                selections: [],
                userName
              };
              writeCheckData(invalidatedPayload, invalidatedCheckPath);

              const selectionsCheckPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'checkData', 'selections', bookId, chapter.toString(), verse.toString());
              const selectionsPayload = {
                ...selectionsObject,
                selections: [],
                userName
              };
              writeCheckData(selectionsPayload, selectionsCheckPath);
            }
          }
        }
      }
    }
    if (selectionsChanged) {
      const translate = getTranslate(getState());
      dispatch(AlertModalActions.openOptionDialog(translate('selections_invalidated')));
    }
  };
}

function writeCheckData(payload = {}, checkPath) {
  const modifiedTimestamp = generateTimestamp();
  const newFilename = modifiedTimestamp + '.json';
  payload.modifiedTimestamp = modifiedTimestamp;
  fs.outputJSONSync(path.join(checkPath, newFilename.replace(/[:"]/g, '_')), payload);
}

export const createExternalVerseEdit = (projectPath, verseBefore, verseAfter, bookId, chapter, verse, userName) => {
  const verseEdit = {
    verseBefore,
    verseAfter,
    tags: 'N/A',
    userName,
    activeBook: 'N/A',
    activeChapter: 'N/A',
    activeVerse: 'N/A',
    gatewayLanguageCode: 'N/A',
    gatewayLanguageQuote: 'N/A',
    contextId: {
      reference: {
        bookId,
        chapter,
        verse
      },
      tool: '[External edit]',
      groupId: 'N/A'
    },
  };
  const verseEditsPath = path.join(projectPath, '.apps', 'translationCore', 'checkData', 'verseEdits', bookId, chapter.toString(), verse.toString());
  writeCheckData(verseEdit, verseEditsPath);
};

/**
* @description gets the group data for the current verse from groupsDataReducer
* @param {Object} groupsData
* @param {Object} contextId
* @return {object} group data object.
*/
export function getGroupDataForVerse(groupsData, contextId) {
  const filteredGroupData = {};
  for (let groupItemKey of Object.keys(groupsData)) {
    const groupItem = groupsData[groupItemKey];
    if (groupItem) {
      for (let check of groupItem) {
        try {
          if (isEqual(check.contextId.reference, contextId.reference)) {
            if (!filteredGroupData[groupItemKey]) {
              filteredGroupData[groupItemKey] = [];
            }
            filteredGroupData[groupItemKey].push(check);
          }
        } catch (e) {
          console.warn(`Corrupt check found in group "${groupItemKey}"`, check);
        }
      }
    }
  }
  return filteredGroupData;
}

/**
 * returns true if contextIds are a match for reference and group
 * @param {Object} contextId1
 * @param {Object} contextId2
 * @return {boolean}
 */
export function sameContext(contextId1, contextId2) {
  if (!!contextId1 && !!contextId2) {
    return isEqual(contextId1.reference, contextId2.reference) &&
      (contextId1.groupId === contextId2.groupId);
  }
  return false;
}

export function getSelectionsFromChapterAndVerseCombo(bookId, chapter, verse, projectSaveLocation, quote = "") {
  let selectionsObject = {};
  const contextId = {
    reference: {
      bookId,
      chapter,
      verse
    }
  };
  const selectionsPath = generateLoadPath(projectSaveLocation, contextId, 'selections');

  if (fs.existsSync(selectionsPath)) {
    let files = fs.readdirSync(selectionsPath);
    files = files.filter(file => { // filter the filenames to only use .json
      return path.extname(file) === '.json';
    });
    let sorted = files.sort().reverse(); // sort the files to use latest
    if (quote) {
      sorted = sorted.filter((filename) => {
        const currentSelectionsObject = fs.readJsonSync(path.join(selectionsPath, filename));
        return JSON.stringify(currentSelectionsObject.contextId.quote) === JSON.stringify(quote);
      });
    }
    const filename = sorted[0];
    selectionsObject = fs.readJsonSync(path.join(selectionsPath, filename));
  }
  return selectionsObject;
}


/**
 * Generates the output directory.
 * @param {Object} state - store state object.
 * @param {String} checkDataName - checkDate folder name where data will be saved.
 *  @example 'comments', 'reminders', 'selections', 'verseEdits' etc.
 * @return {String} save path
 */
export function generateLoadPath(projectSaveLocation, contextId, checkDataName) {
  /**
  * @description output directory
  *  /translationCore/ar_eph_text_ulb/.apps/translationCore/checkData/comments/eph/1/3
  * @example PROJECT_SAVE_LOCATION - /translationCore/ar_eph_text_ulb
  * @example CHECKDATA_DIRECTORY - /.apps/translationCore/checkData
  * @example bookAbbreviation - /eph
  * @example checkDataName - /comments
  * @example chapter - /1
  * @example verse - /3
  */
  const PROJECT_SAVE_LOCATION = projectSaveLocation;
  if (PROJECT_SAVE_LOCATION) {
    let bookAbbreviation = contextId.reference.bookId;
    let chapter = contextId.reference.chapter.toString();
    let verse = contextId.reference.verse.toString();
    let loadPath = path.join(
      PROJECT_SAVE_LOCATION,
      CHECKDATA_DIRECTORY,
      checkDataName,
      bookAbbreviation,
      chapter,
      verse
    );
    return loadPath;
  }
}