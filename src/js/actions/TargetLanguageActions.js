import fs from 'fs-extra';
import path from 'path-extra';
import usfmjs from 'usfm-js';
// actions
import * as ResourcesActions from './ResourcesActions';
// helpers
import * as USFMHelpers from '../helpers/usfmHelpers';
import { getBibleIndex } from '../helpers/ResourcesHelpers';
import * as UsfmFileConversionHelpers from '../helpers/FileConversionHelpers/UsfmFileConversionHelpers';

// constants
const IMPORTED_SOURCE_PATH = '.apps/translationCore/importedSource';

/**
 * @description Loads a target language bible chapter from file system.
 * @param {String} chapterNumber - chapter number to be loaded to resources reducer.
 */
export function loadTargetLanguageChapter(chapterNumber) {
  return ((dispatch, getState) => {
      const {projectDetailsReducer} = getState();
      const bookAbbreviation = projectDetailsReducer.manifest.project.id;
      const projectPath = projectDetailsReducer.projectSaveLocation;
      const targetBiblePath = path.join(projectPath, bookAbbreviation);
      const resourceId = "targetLanguage";
      const bibleId = 'targetBible';
      let targetLanguageChapter;
      const fileName = chapterNumber + '.json';
      if (fs.existsSync(path.join(targetBiblePath, fileName))) {
        targetLanguageChapter = fs.readJsonSync(path.join(targetBiblePath, fileName));
      } else {
         console.log("Target Bible was not found in the project root folder");
         return;
      }
      let bibleData = {};
      bibleData[chapterNumber] = targetLanguageChapter;
      if (fs.existsSync(path.join(targetBiblePath, "manifest.json"))) {
      bibleData['manifest'] = fs.readJsonSync(path.join(targetBiblePath, "manifest.json"));
      dispatch(ResourcesActions.addNewBible(resourceId, bibleId, bibleData));
    }
  });
}

export function generateTargetBibleFromUSFMPath(usfmFilePath, projectPath, manifest) {
  try {
    let usfmFile;
    let parsedUSFM;
    const filename = path.basename(usfmFilePath);
    usfmFilePath = fs.existsSync(usfmFilePath) ? usfmFilePath : path.join(projectPath, filename);
    if (fs.existsSync(usfmFilePath)) {
      usfmFile = fs.readFileSync(usfmFilePath).toString();
      parsedUSFM = USFMHelpers.getParsedUSFM(usfmFile);
    } else {
      console.warn('USFM not found');
      return;
    }
    const { chapters } = parsedUSFM;
    let targetBible = {};
    Object.keys(chapters).forEach((chapterNumber)=>{
      const chapterObject = chapters[chapterNumber];
      targetBible[chapterNumber] = {};
      Object.keys(chapterObject).forEach((verseNumber)=>{
        const verseData = chapterObject[verseNumber];
        targetBible[chapterNumber][verseNumber] = UsfmFileConversionHelpers.getUsfmForVerseContent(verseData);
      });
    });
    saveTargetBible(projectPath, manifest, targetBible);
  } catch (error) {
    console.warn('USFM not found');
    console.log(error);
  }
}

/**
 * write headers to headers.json removing some duplicated tags
 * @param targetBiblePath
 * @param headers
 */
const saveHeaders = function (targetBiblePath, headers) {
  if (headers) {
    if (typeof headers === 'string') {
      const json = usfmjs.toJSON(headers);
      headers = json.headers;
    }
    if (headers) {
      fs.outputJsonSync(path.join(targetBiblePath, 'headers.json'), headers);
    }
  }
};

/**
 * @description generates a target language bible and saves it in the filesystem devided into chapters, assumes tS project
 * @param {string} projectPath - path where the project is located in the filesystem.
 * @param {object} manifest
 * @param {object} bookData - data to save
 * @param {object|String} headers - header data to save
 */
