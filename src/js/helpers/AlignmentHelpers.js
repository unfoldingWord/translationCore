//helpers
import * as VerseObjectHelpers from './VerseObjectHelpers';
import * as ArrayHelpers from './ArrayHelpers';

/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {String} string - The string to base the bottomWords sorting
 * @returns {Array} - sorted array of verseObjects to be used for verseText of targetLanguage
 */
export const merge = (alignments, wordBank, verseString) => {
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
      if (index === -1)
      {
        console.log("Error: verseObject not found in verseText while merging:", verseObject);
      }
      replacements[index] = verseObject;
    });
    // each topWord results in a nested verseObject of tag: k, type: milestone
    const milestones = topWords.map(topWord =>
      VerseObjectHelpers.milestoneVerseObjectFromTopWord(topWord)
    );
    const indices = Object.keys(replacements);
    // group consecutive indexes so that they can be aggregated
    const groupedConsecutiveIndices = ArrayHelpers.groupConsecutiveNumbers(indices);
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
  // deleteIndices that were queued due to consecutive bottomWords in alignments
  verseObjects = ArrayHelpers.deleteIndices(verseObjects, indicesToDelete);
  return verseObjects;
};

/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} verseObjects - array of aligned verseObjects [{milestone children={verseObject}}, ...]
 * @returns {Object} - object of alignments (array of alignments) and wordbank (array of unused words)
 */
export const unmerge = (verseObjects) => {
  let baseMilestones = [], wordBank = [];
  let alignments = [];
  for (let i = 0; i < verseObjects.length; i++) {
    const verseObject = verseObjects[i];
    let alignment = getAlignmentForMilestone(baseMilestones, verseObject);
    if (!alignment) {
      alignment = {topWords: [], bottomWords: []};
      alignments.push(alignment);
      baseMilestones.push({alignment: alignment, milestone: verseObjects[i]});
    }
    verseObjectToAlignment(verseObject, alignment);
  }
  const alignment = [];
  for (let _alignment of alignments) {
    if (_alignment.topWords.length > 0) {
      alignment.push(_alignment);
    } else {
      wordBank = wordBank.concat(_alignment.bottomWords);
    }
  }
  return { alignment, wordBank};
};

const getAlignmentForMilestone = (baseMilestones, newMilestone) => {
  for (let baseMilestone of baseMilestones) {
    if (baseMilestone.alignment && sameAlignment(baseMilestone.milestone, newMilestone)) {
      return baseMilestone.alignment;
    }
  }
  return null;
};

const sameAlignment = (a, b) => {
  const same = (a.type === b.type) && (a.content === b.content) && (a.occurrence === b.occurrence);
  return same;
};

export const verseObjectToAlignment = (verseObject, alignment) => {
  if (verseObject.type === 'milestone' && verseObject.children.length > 0) {
    const wordObject = VerseObjectHelpers.wordObjectFromVerseObject(verseObject);
    const duplicate = alignment.topWords.find(function (obj) {
      return (obj.word === wordObject.word) && (obj.occurrence === wordObject.occurrence) ;
    });
    if (!duplicate) {
      alignment.topWords.push(wordObject);
    }
    verseObject.children.forEach(_verseObject => {
      verseObjectToAlignment(_verseObject, alignment);
    });
  } else if (verseObject.type === 'word' && !verseObject.children) {
    const wordObject = VerseObjectHelpers.wordObjectFromVerseObject(verseObject);
    alignment.bottomWords.push(wordObject);
  }
  console.log(alignment);
};
