/* eslint-disable no-console */
import isEqual from 'lodash/isEqual';
// actions
import * as WordAlignmentLoadActions from './WordAlignmentLoadActions';
// helpers
import * as WordAlignmentHelpers from '../helpers/WordAlignmentHelpers';
import * as stringHelpers from '../helpers/stringHelpers';

/**
 * moves a source word object to a target box object.
 * @param {Number} DropBoxItemIndex - index of the target box or greek box item.
 * @param {object} wordBankItem - object of the source item being drop in the target box.
 */
export const moveWordBankItemToAlignment = (newAlignmentIndex, wordBankItem) => {
  return ((dispatch, getState) => {
    const {
      wordAlignmentReducer: {
        alignmentData
      },
      contextIdReducer: {
        contextId
      },
      resourcesReducer: {
        bibles: {
          targetLanguage
        }
      }
    } = getState();
    const { chapter, verse } = contextId.reference;
    let _alignmentData = JSON.parse(JSON.stringify(alignmentData));
    let {alignments, wordBank} = _alignmentData[chapter][verse];
    const currentVerse = targetLanguage[chapter][verse];
    if (typeof wordBankItem.alignmentIndex === 'number') {
      alignments = removeWordBankItemFromAlignments(wordBankItem, alignments);
    }
    alignments = addWordBankItemToAlignments(wordBankItem, alignments, newAlignmentIndex, currentVerse);
    wordBank = removeWordBankItemFromWordBank(wordBank, wordBankItem);

    _alignmentData[chapter][verse] = {alignments, wordBank};

    dispatch(WordAlignmentLoadActions.updateAlignmentData(_alignmentData));
  });
};
/**
 * @description Moves an item from the drop zone area to the word bank area.
 * @param {Object} wordBankItem
 */
export const moveBackToWordBank = (wordBankItem) => {
  return ((dispatch, getState) => {
    const {
      wordAlignmentReducer: {
        alignmentData
      },
      contextIdReducer: {
        contextId
      },
      resourcesReducer: {
        bibles: {
          targetLanguage
        }
      }
    } = getState();
    const { chapter, verse } = contextId.reference;
    let _alignmentData = JSON.parse(JSON.stringify(alignmentData));
    let {alignments, wordBank} = _alignmentData[chapter][verse];
    let currentVerse = stringHelpers.tokenize(targetLanguage[chapter][verse]).join(' ');

    alignments = removeWordBankItemFromAlignments(wordBankItem, alignments, currentVerse);
    wordBank = addWordBankItemToWordBank(wordBank, wordBankItem, currentVerse);

    _alignmentData[chapter][verse] = {alignments, wordBank};

    dispatch(WordAlignmentLoadActions.updateAlignmentData(_alignmentData));
  });
};

export const addWordBankItemToAlignments = (wordBankItem, alignments, alignmentIndex, currentVerseText) => {
  let alignment = alignments[alignmentIndex];
  alignment.bottomWords.push(wordBankItem);
  alignment.bottomWords = WordAlignmentHelpers.sortWordObjectsByString(alignment.bottomWords, currentVerseText);
  alignments[alignmentIndex] = alignment;
  return alignments;
};

export const removeWordBankItemFromAlignments = (wordBankItem, alignments) => {
  const {alignmentIndex} = wordBankItem;
  let alignment = alignments[alignmentIndex];
  delete wordBankItem.alignmentIndex;
  const bottomWords = alignment.bottomWords.filter((_wordBankItem) => {
    return !isEqual(_wordBankItem, wordBankItem);
  });
  alignment.bottomWords = bottomWords;
  alignments[alignmentIndex] = alignment;
  return alignments;
};
/**
 * @description - removes a source word from the word bank.
 * @param {Object} wordBank
 * @param {Object} wordBankItem
 */
export const removeWordBankItemFromWordBank = (wordBank, wordBankItem) => {
  wordBank = wordBank.filter((metadata) => {
    const equal = (
      metadata.word === wordBankItem.word &&
      metadata.occurrence === wordBankItem.occurrence &&
      metadata.occurrences === wordBankItem.occurrences
    );
    return !equal;
  });
  return wordBank;
};
/**
 * @description Adda a wordBankItem to the wordBank array and then sorts
 *  the array based on the currentVerseString
 * @param {Array} wordBank
 * @param {Object} wordBankItem
 * @param {String} currentVerseString
 * @return {Array} wordBank - array of wordBankItems
 */
export function addWordBankItemToWordBank(wordBank, wordBankItem, currentVerseString) {
  wordBank.push(wordBankItem);
  return WordAlignmentHelpers.sortWordObjectsByString(wordBank, currentVerseString);
}
/**
 * @description - merges two alignments together
 * @param {Number} fromAlignmentIndex
 * @param {Number} toAlignmentIndex
 */
