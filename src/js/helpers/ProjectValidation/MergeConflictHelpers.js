/* eslint-disable no-useless-concat */
/* eslint-disable no-loop-func */
import usfmParser from 'usfm-js';
import fs from 'fs-extra';
import Path from 'path-extra';
// helpers
import { VerseObjectUtils } from 'word-aligner';
// constants
const regex = /<<<<<<<.*([\s\S]*?)=======([\s\S]*?)>>>>>>>/g;
const replaceRegex = /(<<<<<<<\s?.*[\s\S]*?>>>>>>>\s?.*)/;

/**
 * Seaches usfm data with regex and returns all merge conflicts found separated by string.
 * Each element in the array represents a different version of the conflict.
 * The versions are split by pair of two naturally.
 *
 * @example ["1 this is the first version", "1 This is the second version"] - represents one verse conflict
 * @param {string} usfmData - usfm string to be searched for merge conflicts
 * @return {string[]}
 */
export function getMergeConflicts(usfmData) {
  let allMergeConflictsFoundArray = [];
  let regexMatchedMergeConflicts;

  while ((regexMatchedMergeConflicts = regex.exec(usfmData)) !== null) {
    // This is necessary to avoid infinite loops with zero-width allMergeConflictsFoundArray
    if (regexMatchedMergeConflicts.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    //removes unneeded full match in first index
    regexMatchedMergeConflicts.shift();

    regexMatchedMergeConflicts.forEach((match) => {
      allMergeConflictsFoundArray.push(match);
    });
  }

  /*
  * If there is an odd amount of total versions at least one version
  * is not matched with a corresponding version with different history
  */
  if (allMergeConflictsFoundArray.length % 2 !== 0) {
    return console.error('Problem parsing merge conflicts');
  }
  return allMergeConflictsFoundArray;
}

/**
 * Parsing the merge conflict version text in an object more easily consumable for the displaying container
 * @param {string} versionText - The verse string with the number being the first character
 * @param {string} usfmData - The selected usfm file being parsed
 */
export function parseMergeConflictVersion(versionText, usfmData) {
  /**
   * Parsing usfm string to get verse numbers
   * @type {{1:"Verse one", 2:"Verse 1"}}
   */
  let parsedTextObject = usfmParser.toJSON(versionText, { chunk: true }).verses;
  /**@example {['1', '2', '3']} */
  let verseNumbersArray = Object.keys(parsedTextObject);
  let verses = verseNumbersArray.length > 1 ?
    `${verseNumbersArray[0]}-${verseNumbersArray[verseNumbersArray.length - 1]}` :
    `${verseNumbersArray[0]}`;
  let verseData = parsedTextObject[verseNumbersArray[0]];

  if (verseData.verseObjects) {
    verseData = verseData.verseObjects;
  }

  let chapter;
  let verseText;

  for (var verseNum of verseNumbersArray) {
    verseText = VerseObjectUtils.mergeVerseData(parsedTextObject[verseNum]);
    parsedTextObject[verseNum] = verseText;
  }
  chapter = getChapterFromVerseText(verseText, usfmData);
  return {
    chapter,
    verses,
    text: parsedTextObject,
  };
}

/**
 * Returns the chapter that a given verse is from.
 * @param {string} verseText - The string to search for in the usfm data
 * @param {string} usfmData - Entire usfm data being loaded
 */
export function getChapterFromVerseText(verseText, usfmData) {
  let chapterRegex = new RegExp(`\\c (\\d+)(?=[\\s\\S]*${verseText})`, 'g');
  let m;
  let chapter;

  while ((m = chapterRegex.exec(usfmData)) !== null) {
    chapter = m[1];
  }
  return chapter;
}

/**
 * This method takes the chosen git history and uses it for merging the input usfm data
 * note: this function writes the merged data to the fs.
 * @param {object} mergeConflictArray - Object to be parsed that contains the information
 * of the chosen text to merge
 * @param {String} inputFile - input Path of the project
 * @param {String} outputFile - output Path of the project
 */
export function merge(mergeConflictArray, inputFile, outputFile) {
  try {
    if (!outputFile) {
      outputFile = inputFile;
    }

    if (inputFile) {
      let usfmData = fs.readFileSync(inputFile).toString();

      for (let conflict of mergeConflictArray) {
        let chosenText;

        for (let version of conflict) {
          if (version.checked) {
            chosenText = version.text;
          }
        }

        let chosenVerseObjects = {};

        for (let verseNum in chosenText) {
          chosenVerseObjects[verseNum] = { verseObjects: [] };
          chosenVerseObjects[verseNum].verseObjects.push({
            text: chosenText[verseNum],
            type: 'text',
          });
        }

        const chosenTextUSFMString = usfmParser.toUSFM({ verses: chosenVerseObjects });
        usfmData = usfmData.replace(replaceRegex, chosenTextUSFMString);
      }

      fs.outputFileSync(outputFile, usfmData);
    }
  } catch (e) {
    console.warn('Problem merging conflicts', e);
  }
}

/**
 * This method will take a tS project and convert it to a usfm file.
 * @param {String} projectSaveLocation - path to the project
 */
export function createUSFMFromTsProject(projectSaveLocation) {
  let usfmData = '';

  try {
    const chapters = fs.readdirSync(projectSaveLocation);

    for (var chapterFileNumber of chapters) {
      //only want the chapter number folders
      let chapterNumber = Number(chapterFileNumber);

      if (chapterNumber) {
        usfmData += '\\c ' + chapterNumber + '\n';
        usfmData += '\\p' + '\n';
        const files = fs.readdirSync(Path.join(projectSaveLocation, chapterFileNumber)); // get the chunk files in the chapter path

        files.forEach(file => {
          if (file.match(/\d+.txt/)) { // only import chunk/verse files (digit based)
            const chunkPath = Path.join(projectSaveLocation, chapterFileNumber, file);
            let text = fs.readFileSync(chunkPath).toString();
            text = text.replace(/\\c\s*\d\s*/, '');
            text = text.replace(/\\p.*/, '');
            usfmData += text + '\n';
          }
        });
      }
    }
  } catch (e) {
    console.warn('Problem converting tS project to usfm, merge conflicts may have errors', e);
  }
  return usfmData;
}

/**
 * Determines whether or not there is usfm to parse for merge conflicts
 * and if there is return the data it contains
 * @param {string} usfmFilePath - path to the usfm file of the project, note this may not exist
 * @returns {bool}
 */
export function checkUSFMForMergeConflicts(usfmFilePath) {
  let usfmData;

  try {
    usfmData = fs.readFileSync(usfmFilePath).toString();
  } catch (e) {
    return false;
  }

  // usfm file does not have merge conflicts
  if (!usfmData.includes('<<<<<<<') || !usfmData.includes('>>>>>>>')) {
    return false;
  }
  return true;
}

/**
 * This method reads in all the chunks of a project, and determines if there is any merge conflicts.
 * @param {Array} projectChunks - An array of finished chunks, as defined by the manfest
 * @param {String} projectPath - The current save location of the project
 * @returns {Boolean} True if there is any merge conflicts, false if the project does not contain any
 */
export function projectHasMergeConflicts(projectPath, bookAbbr) {
  if (!fs.existsSync(Path.join(projectPath, bookAbbr))) {
    return false;
  }

  let currentFolderChapters = fs.readdirSync(Path.join(projectPath, bookAbbr));

  for (var currentChapterFile of currentFolderChapters) {
    let currentChapter = Path.parse(currentChapterFile).name;

    if (!parseInt(currentChapter)) {
      continue;
    }

    try {
      let currentChapterObject = fs.readJSONSync(Path.join(projectPath, bookAbbr, currentChapterFile));
      let fileContents = JSON.stringify(currentChapterObject);

      if (fileContents.includes('<<<<<<<') || fileContents.includes('>>>>>>>')) {
        return true;
      }
    } catch (e) {
      console.warn(e);
    }
  }
  return false;
}

export function loadUSFM(filePath) {
  try {
    var usfmData = fs.readFileSync(filePath).toString();
    return usfmData;
  } catch (e) {
    return null;
  }
}

/**
 * Quick method to write out USFM file synchronously
 * @param {string} usfmFilePath - Path to the usfm file to write out
 * @param {string} usfmData - String containing the usfm data
 */
export function writeUSFM(usfmFilePath, usfmData) {
  try {
    fs.outputFileSync(usfmFilePath, usfmData);
  } catch (e) {
    console.warn('could not write usfm to file system');
  }
}
