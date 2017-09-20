/* eslint-disable no-console */
import consts from '../actions/ActionTypes';
import isEqual from 'lodash/isEqual';
// helpers
import * as WordAlignmentHelpers from '../helpers/WordAlignmentHelpers';

/**
 * generates the target data for the current chapter
 * and populates the wordAlignmentData reducer.
 * @param {object} targetChapterData - current chapter of the target alintment data.
 */
export function getTargetData(targetChapterData) {
  return ((dispatch, getState) => {
    const { contextId } = getState().contextIdReducer;
    const chapter = contextId.reference.chapter;
    const targetChapter = targetChapterData[chapter];
    let payload = {};

    Object.keys(targetChapter).forEach((verseNumber) => {
      let combinedVerse = WordAlignmentHelpers.combineGreekVerse(targetChapter[verseNumber]);
      let newVerseArray = targetChapter[verseNumber].map((wordData, index) => {
        let occurrences = WordAlignmentHelpers.occurrencesInString(combinedVerse, wordData.word);
        let occurrence = WordAlignmentHelpers.getOccurrenceInArrayOfStrings(combinedVerse, index, wordData.word);
        return {
          sources: [],
          targets: [
            {
              word: wordData.word,
              strongs: wordData.strong,
              occurrence,
              occurrences
            }
          ]
        }
      })
      payload[verseNumber] = newVerseArray;
    });
    dispatch({
      type: consts.ADD_ALIGNMENT_DATA_FOR_CURRENT_CHAPTER,
      chapter,
      payload
    });
  });
}
/**
 * gets the word alignment tool word bank from ulb object.
 * @param {Object} targetChapterData 
 */
export function getWordBankSourceData(targetChapterData) {
  return ((dispatch, getState) => {
    const { contextId } = getState().contextIdReducer;
    const chapter = contextId.reference.chapter;
    const targetChapter = targetChapterData[chapter];
    let payload = {};

    Object.keys(targetChapter).forEach((verseNumber) => {
      const sourceVerse = targetChapter[verseNumber].split(' ');
      let newVerseArray = sourceVerse.map((word, index) => {
        let occurrences = WordAlignmentHelpers.occurrencesInString(targetChapter[verseNumber], word);
        let occurrence = WordAlignmentHelpers.getOccurrenceInArrayOfStrings(targetChapter[verseNumber], index, word);
        return {
          word,
          occurrence,
          occurrences
        }
      })
      payload[verseNumber] = newVerseArray;
    });
    dispatch({
      type: consts.ADD_SOURCE_DATA_TO_WORD_BANK,
      chapter,
      payload
    });
  });
}

/**
 * moves a source word object to a target box object.
 * @param {Number} targetBoxIndex - index of the target box or greek box item.
 * @param {object} sourceWordItem - object of the source item being drop in the target box.
 */
export function moveSourceWordToTargetBox(targetBoxIndex, sourceWordItem) {
  return ((dispatch, getState) => {
    const {
      wordAlignmentReducer: {
        target,
        wordBank
      },
      contextIdReducer: {
        contextId
      }
    } = getState();
    const { chapter, verse } = contextId.reference;
    const verseWords = target[chapter][verse];
    verseWords[targetBoxIndex].sources.push(sourceWordItem);
    target[chapter][verse] = verseWords;

    removeSourceWordFromWordBank(wordBank, sourceWordItem, contextId, dispatch)
    dispatch({
      type: consts.MOVE_SOURCE_WORD_TO_TARGET_BOX,
      payload: target,
      chapter
    })
  })
}

/**
 * removes a source word from the word bank.
 * @param {Object} wordBank 
 * @param {Object} sourceWordItem 
 * @param {Object} contextId 
 * @param {function} dispatch 
 */
export function removeSourceWordFromWordBank(wordBank, sourceWordItem, contextId, dispatch) {
  const { chapter, verse } = contextId.reference;
  const words = wordBank[chapter][verse];
  let newWordList = words.filter((metadata) => {
    return !isEqual(metadata, sourceWordItem);
  })
  dispatch({
    type: consts.UPDATE_WORD_BANK_LIST,
    newWordList,
    chapter,
    verse
  })
}