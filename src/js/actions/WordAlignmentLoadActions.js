/* eslint-disable no-console */
import {getTranslate} from '../selectors';
import fs from 'fs-extra';
import path from 'path-extra';
import consts from '../actions/ActionTypes';
import wordaligner from 'word-aligner';
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
 * Reads the current alignmentData from the file system
 * and loads it into redux.
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
        if (alignmentsInvalid) chapterData[verse] = wordaligner.getBlankAlignmentDataForVerse(ugntVerse, targetLanguageVerse);
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

/**
 * Clears the alignments in a single verse
 * @param bookId
 * @param chapter
 * @param verse
 * @return {Function}
 */
export const resetVerseAlignments = (bookId, chapter, verse) => {
  return async (dispatch, getState) => {
    const {
      wordAlignmentReducer: {
        alignmentData
      },
      projectDetailsReducer: {
        projectSaveLocation
      },
      resourcesReducer: {
        bibles: { originalLanguage, targetLanguage }
      }
    } = getState();
    try {
      let _alignmentData = JSON.parse(JSON.stringify(alignmentData));
      const alignmentDataPath = path.join('.apps', 'translationCore',
        'alignmentData');
      const filePath = path.join(alignmentDataPath, bookId, chapter + '.json');
      const loadPath = path.join(projectSaveLocation, filePath);
      if (fs.existsSync(loadPath)) {
        const chapterData = fs.readJsonSync(loadPath);
        const targetLanguageVerse = targetLanguage['targetBible'][chapter][verse];
        const ugntVerse = originalLanguage['ugnt'][chapter][verse];
        chapterData[verse] = wordaligner.getBlankAlignmentDataForVerse(
          ugntVerse, targetLanguageVerse);
        _alignmentData[chapter] = cleanAlignmentData(chapterData); // TODO: can remove this once migration is completed
        dispatch(updateAlignmentData(_alignmentData));
      } else {
        dispatch(populateEmptyChapterAlignmentData());
      }
    } catch (error) {
      console.error(error);
    }
  };
};

export const showResetAlignmentsDialog = function () {
  return (dispatch, getState) => {
    return new Promise((resolve) => {
      const translate = getTranslate(getState());
      dispatch(AlertModalActions.openOptionDialog(translate('tools.alignments_reset'), () => {
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
