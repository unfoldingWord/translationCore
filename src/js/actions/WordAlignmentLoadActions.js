/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import consts from '../actions/ActionTypes';
// helpers
import * as WordAlignmentHelpers from '../helpers/WordAlignmentHelpers';
import * as stringHelpers from '../helpers/stringHelpers';

/**
 * populates the wordAlignmentData reducer.
 * @param {Object} alignmentData - current chapter scope of alignmentData
 */
export const updateAlignmentData = (alignmentData) => {
  return((dispatch) => {
    dispatch({
      type: consts.UPDATE_ALIGNMENT_DATA,
      alignmentData: alignmentData
    });
  });
};
/**
 * @description this function saves the current alignmentData into the file system.
 * @param {object} state - store state object.
 */
export const loadAlignmentData = () => {
  return((dispatch, getState) => {
    const {
      wordAlignmentReducer: {
        alignmentData
      },
      projectDetailsReducer: {
        projectSaveLocation
      },
      contextIdReducer: {
        contextId: {
          reference: { bookId, chapter }
        }
      }
    } = getState();
    let _alignmentData = JSON.parse(JSON.stringify(alignmentData));

    const alignmentDataPath = path.join('.apps', 'translationCore', 'alignmentData');
    const filePath = path.join(alignmentDataPath, bookId, chapter + '.json');
    const loadPath = path.join(projectSaveLocation, filePath);
    if (fs.existsSync(loadPath)) {
      const chapterData = fs.readJsonSync(loadPath);
      _alignmentData[chapter] = chapterData;
      dispatch(updateAlignmentData(_alignmentData));
    } else {
      dispatch(populateEmptyChapterAlignmentData());
    }
  });
};
/**
 * generates the target data for the current chapter
 * and populates the wordAlignmentData reducer.
 * @param {Object} targetChapterData - current chapter of the target alintment data.
 */
export function populateEmptyChapterAlignmentData() {
  return ((dispatch, getState) => {
    const {
      wordAlignmentReducer: {
        alignmentData
      },
      resourcesReducer: {
        bibles: { bhp, targetLanguage }
      },
      contextIdReducer: {
        contextId: {
          reference: { chapter }
        }
      }
    } = getState();
    let _alignmentData = JSON.parse(JSON.stringify(alignmentData));

    const bhpChapter = bhp[chapter];
    const targetLanguageChapter = targetLanguage[chapter];
    // loop through the chapters and populate the alignmentData
    Object.keys(bhpChapter).forEach((verseNumber) => {
      // create the nested objects to be assigned
      if (!_alignmentData[chapter]) _alignmentData[chapter] = {};
      if (!_alignmentData[chapter][verseNumber]) _alignmentData[chapter][verseNumber] = {};
      // generate the blank alignments
      const alignments = generateBlankAlignments(bhpChapter[verseNumber]);
      // generate the wordbank
      const wordBank = generateWordBank(targetLanguageChapter[verseNumber]);
      _alignmentData[chapter][verseNumber].alignments = alignments;
      _alignmentData[chapter][verseNumber].wordBank = wordBank;
    });
    dispatch(updateAlignmentData(_alignmentData));
  });
}
/**
 * @description - generates the word alignment tool alignmentData from the bhp verseData
 * @param {Array} verseData - array of wordObjects
 */
export const generateBlankAlignments = (verseData) => {
  const alignments = verseData.map((wordData, index) => {
    let combinedVerse = WordAlignmentHelpers.combineGreekVerse(verseData);
    let occurrences = WordAlignmentHelpers.occurrencesInString(combinedVerse, wordData.word);
    let occurrence = WordAlignmentHelpers.getOccurrenceInString(combinedVerse, index, wordData.word);
    const alignment = {
      topWords: [
        {
          word: wordData.word,
          strongs: wordData.strongs,
          lemma: wordData.lemma,
          morph: wordData.morph,
          occurrence,
          occurrences
        }
      ],
      bottomWords: []
    };
    return alignment;
  });
  return alignments;
};
/**
 * @description - generates the word alignment tool word bank from targetLanguage verse
 * @param {String} verseText - string of the verseText in the targetLanguage
 */
export const generateWordBank = (verseText) => {
  const verseWords = stringHelpers.tokenize(verseText);
  // TODO: remove once occurrencesInString uses tokenizer, can't do that until bug is addressed with Greek
  const _verseText = verseWords.join(' ');
  const wordBank = verseWords.map((word, index) => {
    let occurrences = WordAlignmentHelpers.occurrencesInString(_verseText, word);
    let occurrence = WordAlignmentHelpers.getOccurrenceInString(_verseText, index, word);
    return {
      word,
      occurrence,
      occurrences
    };
  });
  return wordBank;
};
