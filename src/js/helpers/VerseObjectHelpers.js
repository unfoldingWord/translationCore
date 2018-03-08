import usfm from 'usfm-js';
import stringHelpers from 'string-punctuation-tokenizer';
/**
 * @description wordObjectArray via string
 * @param {String} string - The string to search in
 * @returns {Array} - array of wordObjects
 */
export const verseObjectsFromString = (string) => {
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
 * @param {array} - filter Optional filter to get a specific type of word object type.
 * @return {String}
 */
export const mergeVerseData = (verseData, filter) => {
  if (verseData.verseObjects) {
    verseData = verseData.verseObjects;
  }
  const verseArray = verseData.map((part) => {
    if (typeof part === 'string') {
      return part;
    }
    if (!filter || (part.text && part.type && filter.includes(part.type))) {
      return part.text;
    }
    return null;
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
    verseObjects = verseObjectsFromString(verseObjects);
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
      const childrenContent = [parentObject.content];
      if (grandParentContent) childrenContent.push(grandParentContent);
      child.content = childrenContent;
    }
    return child;
  });
};
