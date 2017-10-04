/* eslint-disable no-console */
import isEqual from 'lodash/isEqual';
// actions
import * as VerseEditActions from './VerseEditActions';
import * as WordAlignmentLoadActions from './WordAlignmentLoadActions';
// helpers
import * as WordAlignmentHelpers from '../helpers/WordAlignmentHelpers';

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

    dispatch(WordAlignmentLoadActions.updateAlignmentData(_alignmentData));
  });
}
/**
 * @description Moves an item from the drop zone area to the word bank area.
 * @param {Object} wordBankItem 
 */
export function moveBackToWordBank(wordBankItem) {
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
    let currentVerse = targetLanguage[chapter][verse];

    alignments = removeWordBankItemFromAlignments(wordBankItem, alignments);
    wordBank = addWordBankItemToWordBank(wordBank, wordBankItem, currentVerse);

    _alignmentData[chapter][verse] = {alignments, wordBank};

    dispatch(WordAlignmentLoadActions.updateAlignmentData(_alignmentData));
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
 * @description - removes a source word from the word bank.
 * @param {Object} wordBank
 * @param {Object} wordBankItem
 */
export function removeWordBankItemFromWordBank(wordBank, wordBankItem) {
  wordBank = wordBank.filter((metadata) => {
    return !isEqual(metadata, wordBankItem);
  });
  return wordBank;
}
/**
 * @description Adda a wordBankItem to the wordBank array and then sorts 
 *  the array based on the currentVerseString
 * @param {Array} wordBank 
 * @param {Object} wordBankItem 
 * @param {String} currentVerseString 
 */
export function addWordBankItemToWordBank(wordBank, wordBankItem, currentVerseString) {
  wordBank.push(wordBankItem);
  return WordAlignmentHelpers.sortWordObjectsByString(wordBank, currentVerseString);
}
/**
 * @description - updates the targetLanguageVerse from wordAlignmentReducer
 */
export const updateTargetLanguageVerseFromAlignmentData = () => {
  return((dispatch, getState) => {
    const {contextIdReducer, resourcesReducer, wordAlignmentReducer} = getState();
    const {chapter, verse} = contextIdReducer.contextId.reference;
    const verseText = resourcesReducer.bibles.targetLanguage[chapter][verse];
    const {alignments, wordBank} = wordAlignmentReducer.alignmentData[chapter][verse];

    let verseWordObjects = WordAlignmentHelpers.targetLanguageVerseFromAlignments(alignments, wordBank, verseText);
    dispatch(
      VerseEditActions.editTargetVerseInBiblesReducer(verseWordObjects)
    );
  });
};
