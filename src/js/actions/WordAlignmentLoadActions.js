/* eslint-disable no-console */
import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
import consts from '../actions/ActionTypes';
// helpers
import * as WordAlignmentHelpers from '../helpers/WordAlignmentHelpers';
import * as AlertModalActions from '../actions/AlertModalActions';

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
  return (async (dispatch, getState) => {
    try {
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
        },
        resourcesReducer: {
          bibles: { originalLanguage, targetLanguage }
        }
      } = getState();
      let _alignmentData = JSON.parse(JSON.stringify(alignmentData));
      const alignmentDataPath = path.join('.apps', 'translationCore', 'alignmentData');
      const filePath = path.join(alignmentDataPath, bookId, chapter + '.json');
      const loadPath = path.join(projectSaveLocation, filePath);
      if (fs.existsSync(loadPath)) {
        const chapterData = fs.readJsonSync(loadPath);
        const targetLanguageVerse = targetLanguage['targetBible'][chapter][verse];
        const ugntVerse = originalLanguage['ugnt'][chapter][verse];
        const { alignmentsInvalid, showDialog } = WordAlignmentHelpers.checkVerseForChanges(chapterData[verse], ugntVerse, targetLanguageVerse);
        if (showDialog && alignmentsInvalid) await dispatch(showResetAlignmentsDialog());
        if (alignmentsInvalid) chapterData[verse] = WordAlignmentHelpers.resetWordAlignmentsForVerse(ugntVerse, targetLanguageVerse);
        _alignmentData[chapter] = cleanAlignmentData(chapterData); // TODO: can remove this once migration is completed
        dispatch(updateAlignmentData(_alignmentData));
      } else {
        dispatch(populateEmptyChapterAlignmentData());
      }
    } catch (error) {
      console.error(error);
    }
  });
};

const showResetAlignmentsDialog = function () {
  return dispatch => {
    return new Promise((resolve) => {
      dispatch(AlertModalActions.openOptionDialog(
        <div>
          <div>There have been changes to the current verse which interfere with your alignments.</div>
          <div>The alignments for the current verse have been reset.</div>
        </div>
        , () => {
          dispatch(AlertModalActions.closeAlertDialog());
          resolve();
        }, 'Ok'));
    });
  };
};

/**
 * @description Scans alignment data for old data
 * @param {Array} chapterData - array of verse data containing alignments
 * @return {*}
 */
const cleanAlignmentData = function (chapterData) {
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
const cleanWordList = function (words) {
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
    try {
      const {
        wordAlignmentReducer: {
          alignmentData
        },
        resourcesReducer: {
          bibles: { originalLanguage: { ugnt } , targetLanguage: { targetBible } }
        },
        contextIdReducer: {
          contextId: {
            reference: { chapter }
          }
        }
      } = getState();
      let emptyAlignmentData = WordAlignmentHelpers.getEmptyAlignmentData(alignmentData, ugnt, targetBible, chapter);
      dispatch(updateAlignmentData(emptyAlignmentData));
    } catch (error) {
      console.error(error);
    }
  });
}
