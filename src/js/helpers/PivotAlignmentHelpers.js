import isEqual from 'lodash/isEqual';
//helpers
import * as VerseObjectHelpers from './VerseObjectHelpers';

/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {String} string - The string to base the bottomWords sorting
 * @returns {Array} - sorted array of verseObjects to be used for verseText of targetLanguage
 */
export const verseObjectsFromAlignmentsAndWordBank = (alignments, wordBank, verseString, alignedVerseString) => {
  let alignedVerseObjects = []; // the temporary array to populate then sort
  // each wordBank object should result in one verseObject
  wordBank.forEach(bottomWord => {
    const wordBankVerseObject = VerseObjectHelpers.wordVerseObjectFromBottomWord(bottomWord);
    alignedVerseObjects.push(wordBankVerseObject);
  });
  // each alignment should result in one verseObject
  alignments.forEach(alignment => {
    const {topWords, bottomWords} = alignment;
    // each bottomWord results in a nested verseObject of tag: w, type: word
    // located inside innermost nested topWord/k verseObject
    const wordVerseObjects = bottomWords.map(bottomWord =>
      VerseObjectHelpers.wordVerseObjectFromBottomWord(bottomWord)
    );
    // each topWord results in a nested verseObject of tag: k, type: milestone
    const milestones = topWords.map(topWord =>
      VerseObjectHelpers.milestoneVerseObjectFromTopWord(topWord)
    );
    // place the wordVerseObjects in the last milestone as children
    milestones[milestones.length-1].children = wordVerseObjects;
    // nest the milestones so that the first is the parent and each subsequent is nested
    const milestone = VerseObjectHelpers.nestMilestones(milestones);
    if (milestone) {
      alignedVerseObjects.push(milestone);
    }
  });
  // get the definitive list of verseObjects from the verse
  const verseObjects = VerseObjectHelpers.verseObjectsFromString(verseString)
  .map(verseObject => {
    return verseObject;
  });
  return verseObjects;
};


/**
 * @description pivots bottomWords/targetLanguage verseObjectArray into alignments sorted by verseText
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {String} string - The string to base the bottomWords sorting
 * @returns {Array} - sorted array of alignments to be used for wordAlignmentReducer
 */
export const alignmentsFromTargetLanguageVerse = (verseObjects, topWordVerseData) => {
  return [];
};
