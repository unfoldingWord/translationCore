/* eslint-disable no-console */
import consts from '../actions/ActionTypes';
import isEqual from 'lodash/isEqual';
// helpers
import * as WordAlignmentHelpers from '../helpers/WordAlignmentHelpers';
import * as stringHelpers from '../helpers/stringHelpers';

/**
 * generates the target data for the current chapter
 * and populates the wordAlignmentData reducer.
 * @param {Object} targetChapterData - current chapter of the target alintment data.
 */
export function generateTopWordsForAlignments(targetChapterData) {
  return ((dispatch, getState) => {
    const {
      wordAlignmentReducer: {
        alignmentData
      },
      contextIdReducer: {
        contextId
      }
    } = getState();
    const { chapter } = contextId.reference;
    let _alignmentData = JSON.parse(JSON.stringify(alignmentData));

    const targetChapter = targetChapterData[chapter];
    Object.keys(targetChapter).forEach((verseNumber) => {
      let combinedVerse = WordAlignmentHelpers.combineGreekVerse(targetChapter[verseNumber]);
      let alignments = targetChapter[verseNumber].map((wordData, index) => {
        let occurrences = WordAlignmentHelpers.occurrencesInString(combinedVerse, wordData.word);
        let occurrence = WordAlignmentHelpers.getOccurrenceInString(combinedVerse, index, wordData.word);
        return {
          bottomWords: [],
          topWords: [
            {
              word: wordData.word,
              strongs: wordData.strong,
              occurrence,
              occurrences
            }
          ]
        };
      });
      if (!_alignmentData[chapter]) _alignmentData[chapter] = {};
      if (!_alignmentData[chapter][verseNumber]) _alignmentData[chapter][verseNumber] = {};
      _alignmentData[chapter][verseNumber].alignments = alignments;
    });
    dispatch({
      type: consts.UPDATE_ALIGNMENT_DATA,
      alignmentData: _alignmentData
    });
  });
}
/**
 * gets the word alignment tool word bank from ulb object.
 * @param {Object} targetChapterData
 */
export function generateWordBankData(targetChapterData) {
  return ((dispatch, getState) => {
    const {
      wordAlignmentReducer: {
        alignmentData
      },
      contextIdReducer: {
        contextId
      }
    } = getState();
    const { chapter } = contextId.reference;
    let _alignmentData = JSON.parse(JSON.stringify(alignmentData));

    const targetChapter = targetChapterData[chapter];
    Object.keys(targetChapter).forEach((verseNumber) => {
      const verseWords = stringHelpers.tokenize(targetChapter[verseNumber]);
      const wordBank = verseWords.map((word, index) => {
        let occurrences = WordAlignmentHelpers.occurrencesInString(targetChapter[verseNumber], word);
        let occurrence = WordAlignmentHelpers.getOccurrenceInString(targetChapter[verseNumber], index, word);
        return {
          word,
          occurrence,
          occurrences
        };
      });
      if (!_alignmentData[chapter]) _alignmentData[chapter] = {};
      if (!_alignmentData[chapter][verseNumber]) _alignmentData[chapter][verseNumber] = {};
      _alignmentData[chapter][verseNumber].wordBank = wordBank;
    });
    dispatch({
      type: consts.UPDATE_ALIGNMENT_DATA,
      alignmentData: _alignmentData
    });
  });
}

/**
 * moves a source word object to a target box object.
 * @param {Number} DropBoxItemIndex - index of the target box or greek box item.
 * @param {object} wordBankItem - object of the source item being drop in the target box.
 */
export function moveWordBankItemToAlignment(newAlignmentIndex, wordBankItem) {
  return ((dispatch, getState) => {
    const {
      wordAlignmentReducer: {
        alignmentData
      },
      contextIdReducer: {
        contextId
      }
    } = getState();
    const { chapter, verse } = contextId.reference;
    let _alignmentData = JSON.parse(JSON.stringify(alignmentData));
    let {alignments, wordBank} = _alignmentData[chapter][verse];

    if (typeof wordBankItem.alignmentIndex === 'number') {
      alignments = removeWordBankItemFromAlignments(wordBankItem, alignments);
    }
    alignments = addWordBankItemToAlignments(wordBankItem, alignments, newAlignmentIndex);
    wordBank = removeWordBankItemFromWordBank(wordBank, wordBankItem);

    _alignmentData[chapter][verse] = {alignments, wordBank};

    dispatch({
      type: consts.UPDATE_ALIGNMENT_DATA,
      alignmentData: _alignmentData
    });
  });
}

export function addWordBankItemToAlignments(wordBankItem, alignments, alignmentIndex) {
  let alignment = alignments[alignmentIndex];
  alignment.bottomWords.push(wordBankItem);
  alignments[alignmentIndex] = alignment;
  return alignments;
}

export function removeWordBankItemFromAlignments(wordBankItem, alignments) {
  const {alignmentIndex} = wordBankItem;
  let alignment = alignments[alignmentIndex];
  delete wordBankItem.alignmentIndex;
  const bottomWords = alignment.bottomWords.filter((_wordBankItem) => {
    return !isEqual(_wordBankItem, wordBankItem);
  });
  alignment.bottomWords = bottomWords;
  alignments[alignmentIndex] = alignment;
  return alignments;
}

/**
 * removes a source word from the word bank.
 * @param {Object} wordBank
 * @param {Object} wordBankItem
 */
export function removeWordBankItemFromWordBank(wordBank, wordBankItem) {
  wordBank = wordBank.filter((metadata) => {
    return !isEqual(metadata, wordBankItem);
  });
  return wordBank;
}