function saveTargetBible(projectPath, manifest, bookData, headers) {
  let bookAbbreviation = manifest.project.id;
  const targetBiblePath = path.join(projectPath, bookAbbreviation);
  // now that bookData is populated or passed in, let's save it to the fs as chapter level json files
  for (let chapter in bookData) {
    if (!parseInt(chapter)) continue; // only import integer based data, there are other files
    let fileName = chapter + '.json';
    const targetBiblePath = path.join(projectPath, bookAbbreviation);
    fs.outputJsonSync(path.join(targetBiblePath, fileName), bookData[chapter]);
  }
  saveHeaders(targetBiblePath, headers);
  // generating and saving manifest file for target language bible.
  generateTartgetLanguageManifest(manifest, targetBiblePath);
  // Move bible source files from project's root folder to '.apps/translationCore/importedSource'
  archiveSourceFiles(projectPath, bookAbbreviation);
}

/**
 * determines file sequence to be handled for tstudio.  Files ['title.txt','sub-title.txt','intro.txt'] are moved to front
 *      in that order.  Files ['reference.txt','summary.txt'] are moved to back in that order.  Numerical file names
 *      are left in numerical sequence, and anything else becomes a -1.
 * @param {String} fileName - file name to order
 * @return {number}
 */
const getReadOrderForTstudioFIles = function (fileName) {
  let order = parseInt(fileName);
  if (isNaN(order)) {
    const part = fileName.toLowerCase().split('.');
    switch (part[0]) {
      case 'intro':
        order = -101;
        break;

      case 'title':
        order = -100;
        break;

      case 'sub-title':
        order = -99;
        break;

      case 'reference':
        order = 99999;
        break;

      case 'summary':
        order = 99999;
        break;

      default:
        order = -1;
    }
  }
  return order;
};

/**
 * sorts files to be handled for tstudio.  Files ['title.txt','sub-title.txt','intro.txt'] are moved to front
 *      in that order.  Files ['reference.txt','summary.txt'] are moved to back in that order.  Numerical file names
 *      are left in numerical sequence, and anything else becomes a -1 (after intro and before numbers).
 * @param {array} files to order
 * @return {array} files in order
 */
const sortFilesByTstudioReadOrder = function (files) {
  const newOrder = files.sort((a, b) => {
    let orderA = getReadOrderForTstudioFIles(a);
    let orderB = getReadOrderForTstudioFIles(b);
    return orderA - orderB;
  });
  return newOrder;
};

/**
 * extracts verses from chunk
 * @param chapterPath
 * @param file
 * @param chunkVerseNumber
 * @param chapterNumber
 * @param chapterData
 * @param bookData
 */
const extractVersesFromChunk = function (chapterPath, file, chunkVerseNumber, chapterNumber, chapterData, bookData) {
  const chunkPath = path.join(chapterPath, file);
  let text = fs.readFileSync(chunkPath).toString();
  const hasChapters = text.includes('\\c ');
  if (!text.includes('\\v')) {
    text = `\\v ${chunkVerseNumber} ` + text;
  }
  const currentChunk = usfmjs.toJSON(text, {chunk: !hasChapters});

  if (currentChunk && currentChunk.chapters[chapterNumber]) {
    const chapter = currentChunk.chapters[chapterNumber];
    Object.keys(chapter).forEach((key) => {
      chapterData[key] = UsfmFileConversionHelpers.getUsfmForVerseContent(chapter[key]);
      bookData[parseInt(chapterNumber)] = chapterData;
    });
  } else if (currentChunk && currentChunk.verses) {
    Object.keys(currentChunk.verses).forEach((key) => {
      chapterData[key] = UsfmFileConversionHelpers.getUsfmForVerseContent(currentChunk.verses[key]);
      bookData[parseInt(chapterNumber)] = chapterData;
    });
  }
};

/**
 * add front matter file to header
 * @param {String} chapter
 * @param {Array} files in folder
 * @param {String} chapterPath
 * @param {String} header initial value
 * @return {String} updated header
 */
const addFrontMatter = function (chapter, files, chapterPath, header) {
  if ((parseInt(chapter) === 0) || (chapter.toLowerCase() === 'front')) {
    files.forEach(file => {
      const parts = path.parse(file);
      if (parts.ext === '.txt') {
        const filePath = path.join(chapterPath, file);
        let text = fs.readFileSync(filePath).toString();
        switch (parts.name) {
          case 'title':
            text = "\\toc1 " + text;
            break;

          case 'reference':
            text = "\\cd " + text;
            break;
        }
        if (text) {
          header += text + '\n';
        }
      }
    });
  }
  return header;
};

