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
  let verseObjects; // array to return
  // get the definitive list of verseObjects from the verse, unaligned but in order
  const unalignedOrdered = VerseObjectHelpers.verseObjectsFromString(verseString);
  // assign verseObjects with unaligned objects to be replaced with aligned ones
  verseObjects = JSON.parse(JSON.stringify(unalignedOrdered));
  // each wordBank object should result in one verseObject
  wordBank.forEach(bottomWord => {
    const verseObject = VerseObjectHelpers.wordVerseObjectFromBottomWord(bottomWord);
    const index = VerseObjectHelpers.indexOfVerseObject(unalignedOrdered, verseObject);
    verseObjects[index] = verseObject;
  });
  let indicesToDelete = [];
  // each alignment should result in one verseObject
  alignments.forEach(alignment => {
    const {topWords, bottomWords} = alignment;
    // each bottomWord results in a nested verseObject of tag: w, type: word
    // located inside innermost nested topWord/k verseObject
    let indices = [];
    const wordVerseObjects = bottomWords.map(bottomWord => {
      const verseObject = VerseObjectHelpers.wordVerseObjectFromBottomWord(bottomWord);
      const index = VerseObjectHelpers.indexOfVerseObject(unalignedOrdered, verseObject);
      if (index === -1) console.log("Error in merging alignment, verseObject not found in verseText:", verseObject);
      indices.push(index);
      return verseObject;
    });
    // each topWord results in a nested verseObject of tag: k, type: milestone
    const milestones = topWords.map(topWord =>
      VerseObjectHelpers.milestoneVerseObjectFromTopWord(topWord)
    );
    let replacements = [];
    let consecutiveIndices = true;
    // if indices are consecutive, one milestone, add other indexes to be deleted
    if (consecutiveIndices) {
      const index = indices.shift();
      replacements.push({
        index: index,
        wordVerseObjects
      });
      if (indices.length > 0) {
        indicesToDelete = indicesToDelete.concat(indices);
      }
    // if indices are not consecutive, multiple milestones for each index
    } else {
      // wordVerseObjects.forEach((wordVerseObject, i) => {
      //   replacements.push({
      //     index: indices[i],
      //     wordVerseObjects: [wordVerseObject]
      //   });
      // });
    }
    replacements.forEach(o => {
      // place the wordVerseObjects in the last milestone as children
      milestones[milestones.length-1].children = o.wordVerseObjects;
      // nest the milestones so that the first is the parent and each subsequent is nested
      const milestone = VerseObjectHelpers.nestMilestones(milestones);
      if (milestone) {
        verseObjects[o.index] = milestone;
      }
    });
    // console.log(replacements)
  });
  // console.log(verseObjects)
  // deleteIndices
  verseObjects = deleteIndices(verseObjects, indicesToDelete);
  return verseObjects;
};

export const deleteIndices = (array, indices) => {
  let _array = JSON.parse(JSON.stringify(array));
  indices.sort( (a,b) => b - a );
  indices.forEach(index => {
    _array.splice(index, 1);
  });
  return _array;
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
