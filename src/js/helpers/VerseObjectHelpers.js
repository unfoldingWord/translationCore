import usfm from 'usfm-js';
import * as stringHelpers from './stringHelpers';
/**
 * @description wordObjectArray via string
 * @param {String} string - The string to search in
 * @returns {Array} - array of wordObjects
 */
export const verseObjectsFromString = (string) => {
  let verseObjects = [];
  // convert string using usfm to
  const _verseObjects = usfm.toJSON('\\v 0 ' + string, {chunk: true}).verses["0"].verseObjects;
  _verseObjects.forEach(_verseObject => {
    stringHelpers.tokenizeWithPunctuation(_verseObject.text).map( (text, index) => {
      let verseObject;
      if ((/\w/).test(text)) { // if the text has word characters, its a word object
        const occurrence = stringHelpers.getOccurrenceInString(string, index, text);
        const occurrences = stringHelpers.occurrencesInString(string, text);
        verseObject = {
          tag: "w",
          type: "word",
          text,
          occurrence,
          occurrences
        };
      } else { // the text does not have word characters
        verseObject = {
          type: "text",
          text: text
        };
      }
      verseObjects.push(verseObject);
    });
  });
  return verseObjects;
  // // loop through

  // return wordObjectArray;
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
