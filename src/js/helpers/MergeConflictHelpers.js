import usfmParser from 'usfm-js';
import * as fs from 'fs-extra';
import Path from 'Path-extra';
import * as ProjectSelectionHelpers from './ProjectSelectionHelpers';
import * as TargetLanguageActions from '../actions/TargetLanguageActions';
const regex = /<<<<<<<.*([\s\S]*?)=======([\s\S]*?)>>>>>>>/g;
const replaceRegex = /(<<<<<<<\s?.*[\s\S]*?>>>>>>>\s?.*)/;

/**
 * Seaches usfm data with regex and returns all merge conflicts found separated by string.
 * Each element in the array represents a different version of the conflict.
 * The versions are split by pair of two naturally.
 *
 * @example ["1 this is the first version", "1 This is the second version"] - represents one verse conflict
 * @param {string} usfmData - usfm string to be searched for merge conflicts
 * @returns {[string]}
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

    regexMatchedMergeConflicts.forEach((match, groupIndex) => {
      allMergeConflictsFoundArray.push(match);
    });
  }
  /*
  * If there is an odd amount of total versions at least one version
  * is not matched with a corresponding version with different history
  */
  if (allMergeConflictsFoundArray.length % 2 !== 0) return console.error('Problem parsing merge conflicts');
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
  let parsedTextObject = usfmParser.toJSON(versionText);
  /**@example {['1', '2', '3']} */
  let verseNumbersArray = Object.keys(parsedTextObject);
  let verses = verseNumbersArray.length > 1 ?
    `${verseNumbersArray[0]}-${verseNumbersArray[verseNumbersArray.length - 1]}` :
    `${verseNumbersArray[0]}`;
  let entireUSFMObjectParsed = usfmParser.toJSON(usfmData);
  let chapter;
  //Determining the chaper the verse string is coming from
  for (var chapterNum in entireUSFMObjectParsed) {
    if (!parseInt(chapterNum)) continue;
    let chapterObject = entireUSFMObjectParsed[chapterNum];
    for (var verseNum in chapterObject) {
      let verseObject = chapterObject[verseNum];
      if (verseObject.includes(parsedTextObject[verseNumbersArray[0]])) {
        chapter = chapterNum;
      }
    }
  }
  return {
    chapter,
    verses,
    text: parsedTextObject
  }
}

/**
 * This method takes the chosen git history and uses it for merging the input usfm data
 * note: this function writes the merged data to the fs.
 * @param {object} mergeConflictsObject - Object to be parsed that contains the information
 * of the chosen text to merge
 * @param {string} projectSaveLocation - Path of the project
 * @param {object} manifest - Metadata of the project details
 */
export function merge(mergeConflictsObject, projectSaveLocation, manifest) {
  try {
    if (mergeConflictsObject.filePath) {
      let usfmData = fs.readFileSync(mergeConflictsObject.filePath).toString();
      for (var conflict of mergeConflictsObject.conflicts) {
        let chosenText;
        for (var version of conflict) {
          if (version.checked) {
            chosenText = version.text;
          }
        }
        let chosenTextUSFMString = usfmParser.toUSFM(chosenText);
        usfmData = usfmData.replace(replaceRegex, chosenTextUSFMString);
      }
      fs.outputFileSync(mergeConflictsObject.filePath, usfmData);
      let usfmProjectObject = ProjectSelectionHelpers.getProjectDetailsFromUSFM(mergeConflictsObject.filePath, projectSaveLocation);
      TargetLanguageActions.generateTargetBible(projectSaveLocation, usfmProjectObject.parsedUSFM, manifest);
    }
  } catch (e) { console.warn('Problem merging conflicts', e) }
}

/**
 * This method will take a tS project and convert it to a usfm file.
 * @param {string} projectSaveLocation - path to the project
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
            usfmData += text + '\n';
          }
        })
      }
    }
  } catch (e) { console.warn('Problem converting tS project to usfm, merge conflicts may have errors', e) }
  return usfmData;
}

/**
 * Determines whether or not there is usfm to parse for merge conflicts
 * and if there is return the data it contains
 * @param {string} usfmFilePath - path to the usfm file of the project, note this may not exist
 * @param {string} projectSaveLocation - path to the projects location
 * @returns {string}
 */
export function checkProjectForMergeConflicts(usfmFilePath, projectSaveLocation) {
  let usfmData;
  if (fs.existsSync(usfmFilePath)) { //is usfm file
    usfmData = fs.readFileSync(usfmFilePath).toString();
    if (!usfmData.includes('<<<<<<<'))  //usfm file does not contain merge conflicts
      return false;
  } else { //Not usfm file, checking for tS project
    try {
      usfmData = createUSFMFromTsProject(projectSaveLocation)
      if (!usfmData.includes('<<<<<<<'))
        return false; //A project thats not usfm and merge conflicts not detected
      /** Used for merging conflicts later, see MergeConflictHelpers.merge() */
      else fs.outputFileSync(usfmFilePath, usfmData);
    } catch (e) { console.warn('Problem getting merge conflicts', e) }
  }
  return usfmData;
}

/**
 * This method reads in all the chunks of a project, and determines if there is any merge conflicts.
 * @param {Array} projectChunks - An array of finished chunks, as defined by the manfest
 * @param {String} projectPath - The current save location of the project
 * @returns {Boolean} True if there is any merge conflicts, false if the project does not contain any
 */
export function projectHasMergeConflicts(projectPath, bookAbbr) {
  let currentFolderChapters = fs.readdirSync(Path.join(projectPath, bookAbbr));
  for (var currentChapterFile of currentFolderChapters) {
    let currentChapter = Path.parse(currentChapterFile).name;
    if (!parseInt(currentChapter)) continue;
    try {
      let currentChapterObject = fs.readJSONSync(Path.join(projectPath, bookAbbr, currentChapterFile));
      let fileContents = JSON.stringify(currentChapterObject);
      if (~fileContents.indexOf('<<<<<<<')) {
        return true;
      }
    } catch (e) { }
  }
  return false;
}
