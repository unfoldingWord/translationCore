import path from 'path';
import * as fs from 'fs-extra';
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
  if (shouldRun(projectPath)) run(projectPath);
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
  updateAlignments(projectPath);
  Version.setVersionInManifest(projectPath, MIGRATE_MANIFEST_VERSION);
};

export const updateAlignments = function (projectPath) {
  const projectAlignmentDataPath = path.join(projectPath, '.apps', 'translationCore', 'alignmentData');
  if (fs.existsSync(projectAlignmentDataPath)) {
    const alignmentFolders = fs.readdirSync(projectAlignmentDataPath);
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

export const updateAlignmentsForFile = function (filePath) {
  let modified = false;
  try {
    const chapter_alignments = fs.readJsonSync(filePath);
    for (let verse of Object.keys(chapter_alignments)) {
      const alignmentWords = {};
      for (let alignment of chapter_alignments[verse].alignments) {
        modified = convertStrongstoStrong(alignment, modified);

        // populate map of alignment words
        for (let wordItem of alignment.bottomWords) {
          const {word, occurrence} = wordItem;
          if (!alignmentWords[word]) alignmentWords[word] = {};
          alignmentWords[word][occurrence] = wordItem;
        }
      }

      // add wordBank words to alignment words
      for (let wordItem of chapter_alignments[verse].wordBank) {
        const {word, occurrence} = wordItem;
        if (!alignmentWords[word]) alignmentWords[word] = {};
        alignmentWords[word][occurrence] = wordItem;
      }

      let modifiedOccurrence = false;
      for (let word of Object.keys(alignmentWords)) {
        const wordData = alignmentWords[word];
        const occurrenceList = Object.keys(wordData).sort((a, b) => (parseInt(a) - parseInt(b)));
        const actualOccurrences = occurrenceList.length;
        for (let i = 0; i < actualOccurrences; i++) {
          const itemOccurrence = occurrenceList[i];
          const wordItem = wordData[itemOccurrence];
          if (parseInt(itemOccurrence) !== i + 1) { // if occurrence is off
            console.log("changing occurrence of '" + wordItem.word + "' from " + wordItem.occurrence +
              " to " + (i + 1) + " in  verse " + verse + " of '" + path.basename(filePath) + "'");
            wordItem.occurrence = i + 1;
            modifiedOccurrence = true;
          }
          if (wordItem.occurrences !== actualOccurrences) { // if occurrences are off
            wordItem.occurrences = actualOccurrences;
            modifiedOccurrence = true;
          }
        }
      }

      if (modifiedOccurrence) {
        console.log("updated occurence(s) in verse " + verse + " of '" + path.basename(filePath) + "'");
        modified = true;
      }
    }
    if (modified) {
      fs.outputJsonSync(filePath, chapter_alignments);
    }
  } catch (e) {
    console.warn("Error opening chapter alignment '" + filePath + "': " + e.toString());
  }
};

const convertStrongstoStrong = function (alignment, modified) {
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
