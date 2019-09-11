import path from 'path';
import fs from 'fs-extra';
import * as Version from './VersionUtils';

export const MIGRATE_MANIFEST_VERSION = 5;

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
  console.log('migrateToVersion5(' + projectPath + ')');
  updateAlignments(projectPath);
  Version.setVersionInManifest(projectPath, MIGRATE_MANIFEST_VERSION);
};

/**
 * reads the alignment files and updates them to tc manifest version 5.  Includes fixing zeroed occurrence(s) in
 *      alignment data topwords
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
        fixProjectOccurrencesTopWords(file_path, file);
      }
    }
  }
};

/**
 * updates file to tc manifest version 5.  Includes fixing zeroed occurrence(s) in alignment data
 * @param filePath
 */
export const fixProjectOccurrencesTopWords = function (filePath) {
  let broken = false;

  try {
    const chapter_alignments = fs.readJsonSync(filePath);

    for (let verseKey in chapter_alignments) {
      const verse = chapter_alignments[verseKey];

      for (let alignment of verse.alignments) {
        for (let word of alignment.topWords) {
          if (!word.occurrence || !word.occurrences) {
            broken = true;
            break;
          }
        }

        if (broken) {
          break;
        }
      }

      if (broken) {
        fixOccurrencesInVerse(verse);
      }
    }

    if (broken) {
      fs.outputJsonSync(filePath, chapter_alignments, { spaces: 2 });
    }
  } catch (e) {
    console.warn('Error opening chapter alignment \'' + filePath + '\': ' + e.toString());
  }
};

/**
 * fix 0 occurrences in verse
 * @param verse
 */
function fixOccurrencesInVerse(verse) {
  // flatten into word list first
  const wordList = [];

  for (let alignment of verse.alignments) {
    for (let word of alignment.topWords) {
      wordList.push(word);
    }
  }

  for (let i = 0; i < wordList.length; i++) {
    const word = wordList[i];

    if (!word.occurrence || !word.occurrences) {
      const { occurrence, occurrences } = getOccurrences(wordList, i, getWordText(wordList[i]));
      word.occurrence = occurrence;
      word.occurrences = occurrences;
    }
  }
}

/**
 * Gets the occurrence of a subString in a string by using the subString index in the string.
 * @param {String|Array} alignments - word list or string to search
 * @param {Number} currentWordIndex
 * @param {String} subString
 * @return {Object}
 */
export const getOccurrences = (alignments, currentWordIndex, subString) => {
  let occurrences = 0;
  let occurrence = 0;

  for (let i = 0; i < alignments.length; i++) {
    const match = getWordText(alignments[i]) === subString;

    if (match) {
      occurrences++;

      if (i <= currentWordIndex) {
        occurrence++;
      }
    }
  }
  return { occurrence, occurrences };
};

/**
 * get text from word type verse object or word object
 * @param {object} wordObject
 * @return {string|undefined} text from word object
 */
export const getWordText = (wordObject) => {
  if (wordObject && (wordObject.type === 'word')) {
    return wordObject.text;
  }
  return wordObject ? wordObject.word : undefined;
};
