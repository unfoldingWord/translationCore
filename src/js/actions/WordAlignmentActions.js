/* eslint-disable no-console */
import consts from '../actions/ActionTypes';

function combineGreekVerse(verseArray) {
  let combinedVerse = ''

  verseArray.forEach(wordData => {
    combinedVerse += ' ' + wordData.word
  }, this);

  return combinedVerse;
}
function getOccurrenceInGreekArray(arrayOfStrings, currentWordIndex, subString) {
  console.log(currentWordIndex)
  let occurrenceCount = 1;
  arrayOfStrings.forEach((metadata, index) => {
    currentWordIndex === 0 ? console.log(metadata.word, index, subString, currentWordIndex) : null;
    // metadata.word === subString ? occurrenceCount++ : '';
  }, this);
  return '';
}

/**
 * @description Function that count occurrences of a substring in a string
 * @param {String} string - The string to search in
 * @param {String} subString - The sub string to search for
 * @returns {Integer} - the count of the occurrences
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 * modified to fit our use cases, return zero for '' substring, and no use case for overlapping.
 */
export const occurrencesInString = (string, subString) => {
  if (subString.length <= 0) return 0;
  var occurrences = 0, position = 0, step = subString.length;
  while (position < string.length) {
    position = string.indexOf(subString, position);
    if (position === -1) break;
    ++occurrences;
    position += step;
  }
  return occurrences;
 }
/**
 * generates the alignment data for the current chapter
 * and populates the wordAlignmentData reducer.
 * @param {object} targetChapterData - current chapter of the target alintment data.
 */
export function AddTargetAlignmentDataForCurrentChapter(targetChapterData) {
  return ((dispatch, getState) => {
    const { contextId } = getState().contextIdReducer;
    const chapter = contextId.reference.chapter;
    const targetChapter = targetChapterData[chapter];
    let payload = {};

    Object.keys(targetChapter).forEach((verseNumber) => {
      let combinedVerse = combineGreekVerse(targetChapter[verseNumber]);
      let newVerseArray = targetChapter[verseNumber].map((wordData, index) => {
        let occurrences = occurrencesInString(combinedVerse, wordData.word);
        getOccurrenceInGreekArray(targetChapter[verseNumber], index, wordData.word)
        let occurrence = verseNumber === 1 ? getOccurrenceInGreekArray(targetChapter[verseNumber], index, wordData.word) : '';
        return {
          word: wordData.word,
          strong: wordData.strong,
          occurrence,
          occurrences
        }
      })
      payload[verseNumber] = newVerseArray;
    })
    // add code to created payload for current verse / targetChapter
    dispatch({
      type: consts.ADD_ALIGNMENT_DATA_FOR_CURRENT_CHAPTER,
      payload: {}
    });
  });
}