export const moveTopWordItemToAlignment = (topWordItem, fromAlignmentIndex, toAlignmentIndex) => {
  return ((dispatch, getState) => {
    const {
      wordAlignmentReducer: {
        alignmentData
      },
      contextIdReducer: {
        contextId
      },
      resourcesReducer: {
        bibles: { bhp, targetLanguage }
      }
    } = getState();
    const { chapter, verse } = contextId.reference;
    const topWordVerseData = bhp[chapter][verse];
    const bottomWordVerseText = targetLanguage[chapter][verse];
    // copy the alignmentData safely from state
    let _alignmentData = JSON.parse(JSON.stringify(alignmentData));
    let {alignments, wordBank} = _alignmentData[chapter][verse];
    // get the alignments to move from and to
    let fromAlignments = alignments[fromAlignmentIndex];
    let toAlignments = alignments[toAlignmentIndex];
    // if only one topWord in the fromAlignments, merge them
    let verseAlignmentData = { alignments, wordBank }; // if it's the same alignmentIndex then it needs unmerged
    const sameAlignmentIndex = fromAlignmentIndex === toAlignmentIndex;
    const performUnmerge = sameAlignmentIndex && fromAlignments.topWords.length > 1;
    const performMerge = !sameAlignmentIndex && fromAlignments.topWords.length === 1 && toAlignments.topWords.length > 0;
    if (performUnmerge) { // if more than one topWord in fromAlignments or moving to an empty alignment, move topWord, and move bottomWords of fromAlignments to wordBank
      verseAlignmentData = unmergeAlignments(topWordItem, alignments, wordBank, fromAlignmentIndex, topWordVerseData, bottomWordVerseText);
    } else if (performMerge) {
      alignments = mergeAlignments(alignments, fromAlignmentIndex, toAlignmentIndex, topWordVerseData, bottomWordVerseText);
      verseAlignmentData = { alignments, wordBank };
    }
    // update the alignmentData
    _alignmentData[chapter][verse] = verseAlignmentData;
    dispatch(WordAlignmentLoadActions.updateAlignmentData(_alignmentData));
  });
};

export const mergeAlignments = (alignments, fromAlignmentIndex, toAlignmentIndex, topWordVerseData, bottomWordVerseText) => {
  // get the alignments to move from and to
  let fromAlignments = alignments[fromAlignmentIndex];
  let toAlignments = alignments[toAlignmentIndex];
  // merge the alignments together
  let topWords = toAlignments.topWords.concat(fromAlignments.topWords);
  let bottomWords = toAlignments.bottomWords.concat(fromAlignments.bottomWords);
  // sort the topWords and bottomWords
  toAlignments.topWords = WordAlignmentHelpers.sortWordObjectsByString(topWords, topWordVerseData);
  toAlignments.bottomWords = WordAlignmentHelpers.sortWordObjectsByString(bottomWords, bottomWordVerseText);
  // overwrite the alignment in the toAlignmentIndex
  alignments[toAlignmentIndex] = toAlignments;
  // remove the alignments that got moved
  alignments = alignments.filter((_, i) => i !== fromAlignmentIndex);
  return alignments;
};

export const unmergeAlignments = (topWordItem, alignments, wordBank, fromAlignmentIndex, topWordVerseData, bottomWordVerseText) => {
  // get the alignments to move from and to
  let fromAlignments = alignments[fromAlignmentIndex];
  // make to toAlignment the last one and make it empty so we can populate it
  const emptyAlignment = { topWords: [], bottomWords: [] };
  let toAlignments = emptyAlignment;
  alignments.push(toAlignments);
  let toAlignmentIndex = alignments.length - 1;

  // move all bottomWords in the fromAlignments to the wordBank
  fromAlignments.bottomWords.forEach(bottomWord => {
    wordBank = addWordBankItemToWordBank(wordBank, bottomWord, bottomWordVerseText);
  });
  fromAlignments.bottomWords = [];
  // add topWord to new alignment
  toAlignments.topWords.push(topWordItem);
  toAlignments.topWords = WordAlignmentHelpers.sortWordObjectsByString(toAlignments.topWords, topWordVerseData);
  // remove topWord from old alignment
  fromAlignments.topWords = fromAlignments.topWords.filter(topWord => {
    const equal = (
      topWord.word === topWordItem.word &&
      topWord.occurrence === topWordItem.occurrence &&
      topWord.occurrences === topWordItem.occurrences
    );
    return !equal;
  });
  // overwrite the alignments
  alignments[toAlignmentIndex] = toAlignments;
  alignments[fromAlignmentIndex] = fromAlignments;
  // sort verseAlignmentData
  alignments = sortAlignmentsByTopWordVerseData(alignments, topWordVerseData);
  return { alignments, wordBank };
};

export const sortAlignmentsByTopWordVerseData = (alignments, topWordVerseData) => {
  // sort just the first topWord of each alignment
  const topWords = alignments.map(alignment => alignment.topWords[0]);
  const sortedTopWords = WordAlignmentHelpers.sortWordObjectsByString(topWords, topWordVerseData);
  alignments = sortedTopWords.map((topWordItem) => {
    const index = topWords.indexOf(topWordItem);
    return alignments[index];
  });
  return alignments;
};
