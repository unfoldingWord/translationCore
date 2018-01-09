import isEqual from 'lodash/isEqual';
//helpers
import * as WordAlignmentHelpers from './WordAlignmentHelpers';
// import * as StringHelpers from './StringHelpers';

/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {String} string - The string to base the bottomWords sorting
 * @returns {Array} - sorted array of verseObjects to be used for verseText of targetLanguage
 */
export const verseObjectsFromAlignmentsAndWordBank = (alignments, wordBank, verseString, alignedVerseString) => {
  let verseObjects = [];
  // each alignment should result in one verseObject
  wordBank.forEach(bottomWord => {
    const wordBankVerseObject = wordVerseObjectFromBottomWord(bottomWord);
    verseObjects.push(wordBankVerseObject);
  });
  alignments.forEach(alignment => {
    const {topWords, bottomWords} = alignment;
    // each bottomWord results in a nested verseObject of tag: w, type: word
    // located inside innermost nested topWord/k verseObject
    const wordVerseObjects = bottomWords.map(bottomWord =>
      wordVerseObjectFromBottomWord(bottomWord)
    );
    // each topWord results in a nested verseObject of tag: k, type: milestone
    const milestones = topWords.map(topWord =>
      milestoneVerseObjectFromTopWord(topWord)
    );
    // place the wordVerseObjects in the last milestone as children
    milestones[milestones.length-1].children = wordVerseObjects;
    // nest the milestones so that the first is the parent and each subsequent is nested
    const milestone = nestMilestones(milestones);
    if (milestone) {
      verseObjects.push(milestone);
    }
  });
  return verseObjects;
};
/**
 * @description Nests the milestons so that the first is the root and each after is nested
 * @param {Array} milestones - an array of milestone objects
 * @returns {Object} - the nested milestone
 */
export const nestMilestones = milestones => {
  let milestone;
  milestones.reverse();
  milestones.forEach(_milestone => {
    if (!milestone) { // if this is the first milestone, populate it
      milestone = _milestone;
    } else { // if the milestone was already there
      _milestone.children = [milestone]; // nest the existing milestone as children
      milestone = _milestone; // replace the milestone with this one
    }
    // next loop will use the resulting milestone to nest until no more milestones
  });
  return milestone;
};
/**
 * @description Converts a bottomWord to a verseObject of tag: w, type: word
 * @param {Object} bottomWord - a wordObject to convert
 * @returns {Object} - a verseObject of tag: w, type: word
 */
export const wordVerseObjectFromBottomWord = bottomWord => (
  {
    tag: "w",
    type: "word",
    text: bottomWord.word,
    occurrence: bottomWord.occurrence,
    occurrences: bottomWord.occurrences
  }
);
/**
 * @description Converts a bottomWord to a verseObject of tag: w, type: word
 * @param {Object} bottomWord - a wordObject to convert
 * @returns {Object} - a verseObject of tag: w, type: word
 */
export const milestoneVerseObjectFromTopWord = topWord => (
  {
    tag: "k",
    type: "milestone",
    "content-source": "bhp",
    content: topWord.word,
    strong: topWord.strong,
    lemma: topWord.lemma,
    morph: topWord.morph,
    occurrence: topWord.occurrence,
    occurrences: topWord.occurrences
  }
);
/**
 * @description pivots bottomWords/targetLanguage verseObjectArray into alignments sorted by verseText
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {String} string - The string to base the bottomWords sorting
 * @returns {Array} - sorted array of alignments to be used for wordAlignmentReducer
 */
export const alignmentsFromTargetLanguageVerse = (verseObjects, topWordVerseData) => {
  // create the response object and seed it with the topWordVerseData verseObjects
  let alignments = topWordVerseData.map((verseObject, index) => {
    const string = topWordVerseData.map(o => o.word).join(' ');
    verseObject.occurrence = WordAlignmentHelpers.getOccurrenceInString(string, index, verseObject.word);
    verseObject.occurrences = WordAlignmentHelpers.occurrencesInString(string, verseObject.word);
    return {
      topWords: [verseObject],
      bottomWords: []
    };
  });
  // add an empty alignment for wordBank
  const emptyAlignment = {
    topWords: [],
    bottomWords: []
  };
  alignments.push(emptyAlignment);
  let mergeableverseObjectsArray = [];
  verseObjects.forEach(verseObject => { // loop through the alignments
    const {word, occurrence, occurrences, bhp} = verseObject;
    const bottomWord = {
      word,
      occurrence,
      occurrences
    };
    if (bhp) {
      bhp.forEach(topWord => { // loop through the bottomWords for the verse
        // find the index of topWord in the verseData
        const index = topWordVerseData.findIndex(o => {
          return (
            o.word === topWord.word &&
            o.occurrence === topWord.occurrence &&
            o.occurrences === topWord.occurrences
          );
        });
        alignments[index].bottomWords.push(bottomWord); // append the verseObject to the array
      });
      // see if the top items are mergeableverseObject
      if (bhp.length > 1) mergeableverseObjectsArray.push(bhp);
    } else {
      // add to the last/empty alignment for wordBank
      alignments[alignments.length-1].bottomWords.push(bottomWord);
    }
  });
  // merge the alignments that have the same bottomWords
  mergeableverseObjectsArray.forEach(mergeableverseObjects => {
    // find index for first verseObject in mergeableverseObject
    const firstMergeableIndex = topWordVerseData.findIndex(object => {
      const firstMergeableverseObject = mergeableverseObjects.shift();
      return isEqual(object, firstMergeableverseObject);
    });
    // for all of the other mergeable word objects, that aren't the first...
    mergeableverseObjects.forEach(mergeableverseObject => {
      // get the topWords to merge the new ones in...
      const firstMergeableTopWords = alignments[firstMergeableIndex].topWords;
      // get the index of this mergeableverseObject, so we can add the topWords
      const newMergeableIndex = topWordVerseData.findIndex(object => {
        return isEqual(object, mergeableverseObject);
      });
      // get the top words for this mergeableverseObject
      const newMergeableTopWords = alignments[newMergeableIndex].topWords;
      // merge the topWords with the firstMergeableTopWords
      const mergedTopWords = firstMergeableTopWords.concat(newMergeableTopWords);
      // save the merged topWords
      alignments[firstMergeableIndex].topWords = mergedTopWords;
      // mark the alignment for removal
      alignments[newMergeableIndex].remove = true;
    });
    // loop through the alignments and remove the ones marked for removal
    alignments = alignments.filter(alignment => !alignment.remove);
  });
  // sort the bottomWords in each alignment
  alignments = alignments.map(alignment => {
    const verseText = verseObjects.map(o => o.word).join(' ');
    const {bottomWords} = alignment;
    alignment.bottomWords = WordAlignmentHelpers.sortverseObjectsByString(bottomWords, verseText);
    return alignment;
  });
  return alignments;
};
