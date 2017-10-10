import isEqual from 'lodash/isEqual';
import * as stringHelpers from './stringHelpers';
/**
 * Concatenates an array of string into a verse.
 * @param {array} verseArray - array of strings in a verse.
 */
 export const combineGreekVerse = (verseArray) => {
  return verseArray.map(o => o.word).join(' ');
};

export const populateOccurrencesInWordObjects = (wordObjects) => {
  const string = combineGreekVerse(wordObjects);
  return wordObjects.map((wordObject, index) => {
    wordObject.occurrence = getOccurrenceInString(string, index, wordObject.word);
    wordObject.occurrences = occurrencesInString(string, wordObject.word);
    return wordObject;
  });
};

/**
 * gets the occurrence of a subString in a string by using the subString index in the string.
 * @param {String} string
 * @param {Number} currentWordIndex
 * @param {String} subString
 * TODO: Replace with the tokenizer version of this to prevent puctuation issues
 * Cannot replace with tokenizer until tokenizer handles all greek use cases that broke tokenizer
 */
export const getOccurrenceInString = (string, currentWordIndex, subString) => {
  let arrayOfStrings = string.split(' ');
  let occurrence = 1;
  let slicedStrings = arrayOfStrings.slice(0, currentWordIndex);

  slicedStrings.forEach((slicedString) => {
    if (slicedStrings.includes(subString)) {
      slicedString === subString ? occurrence += 1 : null;
    } else {
      occurrence = 1;
    }
  });
  return occurrence;
};
/**
 * @description Function that count occurrences of a substring in a string
 * @param {String} string - The string to search in
 * @param {String} subString - The sub string to search for
 * @returns {Integer} - the count of the occurrences
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 * modified to fit our use cases, return zero for '' substring, and no use case for overlapping.
 */
export const occurrencesInString = (string, subString) => {
  if (subString.length <= 0) return 0;
  let occurrences = 0, position = 0, step = subString.length;
  while (position < string.length) {
    position = string.indexOf(subString, position);
    if (position === -1) break;
    ++occurrences;
    position += step;
  }
  return occurrences;
 };
/**
 * @description wordObjectArray via string
 * @param {String} string - The string to search in
 * @returns {Array} - array of wordObjects
 */
export const wordObjectArrayFromString = (string) => {
  const wordObjectArray = stringHelpers.tokenize(string).map( (word, index) => {
    const occurrence = getOccurrenceInString(string, index, word);
    const occurrences = occurrencesInString(string, word);
    return {
      word,
      occurrence: occurrence,
      occurrences: occurrences
    };
  });
  return wordObjectArray;
};
/**
 * @description sorts wordObjectArray via string
 * @param {Array} wordObjectArray - array of wordObjects
 * @param {String} string - The string to search in
 * @returns {Array} - sorted array of wordObjects
 */
export const sortWordObjectsByString = (wordObjectArray, stringData) => {
  if (stringData.constructor !== Array) {
    stringData = wordObjectArrayFromString(stringData);
  } else {
    stringData = populateOccurrencesInWordObjects(stringData);
  }
  let _wordObjectArray = wordObjectArray.map((wordObject) => {
    const {word, occurrence, occurrences} = wordObject;
    const _wordObject = {
      word,
      occurrence,
      occurrences
    };
    const indexInString = stringData.findIndex(object => {
      const equal = (
        object.word === _wordObject.word &&
        object.occurrence === _wordObject.occurrence &&
        object.occurrences === _wordObject.occurrences
      );
      return equal;
    });
    wordObject.index = indexInString;
    return wordObject;
  });
  _wordObjectArray = _wordObjectArray.sort((a, b) => {
    return a.index - b.index;
  });
  _wordObjectArray = _wordObjectArray.map((wordObject) => {
    delete wordObject.index;
    return wordObject;
  });
  return _wordObjectArray;
};
/**
 * @description pivots alignments into bottomWords/targetLanguage wordObjectArray sorted by verseText
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {String} string - The string to base the bottomWords sorting
 * @returns {Array} - sorted array of wordObjects to be used for verseText of targetLanguage
 */
export const targetLanguageVerseFromAlignments = (alignments, wordBank, verseText) => {
  let wordObjects = []; // response
  alignments.forEach(alignment => { // loop through the alignments
    const {bottomWords, topWords} = alignment;
    bottomWords.forEach(bottomWord => { // loop through the bottomWords for the verse
      const {word, occurrence, occurrences} = bottomWord;
      // append the aligned topWords as the bhp in each wordObject
      const wordObject = {
        word,
        occurrence,
        occurrences,
        bhp: topWords
      };
      wordObjects.push(wordObject); // append the wordObject to the array
    });
  });
  wordObjects = wordObjects.concat(wordBank);
  const isVerseTextArray = (typeof verseText !== 'string' && verseText.constructor === Array);
  // if the verseText is an array, join on the word attribute or use the existing string
  const verseData = isVerseTextArray ? verseText.map(o => o.word).join(' ') : verseText;
  wordObjects = sortWordObjectsByString(wordObjects, verseData);
  return wordObjects;
};
/**
 * @description pivots bottomWords/targetLanguage wordObjectArray into alignments sorted by verseText
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {String} string - The string to base the bottomWords sorting
 * @returns {Array} - sorted array of alignments to be used for wordAlignmentReducer
 */
export const alignmentsFromTargetLanguageVerse = (wordObjects, topWordVerseData) => {
  // create the response object and seed it with the topWordVerseData wordObjects
  let alignments = topWordVerseData.map((wordObject, index) => {
    const string = topWordVerseData.map(o => o.word).join(' ');
    wordObject.occurrence = getOccurrenceInString(string, index, wordObject.word);
    wordObject.occurrences = occurrencesInString(string, wordObject.word);
    return {
      topWords: [wordObject],
      bottomWords: []
    };
  });
  // add an empty alignment for wordBank
  const emptyAlignment = {
    topWords: [],
    bottomWords: []
  };
  alignments.push(emptyAlignment);
  let mergeableWordObjectsArray = [];
  wordObjects.forEach(wordObject => { // loop through the alignments
    const {word, occurrence, occurrences, bhp} = wordObject;
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
        alignments[index].bottomWords.push(bottomWord); // append the wordObject to the array
      });
      // see if the top items are mergeableWordObject
      if (bhp.length > 1) mergeableWordObjectsArray.push(bhp);
    } else {
      // add to the last/empty alignment for wordBank
      alignments[alignments.length-1].bottomWords.push(bottomWord);
    }
  });
  // merge the alignments that have the same bottomWords
  mergeableWordObjectsArray.forEach(mergeableWordObjects => {
    // find index for first wordObject in mergeableWordObject
    const firstMergeableIndex = topWordVerseData.findIndex(object => {
      const firstMergeableWordObject = mergeableWordObjects.shift();
      return isEqual(object, firstMergeableWordObject);
    });
    // for all of the other mergeable word objects, that aren't the first...
    mergeableWordObjects.forEach(mergeableWordObject => {
      // get the topWords to merge the new ones in...
      const firstMergeableTopWords = alignments[firstMergeableIndex].topWords;
      // get the index of this mergeableWordObject, so we can add the topWords
      const newMergeableIndex = topWordVerseData.findIndex(object => {
        return isEqual(object, mergeableWordObject);
      });
      // get the top words for this mergeableWordObject
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
    const verseText = wordObjects.map(o => o.word).join(' ');
    const {bottomWords} = alignment;
    alignment.bottomWords = sortWordObjectsByString(bottomWords, verseText);
    return alignment;
  });
  return alignments;
};
