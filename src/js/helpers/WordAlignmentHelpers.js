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
