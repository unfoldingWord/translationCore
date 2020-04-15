/* eslint-disable no-loop-func */
import path from 'path';
import fs from 'fs-extra';
import * as Version from './VersionUtils';

export const MIGRATE_MANIFEST_VERSION = 2;

/**
 * @description
 * function that conditionally runs the migration if needed
 * @param {String} projectPath - path to project
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 */
export default (projectPath, projectLink) => {
  Version.getVersionFromManifest(projectPath, projectLink); // ensure manifest converted for tc

  if (shouldRun(projectPath)) {
    run(projectPath);
  }
};

/**
 * @description function that checks to see if the migration should be run
 * @param {String} projectPath - path to project
 * @return {boolean} true if version number needs to be updated
 */
const shouldRun = (projectPath) => {
  const version = Version.getVersionFromManifest(projectPath);
  return (version < MIGRATE_MANIFEST_VERSION);
};


/**
 * @description - update manifest version to this version
 * @param {String} projectPath - path to project
 * @return {null}
 */
const run = (projectPath) => {
  console.log('migrateToVersion2(' + projectPath + ')');
  updateAlignments(projectPath);
  Version.setVersionInManifest(projectPath, MIGRATE_MANIFEST_VERSION);
};

/**
 * reads the alignment files and updates them to tc manifest version 2.  Includes converting
 *    strongs attribute to strong and fixing occurrence/occurrences attributes.
 * @param projectPath
 */
export const updateAlignments = function (projectPath) {
  const projectAlignmentDataPath = path.join(projectPath, '.apps', 'translationCore', 'alignmentData');

  if (fs.existsSync(projectAlignmentDataPath)) {
    const alignmentFolders = fs.readdirSync(projectAlignmentDataPath).filter(folder => (fs.statSync(path.join(projectAlignmentDataPath, folder)).isDirectory() && (folder !== '.DS_Store')));

    for (let folder of alignmentFolders) {
      const alignmentPath = path.join(projectAlignmentDataPath, folder);
      const files = fs.readdirSync(alignmentPath).filter((file) => (path.extname(file) === '.json'));

      for (let file of files) {
        const file_path = path.join(alignmentPath, file);
        updateAlignmentsForFile(file_path, file);
      }
    }
  }
};

/**
 * updates file to tc manifest version 2.  Includes converting strongs attribute to strong and
 *      fixing occurrence/occurrences attributes.
 * @param filePath
 */
export const updateAlignmentsForFile = function (filePath) {
  let modified = false;

  try {
    const chapter_alignments = fs.readJsonSync(filePath);

    for (let verseKey in chapter_alignments) {
      const verse = chapter_alignments[verseKey];
      const foundWords = {}; // this is a dictionary keyed by the word, each entry is an array of alignment instances of that word

      for (let alignment of verse.alignments) {
        modified |= convertStrongstoStrong(alignment);
        findWordsInWordList(foundWords, alignment.bottomWords); // search bottom words
      }
      findWordsInWordList(foundWords, verse.wordBank); // search word bank
      modified |= correctOccurrencesInAlignmentWords(foundWords);
    }

    if (modified) {
      fs.outputJsonSync(filePath, chapter_alignments, { spaces: 2 });
    }
  } catch (e) {
    console.warn('Error opening chapter alignment \'' + filePath + '\': ' + e.toString());
  }
};

/**
 * convert instances of strongs attribute to strong in alignment
 * @param {object} alignment to correct
 * @return {boolean} true if modified
 */
const convertStrongstoStrong = function (alignment) {
  let modified = false;

  for (let word of alignment.topWords) {
    if (word.strongs) {
      word.strong = word.strongs;
      delete word.strongs;
      modified = true;
    }
  }
  return modified;
};

/**
 * iterate through wordList and append entry to array for word.  If word is new, then a new entry is created.
 * @param {object} foundWords - dictionary keyed by the word, each entry is an array of alignment instances of that word
 * @param {array} wordList - word list to search
 */
let findWordsInWordList = function (foundWords, wordList) {
  for (let wordItem of wordList) {
    const { word, occurrence } = wordItem;

    if (!foundWords[word]) {
      foundWords[word] = {};
    } // add entry if new word
    foundWords[word][occurrence] = wordItem;
  }
};

/**
 * correct occurrence/occurrences in foundWords
 * @param {object} foundWords - dictionary keyed by the word, each entry is an array of alignment instances of that word
 * @return {boolean} returns true if modified
 */
const correctOccurrencesInAlignmentWords = function (foundWords) {
  let modifiedOccurrence = false;

  for (let wordKey in foundWords) {
    const wordInstances = foundWords[wordKey];

    // sort instances of word numerically - they are keyed by occurrence in current alignment which may have gaps
    const occurrenceList = Object.keys(wordInstances).sort((a, b) => (parseInt(a) - parseInt(b)));
    const actualCount = occurrenceList.length;

    // foundOccurrence here is the value of occurrence in alignment data as a string.  This value should be
    // index+1 if it was set properly
    occurrenceList.forEach((foundOccurrence, index) => {
      const word = wordInstances[foundOccurrence]; // get the alignment instance of word
      const expectedOccurrence = index + 1;

      if (parseInt(foundOccurrence) !== expectedOccurrence) { // if occurrence value is off
        word.occurrence = expectedOccurrence;
        modifiedOccurrence = true;
      }

      if (word.occurrences !== actualCount) { // if occurrences count is off
        word.occurrences = actualCount;
        modifiedOccurrence = true;
      }
    });
  }
  return modifiedOccurrence;
};

/**
 * @description merge verse data into a string
 * @param {Object|Array|String} verseData
 * @return {String}
 */
export const mergeVerseData = (verseData) => {
  if (verseData.verseObjects) {
    verseData = verseData.verseObjects;
  }

  if (typeof verseData === 'string') {
    return verseData;
  }

  const verseArray = verseData.map((verse) => {
    if (typeof verse === 'string') {
      return verse;
    }

    if (verse.text) {
      return verse.text;
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
