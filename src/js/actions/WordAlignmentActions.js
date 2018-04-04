/* eslint-disable no-console */
import stringHelpers from 'string-punctuation-tokenizer';
import consts from './ActionTypes';
// actions
import * as WordAlignmentLoadActions from './WordAlignmentLoadActions';
import * as AlertModalActions from './AlertModalActions';
// helpers
import * as WordAlignmentHelpers from '../helpers/WordAlignmentHelpers';
import * as manifestHelpers from '../helpers/manifestHelpers';

/**
 * moves a source word object to a target box object.
 * @param {Number} newAlignmentIndex - index of the target box or greek box item.
 * @param {object} wordBankItem - alignmentObject of the source item being drop in the target box.
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
    let { alignments, wordBank } = _alignmentData[chapter][verse];
    const currentVerse = targetLanguage['targetBible'][chapter][verse];
    if (typeof wordBankItem.alignmentIndex === 'number') {
      alignments = removeWordBankItemFromAlignments(wordBankItem, alignments);
    }
    alignments = addWordBankItemToAlignments(wordBankItem, alignments, newAlignmentIndex, currentVerse);
    wordBank = removeWordBankItemFromWordBank(wordBank, wordBankItem);

    _alignmentData[chapter][verse] = { alignments, wordBank };

    dispatch(WordAlignmentLoadActions.updateAlignmentData(_alignmentData));
  });
};
/**
 * @description Moves an item from the drop zone area to the word bank area.
 * @param {Object} wordBankItem - alignmentObject to be moved
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
    let { alignments, wordBank } = _alignmentData[chapter][verse];
    let currentVerse = stringHelpers.tokenize(targetLanguage['targetBible'][chapter][verse]).join(' ');

    alignments = removeWordBankItemFromAlignments(wordBankItem, alignments, currentVerse);
    wordBank = addWordBankItemToWordBank(wordBank, wordBankItem, currentVerse);

    _alignmentData[chapter][verse] = { alignments, wordBank };

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
  const { alignmentIndex } = wordBankItem;
  let alignment = alignments[alignmentIndex];
  delete wordBankItem.alignmentIndex;
  if (alignment) {
    const bottomWords = alignment.bottomWords.filter((_wordBankItem) => {
      const equal = _wordBankItem.occurrence === wordBankItem.occurrence
        && _wordBankItem.occurrences === wordBankItem.occurrences
        && _wordBankItem.word === wordBankItem.word;
      return !equal;
    });
    alignment.bottomWords = bottomWords;
    alignments[alignmentIndex] = alignment;
  }
  return alignments;
};
/**
 * @description - removes a source word from the word bank.
 * @param {Array} wordBank
 * @param {Object} wordBankItem - alignmentObject to be moved
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
 * @param {Object} wordBankItem - alignmentObject to be moved
 * @param {String} currentVerseString - string to use to order wordBank
 * @return {Array} wordBank - array of wordBankItems (alignmentObjects)
 */
export function addWordBankItemToWordBank(wordBank, wordBankItem, currentVerseString) {
  wordBank.push(wordBankItem);
  return WordAlignmentHelpers.sortWordObjectsByString(wordBank, currentVerseString);
}
/**
 * @description - merges two alignments together
 * @param {Object} topWordItem - alignmentObject to move
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
        bibles: { originalLanguage, targetLanguage }
      }
    } = getState();
    const { chapter, verse } = contextId.reference;
    const topWordVerseData = originalLanguage['ugnt'][chapter][verse];
    const bottomWordVerseText = targetLanguage['targetBible'][chapter][verse];
    // copy the alignmentData safely from state
    let _alignmentData = JSON.parse(JSON.stringify(alignmentData));
    let { alignments, wordBank } = _alignmentData[chapter][verse];
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

/**
 * Wrapper for exporting project alignment data to usfm.
 * @param {string} projectSaveLocation - Full path to the users project to be exported
 * @param {boolean} output - Flag to set whether export will write to fs
 * @param {boolean} resetAlignments - Flag to set whether export will reset alignments
 * automatically or ask user
 */
export const getUsfm3ExportFile = (projectSaveLocation, output = false, resetAlignments = false) => {
  return dispatch => {
    return new Promise(async (resolve, reject) => {
      //Get path for alignment conversion
      const { wordAlignmentDataPath, projectTargetLanguagePath, chapters } = WordAlignmentHelpers.getAlignmentPathsFromProject(projectSaveLocation);
      const manifest = manifestHelpers.getProjectManifest(projectSaveLocation);
      /** Convert alignments from the filesystam under then project alignments folder */
      const usfm = await WordAlignmentHelpers.convertAlignmentDataToUSFM(
        wordAlignmentDataPath, projectTargetLanguagePath, chapters, projectSaveLocation, manifest.project.id
      ).catch(async (e) => {
        if (e && e.error && e.error.type === 'InvalidatedAlignments') {
          //error in converting alignment need to prompt user to fix
          const { chapter, verse } = e;
          const res = resetAlignments ? 'Export' : await dispatch(displayAlignmentErrorsPrompt(projectSaveLocation, chapter, verse));
          if (res === 'Export') {
            //The user chose to continue and reset the alignments
            await WordAlignmentHelpers.resetAlignmentsForVerse(projectSaveLocation, chapter, verse);
            await dispatch(getUsfm3ExportFile(projectSaveLocation, output, true));
            resolve();
          } else {
            reject();
          }
        }
      });
      //Write converted usfm to specified location
      if (output) WordAlignmentHelpers.writeToFS(output, usfm);
      resolve(usfm);
    });
  };
};

export function displayAlignmentErrorsPrompt() {
  return ((dispatch) => {
    return new Promise((resolve) => {
      const alignmentErrorsPrompt = 'Some alignments have been invalidated! To fix the invalidated alignment,\
open the project in the Word Alignment Tool. If you proceed with the export, the alignment for these verses will be reset.';
      dispatch(AlertModalActions.openOptionDialog(alignmentErrorsPrompt, (res) => {
        dispatch(AlertModalActions.closeAlertDialog());
        resolve(res);
      }, 'Export', 'Cancel'));
    });
  });
}

/**
 *
 * @param {string} filePath - File path to the specified usfm export save location
 * @param {string} projectName - Name of the project being exported (This can be altered by the user
 * when saving)
 */
export function storeWordAlignmentSaveLocation(filePath, projectName) {
  return {
    type: consts.SET_USFM_SAVE_LOCATION,
    usfmSaveLocation: filePath.split(projectName)[0]
  };
}
