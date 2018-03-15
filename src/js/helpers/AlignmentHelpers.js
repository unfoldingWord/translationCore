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
  //check each word in the verse string is also in the word bank or alignments
  const vereseObjectsNotInAlignmentData = verseStringWordsContainedInAlignments(alignments, wordBank, verseObjects);
  if (vereseObjectsNotInAlignmentData.length > 0) {
    debugger;
    const verseWordsJoined = vereseObjectsNotInAlignmentData.map(({ text }) => text).join(', ');
    throw Error(`The words "${verseWordsJoined}" from the target language verse are not in the alignment data.`);
  }
  // each wordBank object should result in one verseObject
  wordBank.forEach(bottomWord => {
    const verseObject = VerseObjectHelpers.wordVerseObjectFromBottomWord(bottomWord);
    const index = VerseObjectHelpers.indexOfVerseObject(unalignedOrdered, verseObject);
    if (index > -1) verseObjects[index] = verseObject;
    else {
      debugger;
      throw Error(`Word: ${bottomWord.word} missing from word bank.`);
    }
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
        throw Error ("VerseObject not found in verseText while merging:" + JSON.stringify(verseObject));
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

export function verseStringWordsContainedInAlignments(alignments, wordBank, verseObjects) {
  return verseObjects.filter((verseObject) => {
    const checkWordIfWordMatches = function(verseObject) {
      return function({ word, occurrence, occurrences }) {
        if (verseObject.type !== 'word') return true;
        const verseObjectWord = verseObject.text;
        const verseObjectOccurrence = verseObject.occurrence;
        const verseObjectOccurrences = verseObject.occurrences;
        return word === verseObjectWord &&
          occurrence === verseObjectOccurrence &&
          occurrences === verseObjectOccurrences;
      };
    };
    const wordCheckerFunction = checkWordIfWordMatches(verseObject);
    const containedInWordBank = !!wordBank.find(wordCheckerFunction);
    const containedInAlignments = !!alignments.find(({ bottomWords }) => {
      return !!bottomWords.find(wordCheckerFunction);
    });
    if (!containedInWordBank && !containedInAlignments) debugger;
    return !containedInWordBank && !containedInAlignments;
  });
}

/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} verseObjects - array of aligned verseObjects [{milestone children={verseObject}}, ...]
 * @param {String} alignedVerseString - optional string to use for ordering alignments
 * @returns {Object} - object of alignments (array of alignments) and wordbank (array of unused words)
 */
export const unmerge = (verseObjects, alignedVerseString) => {
  let baseMilestones = [], wordBank = [];
  let alignments = [];
  for (let verseObject of verseObjects) {
    let alignment = getAlignmentForMilestone(baseMilestones, verseObject);
    if (!alignment) {
      alignment = {topWords: [], bottomWords: []};
      alignments.push(alignment);
      baseMilestones.push({alignment: alignment, milestone: verseObject});
    }
    addVerseObjectToAlignment(verseObject, alignment);
  }
  const alignmentUnOrdered = [];
  for (let _alignment of alignments) {
    if (_alignment.topWords.length > 0) {
      alignmentUnOrdered.push(_alignment);
    } else {
      wordBank = wordBank.concat(_alignment.bottomWords);
    }
  }
  let alignment = orderAlignmentsByString(alignedVerseString, alignmentUnOrdered);
  return { alignment, wordBank};
};

/**
 * @description uses the alignedVerseString to order alignments
 * @param {String} alignedVerseString - optional alignment string
 * @param {Array} alignmentUnOrdered - alignments to order
 * @return {Array} ordered alignments if alignment string given, else unordered alignments
 */
export const orderAlignmentsByString = function (alignedVerseString, alignmentUnOrdered) {
  if (alignedVerseString) {
    let alignment = [];
    const unalignedOrdered = VerseObjectHelpers.verseObjectsFromString(alignedVerseString);
    // order alignments
    for (let i = 0; i < unalignedOrdered.length; i++) {
      const nextWord = unalignedOrdered[i];
      let index = indexOfFirstMilestone(alignmentUnOrdered, nextWord);
      if ((index < 0) && (nextWord.type === 'word') && (i < unalignedOrdered.length - 1)) {
        const wordAfter = unalignedOrdered[i + 1];
        if (wordAfter.type === 'text') { // maybe this was punctuation split from word
          nextWord.text += wordAfter.text; // add possible punctuation
          index = indexOfFirstMilestone(alignmentUnOrdered, nextWord); // try again
        }
      }
      if (index >= 0) {
        alignment.push(alignmentUnOrdered[index]);
        alignmentUnOrdered.splice(index, 1); // remove item
      }
    }
    if (alignmentUnOrdered.length > 0) {
      alignment = alignment.concat(alignmentUnOrdered);
    }
    return alignment;
  }
  return alignmentUnOrdered;
};

/**
 * compare occurrences of a and b, and handle conversion to int if necessary
 * @param a
 * @param b
 * @return {boolean}
 */
const compareOccurrences = function (a, b) {
  let sameOccurrence = (a.occurrence === b.occurrence);
  if (!sameOccurrence && a.occurrence && b.occurrence) {
    if (typeof a.occurrence !== typeof b.occurrence) { // one may be string and the other an int
      const occurrence1 = (typeof a.occurrence === 'string') ? parseInt(a.occurrence) : a.occurrence;
      const occurrence2 = (typeof b.occurrence === 'string') ? parseInt(b.occurrence) : b.occurrence;
      sameOccurrence = (occurrence1 === occurrence2) && (occurrence1 !== 0);
    }
  }
  return sameOccurrence;
};
/**
 * @description Returns index of the verseObject in the alignments first milestone (ignores occurrences since that can be off)
 * @param {Array} alignments - array of the alignments to search in
 * @param {Object} verseObject - verseObject to search for
 * @returns {Int} - the index of the verseObject
 */
export const indexOfFirstMilestone = (alignments, verseObject) => {
  let index = -1;
  if (verseObject.type === 'word') {
    index = alignments.findIndex(alignment => {
      if (alignment.topWords.length > 0) {
        const _verseObject = alignment.topWords[0];
        if (_verseObject.word === verseObject.text) {
          return compareOccurrences(_verseObject, verseObject);
        }
      }
      return false;
    });
  }
  return index;
};

/**
 * @description find the alignment to use for this milestone.  If milestone has already been given an alignment, then
 *                use that one.  Otherwise return null.  This is needed because milestones are not always
 *                contiguous.
 * @param {Array} baseMilestones - already found base milestones.
 * @param {Object} newMilestone
 * @return {Object} previous Alignment if found - else null.
 */
const getAlignmentForMilestone = (baseMilestones, newMilestone) => {
  for (let baseMilestone of baseMilestones) {
    if (baseMilestone.alignment && sameMilestone(baseMilestone.milestone, newMilestone)) {
      return baseMilestone.alignment;
    }
  }
  return null;
};

/**
 * @description test to see if this is the same milestone (needed when milestones are not contiguous)
 * @param {Object} a
 * @param {Object} b
 * @return {boolean} true if same milestone
 */
const sameMilestone = (a, b) => {
  const same = (a.type === b.type) && (a.content === b.content) && (a.occurrence === b.occurrence);
  return same;
};

/**
 * @description adds verse object to alignment
 * @param {Object} verseObject
 * @param {Object} alignment
 */
export const addVerseObjectToAlignment = (verseObject, alignment) => {
  if (verseObject.type === 'milestone' && verseObject.children.length > 0) {
    const wordObject = VerseObjectHelpers.alignmentObjectFromVerseObject(verseObject);
    const duplicate = alignment.topWords.find(function (obj) {
      return (obj.word === wordObject.word) && (obj.occurrence === wordObject.occurrence) ;
    });
    if (!duplicate) {
      alignment.topWords.push(wordObject);
    }
    verseObject.children.forEach(_verseObject => {
      addVerseObjectToAlignment(_verseObject, alignment);
    });
  } else if (verseObject.type === 'word' && !verseObject.children) {
    const wordObject = VerseObjectHelpers.alignmentObjectFromVerseObject(verseObject);
    alignment.bottomWords.push(wordObject);
  }
};