/**
 * add front matter for chapter
 * @param chapterPath
 * @param file
 * @param chapterData
 * @param bookData
 * @param chapterNumber
 */
const addChapterFrontMatter = function(chapterPath, file, chapterData, bookData, chapterNumber) {
  const parts = path.parse(file);
  if (parts.ext === '.txt') {
    if (!chapterData[0]) {
      chapterData[0] = '';
      bookData[parseInt(chapterNumber)] = chapterData;
    }
    const chunkPath = path.join(chapterPath, file);
    let text = fs.readFileSync(chunkPath).toString();

    switch (parts.name) {
      case 'title':
        text = "\\cl " + text;
        break;

      case 'reference':
        text = "\\cd " + text;
        break;
    }
    if (text) {
      chapterData[0] += text + '\n';
    }
  }
};

export function generateTargetBibleFromProjectPath(projectPath, manifest) {
  let bookData = {};
  // get the bibleIndex to get the list of expected chapters
  const bibleIndex = getBibleIndex('en', 'ulb');
  if(!bibleIndex[manifest.project.id]) {
    console.warn(`Invalid book key ${manifest.project.id}. Expected a book of the Bible.`);
    return;
  }
  let header = '';
  const chapters = Object.keys(bibleIndex[manifest.project.id]);
  chapters.unshift( 'front', '0' ); // check for front matter folders
  chapters.forEach(chapter => {
    let chapterData = {}; // empty chapter to populate
    // 0 padding for single digit chapters
    let chapterNumberString = chapter;
    if ( chapter !== 'front') {
      chapterNumberString = (chapter < 10) ? '0' + chapter.toString() : chapter.toString();
    }
    let chapterPath = path.join(projectPath, chapterNumberString);
    // the chapter may not be populated and there is a key called 'chapters' in the index
    let chapterPathExists = fs.existsSync(chapterPath);
    if (!chapterPathExists) { // try again with another leading 0
      chapterNumberString = '0' + chapterNumberString;
      chapterPath = path.join(projectPath, chapterNumberString);
      chapterPathExists = fs.existsSync(chapterPath);
    }
    if (chapterPathExists) {
      let files = fs.readdirSync(chapterPath); // get the chunk files in the chapter path
      if(files) {
        const chapterNumber = parseInt(chapter);
        files = sortFilesByTstudioReadOrder(files);
        if ((chapterNumber === 0) || isNaN(chapterNumber)) {
          header = addFrontMatter(chapter, files, chapterPath, header);
        } else {
          files.forEach(file => {
            let chunkFileNumber = file.match(/(\d+).txt/) || [""];
            if (chunkFileNumber[1]) { // only import chunk/verse files (digit based)
              let chunkVerseNumber = parseInt(chunkFileNumber[1]);
              if (chunkVerseNumber > 0) {
                extractVersesFromChunk(chapterPath, file, chunkVerseNumber, chapter, chapterData, bookData);
              } else { // found 00.txt
                // do old chapter front matter
                addChapterFrontMatter(chapterPath, file, chapterData, bookData, chapterNumber);
              }
            } else {
              // do chapter front matter
              addChapterFrontMatter(chapterPath, file, chapterData, bookData, chapterNumber);
            }
          });
        }
      }
    }
  });
  saveTargetBible(projectPath, manifest, bookData, header);
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
      const isDirectory = fs.lstatSync(path.join(projectPath, file)).isDirectory();
      const isBookAbbreviation = file === bookAbbreviation;
      const isDotFile = !!file.match(/^\./);
      const isUSFM = !!file.toLowerCase().match('.usfm') || !!file.toLowerCase().match('.sfm');
      // build the condition to move
      const shouldMove = isUSFM || (isDirectory && !isBookAbbreviation && !isDotFile);
      if (shouldMove) {
        const directory = file;
        const sourcePath = path.join(projectPath, directory);
        // try to move the directories and log the errors
        try {
          let targetPath = path.join(projectPath, IMPORTED_SOURCE_PATH, directory);
          if (!fs.existsSync(targetPath))
            fs.moveSync(sourcePath, targetPath);
        } catch (err) {
          console.log(err);
        }
      }
    });
}
