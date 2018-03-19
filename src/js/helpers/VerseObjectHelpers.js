import usfm from 'usfm-js';
import stringHelpers from 'string-punctuation-tokenizer';
import {getWordText} from "./WordAlignmentHelpers";
/**
 * @description verseObjects with occurrences from verseObjects
 * @param {Array} verseObjects - Word list to add occurrence(s) to
 * @returns {Array} - verseObjects with occurrences
 */
export const getOrderedVerseObjects = (verseObjects) => {
  const _verseObjects = JSON.parse(JSON.stringify(verseObjects));
  _verseObjects.forEach((verseObject, i) => {
    if (verseObject.type === 'word') {
      verseObject.occurrence = getOccurrence(_verseObjects, i, verseObject.text);
      verseObject.occurrences = getOccurrences(_verseObjects, verseObject.text);
    }
  });
  return _verseObjects;
};
/**
 * @description verseObjects with occurrences via string
 * @param {String} string - The string to search in
 * @returns {Array} - verseObjects with occurrences
 */
export const getOrderedVerseObjectsFromString = (string) => {
  let verseObjects = [];
  // convert string using usfm to JSON
  const _verseObjects = usfm.toJSON('\\v 1 ' + string, {chunk: true}).verses["1"].verseObjects;
  const _verseObjectsWithTextString = _verseObjects
    .map(verseObject => verseObject.text)
    .filter(text => text)
    .join(' ');
  let nonWordVerseObjectCount = 0;
  _verseObjects.forEach(_verseObject => {
    if (_verseObject.text) {
      stringHelpers.tokenizeWithPunctuation(_verseObject.text).map( text => {
        let verseObject;
        if (stringHelpers.word.test(text)) { // if the text has word characters, its a word object
          const wordIndex = verseObjects.length - nonWordVerseObjectCount;
          let occurrence = stringHelpers.occurrenceInString(_verseObjectsWithTextString, wordIndex, text);
          const occurrences = stringHelpers.occurrencesInString(_verseObjectsWithTextString, text);
          if (occurrence > occurrences) occurrence = occurrences;
          verseObject = {
            tag: "w",
            type: "word",
            text,
            occurrence,
            occurrences
          };
        } else { // the text does not have word characters
          nonWordVerseObjectCount ++;
          verseObject = {
            type: "text",
            text: text
          };
        }
        verseObjects.push(verseObject);
      });
    } else {
      verseObjects.push(_verseObject);
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
  const _milestones = JSON.parse(JSON.stringify(milestones));
  let milestone;
  _milestones.reverse();
  _milestones.forEach(_milestone => {
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
export const wordVerseObjectFromBottomWord = (bottomWord, textKey = 'word') => (
  {
    tag: "w",
    type: "word",
    text: bottomWord[textKey],
    occurrence: bottomWord.occurrence,
    occurrences: bottomWord.occurrences
  }
);
/**
 * @description Converts a topWord to a verseObject of tag: w, type: word
 * @param {Object} topWord - a wordObject to convert
 * @returns {Object} - a verseObject of tag: w, type: word
 */
export const milestoneVerseObjectFromTopWord = topWord => {
  let verseObject = JSON.parse(JSON.stringify(topWord));
  verseObject.tag = "zaln";
  verseObject.type = "milestone";
  verseObject.content = topWord.word;
  delete verseObject.word;
  delete verseObject.tw;
  return verseObject;
};
/**
 * @description Converts a verseObject of tag: w, type: word into an alignmentObject
 * @param {Object} verseObject - a wordObject to convert
 * @returns {Object} - an alignmentObject
 */
export const alignmentObjectFromVerseObject = verseObject => {
  let wordObject = JSON.parse(JSON.stringify(verseObject));
  wordObject.word = wordObject.text || wordObject.content;
  delete wordObject.content;
  delete wordObject.text;
  delete wordObject.tag;
  delete wordObject.type;
  delete wordObject.children;
  return wordObject;
};

/**
 * @description Returns index of the verseObject in the verseObjects (ignores occurrences since that can be off)
 * @param {Array} verseObjects - array of the verseObjects to search in
 * @param {Object} verseObject - verseObject to search for
 * @returns {Int} - the index of the verseObject
 */
export const indexOfVerseObject = (verseObjects, verseObject) => (
  verseObjects.findIndex(_verseObject => {
    return (_verseObject.text === verseObject.text) && (_verseObject.occurrence === verseObject.occurrence)
      && (_verseObject.type === verseObject.type) && (_verseObject.tag === verseObject.tag);
  })
);

/**
 * @description merge verse data into a string
 * @param {Object|Array} verseData
 * @param {array} filter - Optional filter to get a specific type of word object type.
 * @return {String}
 */
export const mergeVerseData = (verseData, filter) => {
  if (verseData.verseObjects) {
    verseData = verseData.verseObjects;
  }
  const verseArray = [];
  verseData.forEach((part) => {
    if (typeof part === 'string') {
      verseArray.push(part);
    }
    let words = [part];
    if (part.type === 'milestone') {
      words = extractWordsFromVerseObject(part);
    }
    words.forEach(word => {
      if (!filter || (word.text && word.type && filter.includes(word.type))) {
        verseArray.push(word.text);
      }
    });
  });
  let verseText = '';
  for (let verse of verseArray) {
    if (verse) {
      if (verseText && (verseText[verseText.length - 1] !== '\n')) {
        verseText += ' ';
      }
      verseText += verse;
    }
  }
  return verseText;
};

/**
 * extracts word objects from verse object.  If verseObject is word type, return that in array, else if it is a
 *    milestone, then add words found in children to word array.  If no words found return empty array.
 * @param {object} verseObject
 * @return {Array} words found
 */
export const extractWordsFromVerseObject = (verseObject) => {
  let words = [];
  if (typeof(verseObject) === 'object') {
    if (verseObject.word || verseObject.type === 'word') {
      words.push(verseObject);
    } else if (verseObject.type === 'milestone' && verseObject.children) {
      for (let child of verseObject.children) {
        const childWords = extractWordsFromVerseObject(child);
        words = words.concat(childWords);
      }
    }
  }
  return words;
};

/**
 * extract list of word objects from array of verseObjects (will also search children of milestones).
 * @param {Array} verseObjects
 * @return {Array} words found
 */
export const getWordListFromVerseObjectArray = function (verseObjects) {
  let wordList = [];
  for (let verseObject of verseObjects) {
    const words = extractWordsFromVerseObject(verseObject);
    wordList = wordList.concat(words);
  }
  return wordList;
};

/**
 * @description returns a flat array of VerseObjects (currently needed for rendering UGNT since words may be nested in milestones)
 * @param {Object|Array} verse - verseObjects that need to be flattened.
 * @return {array} wordlist - flat array of VerseObjects
 */
export const getWordListForVerse = (verse) => {
  let words = [];
  if (verse.verseObjects) {
    flattenVerseObjects(verse.verseObjects, words);
  } else { // already a flat word list
    words = verse;
  }
  return words;
};

/**
 * @description flatten verse objects from nested format to flat array
 * @param {array} verse - source array of nested verseObjects
 * @param {array} words - output array that will be filled with flattened verseObjects
 */
const flattenVerseObjects = (verse, words) => {
  for (let object of verse) {
    if (object) {
      if (object.type === 'word') {
        object.strong = object.strong || object.strongs;
        words.push(object);
      } else if (object.type === 'milestone') { // get children of milestone
        // add content attibute to children
        const newObject = addContentAttributeToChildren(object.children, object);
        flattenVerseObjects(newObject, words);
      } else {
        words.push(object);
      }
    }
  }
};

 /** Method to filter usfm markers from a string or verseObjects array
  * @param {String|Array|Object} verseObjects - The string to remove markers from
  * @return {Array}
  */
export const getWordList = (verseObjects) => {
  let wordList = [];
  if (typeof verseObjects === 'string') {
    verseObjects = getOrderedVerseObjectsFromString(verseObjects);
  }
  if (verseObjects && verseObjects.verseObjects) {
    verseObjects = verseObjects.verseObjects;
  }

  if (verseObjects) {
    wordList = getWordListFromVerseObjectArray(verseObjects);
  }
  return wordList;
};

const addContentAttributeToChildren = (childrens, parentObject, grandParentContent) => {
  return childrens.map((child) => {
    if (child.children) {
      child = addContentAttributeToChildren(child.children, child, parentObject.content);
    } else if (!child.content && parentObject.content) {
      const childrenContent = [parentObject];
      if (grandParentContent) childrenContent.push(grandParentContent);
      child.content = childrenContent;
    }
    return child;
  });
};

/**
 * Gets the occurrence of a subString in words by counting up to subString index
 * @param {String|Array} words - word list or string to search
 * @param {Number} currentWordIndex - index of desired word in words
 * @param {String} subString - The sub string to search for
 * @return {Integer} - the occurrence of the word at currentWordIndex
 */
export const getOccurrence = (words, currentWordIndex, subString) => {
  if (typeof words === 'string') {
    return stringHelpers.occurrenceInString(words, currentWordIndex, subString);
  }

  let occurrence = 0;
  if (Array.isArray(words)) {
    for (let i = 0; i <= currentWordIndex; i++) {
      if (getWordText(words[i]) === subString) occurrence++;
    }
  }
  return occurrence;
};
/**
 * Function that count occurrences of a substring in words
 * @param {String|Array} words - word list or string to search
 * @param {String} subString - The sub string to search for
 * @return {Integer} - the count of the occurrences
 */
export const getOccurrences = (words, subString) => {
  if (typeof words === 'string') {
    return stringHelpers.occurrencesInString(words, subString);
  }

  let occurrences = 0;
  if (Array.isArray(words)) {
    for( let word of words ) {
      if (getWordText(word) === subString) occurrences++;
    }
  }
  return occurrences;
};
