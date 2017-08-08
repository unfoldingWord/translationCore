import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import { getBibleIndex } from '../helpers/ResourcesHelpers';
// constant declarations
const IMPORTED_SOURCE_PATH = '.apps/translationCore/importedSource'

/**
 * @description loads a target langugae bible chapter from file system.
 * @param {string} chapterNumber - chapter number to be loaded to resources reducer.
 */
export function loadTargetLanguageChapter(chapterNumber) {
  return ((dispatch, getState) => {
    try {
      let projectDetailsReducer = getState().projectDetailsReducer;
      let bookAbbreviation = projectDetailsReducer.params.bookAbbr;
      let projectPath = projectDetailsReducer.projectSaveLocation;
      let targetBiblePath = path.join(projectPath, bookAbbreviation);
      let bibleName = "targetLanguage"
      let targetLanguageChapter;
      let fileName = chapterNumber + '.json';
      if (fs.existsSync(targetBiblePath, fileName)) {
        targetLanguageChapter = fs.readJsonSync(path.join(targetBiblePath, fileName));
      } else {
        console.log("Target Bible was not found in the project root folder");
      }
      let bibleData = {};
      bibleData[chapterNumber] = targetLanguageChapter;
      bibleData['manifest'] = fs.readJsonSync(path.join(targetBiblePath, "manifest.json"));
      dispatch({
        type: consts.ADD_NEW_BIBLE_TO_RESOURCES,
        bibleName,
        bibleData
      });
    } catch (err) {
      console.warn(err);
    }
  });
}

/**
 * @description generates a target language bible and saves it in the filesystem devided into chapters, assumes tS project
 * @param {string} projectPath - path where the project is located in the filesystem.
 * @param {object} USFMTargetLanguage - parsed JSON object of usfm target language for project
 */
export function generateTargetBible(projectPath, bookData = {}, manifest) {
  let bookAbbreviation = manifest.project.id;
  // only parse if bookData isn't already populated
  if (Object.keys(bookData).length == 0) {
    // get the bibleIndex to get the list of expected chapters
    const bibleIndex = getBibleIndex('en', 'ulb', 'v10');
    const chapters = Object.keys(bibleIndex[bookAbbreviation]);
    chapters.forEach(chapterNumber => {
      let chapterData = {}; // empty chapter to populate
      // 0 padding for single digit chapters
      const chapterNumberString = (chapterNumber < 10) ? '0' + chapterNumber.toString() : chapterNumber.toString();
      const chapterPath = path.join(projectPath, chapterNumberString);
      // the chapter may not be populated and there is a key called 'chapters' in the index
      const chapterPathExists = fs.existsSync(chapterPath);
      if (chapterPathExists) {
        const files = fs.readdirSync(chapterPath); // get the chunk files in the chapter path
        files.forEach(file => {
          if (file.match(/\d+.txt/)) { // only import chunk/verse files (digit based)
            const chunkPath = path.join(chapterPath, file);
            const text = fs.readFileSync(chunkPath);
            const currentChunk = parseTargetLanguage(text.toString());
            Object.keys(currentChunk.verses).forEach(function (key) {
              chapterData[key] = currentChunk.verses[key];
              bookData[parseInt(chapterNumber)] = chapterData;
            });
          }
        });
      }
    });
  }
  const targetBiblePath = path.join(projectPath, bookAbbreviation);
  // now that bookData is populated or passed in, let's save it to the fs as chapter level json files
  for (var chapter in bookData) {
    if (!parseInt(chapter)) continue; // only import integer based data, there are other files
    let fileName = chapter + '.json';
    const targetBiblePath = path.join(projectPath, bookAbbreviation);
    fs.outputJsonSync(path.join(targetBiblePath, fileName), bookData[chapter]);
  }
  // generating and saving manifest file for target language bible.
  generateTartgetLanguageManifest(manifest, targetBiblePath);
  // Move bible source files from project's root folder to '.apps/translationCore/importedSource'
  archiveSourceFiles(projectPath, bookAbbreviation);
}

/**
 * @description helper function that parses an usfm chunk and returns an object of verses.
 * @param {string} usfm - bible chunk.
 */
function parseTargetLanguage(usfm) {
  let chapData = {};
  let chapters = usfm.split("\\c ");
  for (let ch in chapters) {
    if (chapters[ch] === "") continue;
    if (/\\h /.exec(chapters[ch])) {
      chapData.header = chapters[ch];
    } else {
      let chapNum = "verses";
      chapData[chapNum] = {};
      let verses = chapters[ch].split("\\v ");
      for (let v in verses) {
        if (verses[v] === "") continue;
        let verseNum;
        try { // this should work the majority of the time
          [, verseNum] = /^(\d+)/.exec(verses[v]);
        } catch (e) {
          verseNum = "-1";
        }
        chapData[chapNum][verseNum] = verses[v].replace(/^\s*(\d+)\s*/, "");
      }
    }
  }
  return chapData;
}

/**
 * @description helper function to generate a manifest file for a target language bible.
 * @param {object} projectManifest - projects manifest file.
 * @param {string} targetBiblePath - path where the target language bible is saved in the file system.
 */
function generateTartgetLanguageManifest(projectManifest, targetBiblePath) {
  let bibleManifest = {};
  bibleManifest.language_id = projectManifest.target_language.id;
  bibleManifest.language_name = projectManifest.target_language.name;
  bibleManifest.direction = projectManifest.target_language.direction;
  bibleManifest.subject = "Bible";
  bibleManifest.resource_id = "targetLanguage";
  bibleManifest.resource_title = "";
  bibleManifest.description = "Target Language";
  // savings target language bible manifest file in project target language bible path.
  let fileName = "manifest.json";
  fs.outputJsonSync(path.join(targetBiblePath, fileName), bibleManifest);
}

/**
 * @description helper function that Moves bible source files from project's root folder to '.apps/translationCore/importedSource'.
 * @param {string} projectPath - project save location / path.
 * @param {string} bookAbbreviation - the directory name of the book so we don't move it
 */
function archiveSourceFiles(projectPath, bookAbbreviation) {
  // get all of the directories/files in the projectPath
  fs.readdirSync(projectPath)
    .forEach(file => {
      // check for conditions in which we need to archive
      const isDirectory = fs.lstatSync(path.join(projectPath, file)).isDirectory()
      const isBookAbbreviation = file === bookAbbreviation;
      const isDotFile = !!file.match(/^\./);
      const isUSFM = !!file.toLowerCase().match('.usfm') || !!file.toLowerCase().match('.sfm')
      // build the condition to move
      const shouldMove = isUSFM || (isDirectory && !isBookAbbreviation && !isDotFile);
      if (shouldMove) {
        const directory = file;
        const sourcePath = path.join(projectPath, directory);
        // try to move the directories and log the errors
        try {
          fs.moveSync(sourcePath, path.join(projectPath, IMPORTED_SOURCE_PATH, directory));
        } catch (err) {
          console.log(err);
        }
      }
    });
}
