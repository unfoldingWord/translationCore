import isEqual from 'lodash/isEqual';
//helpers
import * as WordAlignmentHelpers from './WordAlignmentHelpers';
import * as StringHelpers from './StringHelpers';


export const occurrenceOccurrences = (string, subStringIndex, subString) => {
  const occurrence = WordAlignmentHelpers.getOccurrenceInString(string, subStringIndex, subString);
  const occurrences = WordAlignmentHelpers.occurrencesInString(string, subString);
  return `${occurrence}/${occurrences}`;
};

export const WordToPhraseOccurrence = (string, verseObjects) => {
  let occurrence;
  const subString = verseObjects.map(o => o.text).join(' ');
  const occurrences = WordAlignmentHelpers.occurrencesInString(string, subString);
  if (occurrences === 1) {
    occurrence = 1;
  } else {
    // convert string to verseObjects
    const words = StringHelpers.tokenize(string);
    // loop and tally until reaching the verseObject that matches current
    const firstVerseObject = verseObjects[0];
    let firstVerseObjectOccurrence;
    let tally = 0;
    _verseObjects.forEach(_verseObject => {
      if (!firstVerseObjectOccurrence) {
        if (_verseObject.text === firstVerseObject.text) tally ++;
        if (isEqual(firstVerseObject, _verseObject)) firstVerseObjectOccurrence = tally;
      }
    });
    occurrence = firstVerseObjectOccurrence;
  }
  // find where the first word starts in the string
  // find the occurrence of the phrase
  return occurrence;
}
/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {String} string - The string to base the bottomWords sorting
 * @returns {Array} - sorted array of verseObjects to be used for verseText of targetLanguage
 */
export const verseObjectsFromAlignmentsAndWordBank = (alignments, wordBank, verseString, alignedVerseString) => {
  let verseObjects = []; // response
  let textOccurrenceTally = {};
  alignments.forEach(alignment => { // loop through the alignments
    const {bottomWords, topWords} = alignment;
    const text = bottomWords.map(w => w.word).join(' ');
    const alignedText = topWords.map(w => w.word).join(' ');
    const strong = topWords.map(w => w.strong).join(',');
    textOccurrenceTally[text] = textOccurrenceTally[text] ? textOccurrenceTally[text] + 1 : 1;
    const subStringIndex = textOccurrenceTally[text];
    const textOccurrence = occurrenceOccurrences(verseString, subStringIndex, text);
    const alignedOccurrence = occurrenceOccurrences(alignedVerseString, alignedText);
    let verseObject = {
      tag: 'w',
      type: 'word',
      text,
      'text-occurrence': textOccurrence
    };
    if (strong) verseObject['strong'] = strong;
    if (alignedText) {
      verseObject['aligned-text'] = alignedText;
      verseObject['aligned-occurrence'] = alignedOccurrence;
    }
    verseObjects.push(verseObject); // append the verseObject to the array
  });
  wordBank.forEach(word => {
    const verseObject = {
      tag: 'w',
      type: 'word',
      text: word.word,
      'text-occurrence': `${word.occurrence}/${word.occurrences}`
    };
    verseObjects.push(verseObject); // append the verseObject to the array
  });
  verseObjects = WordAlignmentHelpers.sortWordObjectsByString(verseObjects, verseString);
  return verseObjects;
};
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
