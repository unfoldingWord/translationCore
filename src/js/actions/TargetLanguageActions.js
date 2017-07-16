import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import {getBibleIndex} from '../helpers/ResourcesHelpers';
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
      if (fs.existsSync(targetBiblePath)) {
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
 * @description generates a target language bible and saves it in the filesystem devided into chapters.
 * @param {string} projectPath - path where the project is located in the filesystem.
 * @param {object} USFMTargetLanguage - parsed JSON object of usfm target language for project
 */
export function generateTargetBible(projectPath, bookData = {}) {
  return ((dispatch, getState) => {
    const state = getState();
    const bookAbbreviation = state.projectDetailsReducer.params.bookAbbr;
    /** USFMTargetLanguage is already parsed in the same format */
    if (Object.keys(bookData).length == 0) {
      const bibleIndex = getBibleIndex('ulb-en', 'v6');
      const chapters = Object.keys(bibleIndex[bookAbbreviation]);
      chapters.forEach( chapterNumber => {
        let chapterData = {};
        const chapterNumberString = (chapterNumber < 10) ? '0' + chapterNumber.toString() : chapterNumber.toString();
        const chapterPath = path.join(projectPath, chapterNumberString);
        const chapterPathExists = fs.existsSync(chapterPath);
        if (chapterPathExists) {
          const files = fs.readdirSync(chapterPath);
          files.forEach( file => {
            if (file.match(/\d+.txt/)) {
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
    const manifest = state.projectDetailsReducer.manifest;
    const targetBiblePath = path.join(projectPath, bookAbbreviation);
    debugger
    for (var chapter in bookData) {
      if (!parseInt(chapter)) continue;
      let fileName = chapter + '.json';
      const targetBiblePath = path.join(projectPath, bookAbbreviation);
      fs.outputJsonSync(path.join(targetBiblePath, fileName), bookData[chapter]);
    }
    // generating and saving manifest file for target language bible.
    generateTartgetLanguageManifest(manifest, targetBiblePath);
    // Move bible source files from project's root folder to '.apps/translationCore/importedSource'
    archiveSourceFiles(projectPath, bookAbbreviation);
  });
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
  fs.readdirSync(projectPath)
    // make sure it is a directory and a chapter number
    .forEach( file => {
      const isDirectory = fs.lstatSync(path.join(projectPath, file)).isDirectory()
      const isBookAbbreviation = file === bookAbbreviation;
      const isDotFile = !!file.match(/^\./);
      const isUSFM = !!file.toLowerCase().match('.usfm') || !!file.toLowerCase().match('.sfm')
      const shouldMove = isUSFM || (isDirectory && !isBookAbbreviation && !isDotFile);
      if (shouldMove) {
        const directory = file;
        const sourcePath = path.join(projectPath, directory);
        try {
          fs.moveSync(sourcePath, path.join(projectPath, IMPORTED_SOURCE_PATH, directory));
        } catch (err) {
          console.log(err);
        }
      }
    });
}
