import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// constant declarations
const IMPORTED_SOURCE_PATH = '.apps/translationCore/importedSource'

/**
 * @description loads a target langugae bible chapter from file system.
 * @param {string} chapterNumber - chapter number to be loaded to resources reducer.
 */
export function loadTargetLanguageChapter(chapterNumber) {
  return ((dispatch, getState) => {
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
    dispatch({
      type: consts.ADD_NEW_BIBLE_TO_RESOURCES,
      bibleName,
      bibleData
    })
  });
}

export function generateAndLoadTargetLangBible(projectPath) {
  return ((dispatch, getState) => {
    let bookAbbreviation = getState().projectDetailsReducer.params.bookAbbr;
    let targetBiblePath = path.join(projectPath, bookAbbreviation);
    generateTargetBible(getState, projectPath, targetBiblePath);
    dispatch(loadTargetLanguageChapter('1'));
  })
}

/**
 * @description generates a target language bible saves it in the filesystem devided into chapters.
 */
function generateTargetBible(getState, projectPath, targetBiblePath) {
  let manifest = getState().projectDetailsReducer.manifest;
  let entireBook = {};
  let joinedChunk = {};
  let finishedChunks = getState().projectDetailsReducer.unparsedFinishedChunks;
  finishedChunks.forEach((element, index) => {
    let reference = element.split('-');
    let chapterNumber = reference[0];
    let fileName = reference[1] + ".txt";
    let text = fs.readFileSync(path.join(projectPath, chapterNumber, fileName));
    let currentChunk = parseTargetLanguage(text.toString());
    Object.keys(currentChunk.verses).forEach(function(key) {
      if(parseInt(key) === 1) joinedChunk = {};
      joinedChunk[key] = currentChunk.verses[key];
      entireBook[parseInt(chapterNumber)] = joinedChunk;
    });
  });
  for (var chapter in entireBook) {
    let fileName = chapter + '.json';
    fs.outputJsonSync(path.join(targetBiblePath, fileName), entireBook[chapter]);
  }
  // Move bible source files from project's root folder to '.apps/translationCore/importedSource'
  archiveSourceFiles(finishedChunks, projectPath);
}

/**
 * @description parses an usfm chunk and returns an object of verses.
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
 * @description Moves bible source files from project's root folder to '.apps/translationCore/importedSource'.
 * @param {array} finishedChunks - list of all finished chunks.
 * @param {string} projectPath - project save location / path.
 */
function archiveSourceFiles(finishedChunks, projectPath) {
  finishedChunks.forEach((element, index) => {
    let reference = element.split('-');
    let chapterNumber = reference[0];
    let sourcePath = path.join(projectPath, chapterNumber);
    try {
      fs.moveSync(sourcePath, path.join(projectPath, IMPORTED_SOURCE_PATH, chapterNumber));
    } catch(err) {
    }
  });
}
