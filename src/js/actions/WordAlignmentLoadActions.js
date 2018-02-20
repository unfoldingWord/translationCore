/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import consts from '../actions/ActionTypes';
// helpers
import * as WordAlignmentHelpers from '../helpers/WordAlignmentHelpers';
import * as stringHelpers from '../helpers/stringHelpers';
import * as VerseObjectHelpers from '../helpers/VerseObjectHelpers';

/**
 * populates the wordAlignmentData reducer.
 * @param {Object} alignmentData - current chapter scope of alignmentData
 */
export const updateAlignmentData = (alignmentData) => {
  return ((dispatch) => {
    dispatch({
      type: consts.UPDATE_ALIGNMENT_DATA,
      alignmentData: alignmentData
    });
  });
};
/**
 * @description this function saves the current alignmentData into the file system.
 */
export const loadAlignmentData = () => {
  return ((dispatch, getState) => {
    const {
      wordAlignmentReducer: {
        alignmentData
      },
      projectDetailsReducer: {
        projectSaveLocation
      },
      contextIdReducer: {
        contextId: {
          reference: { bookId, chapter, verse }
        }
      }
    } = getState();
    let _alignmentData = JSON.parse(JSON.stringify(alignmentData));
    const alignmentDataPath = path.join('.apps', 'translationCore', 'alignmentData');
    const filePath = path.join(alignmentDataPath, bookId, chapter + '.json');
    const loadPath = path.join(projectSaveLocation, filePath);
    if (fs.existsSync(loadPath)) {
      const chapterData = fs.readJsonSync(loadPath);
      _alignmentData[chapter] = WordAlignmentHelpers.checkProjectForVerseChanges(chapterData, bookId, chapter, verse, projectSaveLocation);
      _alignmentData[chapter] = cleanAlignmentData(chapterData); // TODO: can remove this once migration is completed
      dispatch(updateAlignmentData(_alignmentData));
    } else {
      dispatch(populateEmptyChapterAlignmentData());
    }
  });
};
/**
 * @description Scans alignment data for old data
 * @param {Array} chapterData - array of verse data containing alignments
 * @return {*}
 */
let cleanAlignmentData = function (chapterData) {
  for (let verse of Object.keys(chapterData)) {
    for (let alignment of chapterData[verse].alignments) {
      cleanWordList(alignment.topWords);
    }
  }
  return chapterData;
};
/**
 * @description Scans allignmentObject list for old data
 * @param {Array} words - array of allignmentObjects
 */
let cleanWordList = function (words) {
  for (let word of words) {
    if (word.strongs) {
      word.strong = word.strongs;
      delete word.strongs;
    }
  }
};

/**
 * generates the target data for the current chapter
 * and populates the wordAlignmentData reducer.
 */
export function populateEmptyChapterAlignmentData() {
  return ((dispatch, getState) => {
    const {
      wordAlignmentReducer: {
        alignmentData
      },
      resourcesReducer: {
        bibles: { ugnt, targetLanguage }
      },
      contextIdReducer: {
        contextId: {
          reference: { chapter }
        }
      }
    } = getState();
    let emptyAlignmentData = WordAlignmentHelpers.getEmptyAlignmentData(alignmentData, ugnt, targetLanguage, chapter);
    dispatch(updateAlignmentData(emptyAlignmentData));
  });
}
