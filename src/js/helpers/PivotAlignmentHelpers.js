//helpers
import * as VerseObjectHelpers from './VerseObjectHelpers';

/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {String} string - The string to base the bottomWords sorting
 * @returns {Array} - sorted array of verseObjects to be used for verseText of targetLanguage
 */
export const verseObjectsFromAlignmentsAndWordBank = (alignments, wordBank, verseString) => {
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
    let replacements = {};
    bottomWords.forEach(bottomWord => {
      const verseObject = VerseObjectHelpers.wordVerseObjectFromBottomWord(bottomWord);
      const index = VerseObjectHelpers.indexOfVerseObject(unalignedOrdered, verseObject);
      if (index === -1) console.log("Error: verseObject not found in verseText while merging:", verseObject);
      replacements[index] = verseObject;
    });
    // each topWord results in a nested verseObject of tag: k, type: milestone
    const milestones = topWords.map(topWord =>
      VerseObjectHelpers.milestoneVerseObjectFromTopWord(topWord)
    );
    const indices = Object.keys(replacements);
    // group consecutive indexes so that they can be aggregated
    const groupedConsecutiveIndices = groupConsecutiveNumbers(indices);
    // loop through groupedConsecutiveIndices to reduce and place where needed.
    groupedConsecutiveIndices.forEach(consecutiveIndices => {
      // map the consecutiveIndices to replacement verseObjects
      const replacementVerseObjects = consecutiveIndices.map(index => replacements[index]);
      // remove and use the first index in group to place the aligned verseObject milestone later
      const indexToReplace = consecutiveIndices.shift();
      // the rest of the consecutiveIndices need to be queued to be deleted later after shift
      indicesToDelete = indicesToDelete.concat(consecutiveIndices);
      // place the replacementVerseObjects in the last milestone as children
      milestones[milestones.length-1].children = replacementVerseObjects;
      // nest the milestones so that the first is the parent and each subsequent is nested
      const milestone = VerseObjectHelpers.nestMilestones(milestones);
      // replace the original verseObject from the verse text with the aligned milestone verseObject
      verseObjects[indexToReplace] = milestone;
    });
  });
  // console.log(verseObjects)
  // deleteIndices
  verseObjects = deleteIndices(verseObjects, indicesToDelete);
  return verseObjects;
};

export const groupConsecutiveNumbers = (numbers) => (
  numbers.reduce(function(accumulator, currentValue, currentIndex, originalArray) {
    if (currentValue) { // ignore undefined entries
      // if this is the start of a new run then create a new subarray
      if (originalArray[currentIndex - 1] === undefined) accumulator.push([]);
      // append current value to subarray
      accumulator[accumulator.length - 1].push(currentValue);
    }
    // return state for next iteration
    return accumulator;
  }, [])
);

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
// export const alignmentsFromTargetLanguageVerse = (verseObjects, topWordVerseData) => {
//   return [];
// };
