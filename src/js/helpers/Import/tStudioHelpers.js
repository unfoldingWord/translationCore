/* eslint-disable default-case */
/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import usfmjs from 'usfm-js';
// helpers
import * as UsfmFileConversionHelpers from '../FileConversionHelpers/UsfmFileConversionHelpers';

/**
 * read tstudio files to extract chapter data
 * @param {string} chapter
 * @param {string} projectPath
 * @param {string} header - previous header data
 * @param {object} bookData
 * @return {string} updated header data
 */
export function processChapter(chapter, projectPath, header, bookData) {
  let chapterData = {}; // empty chapter to populate
  // 0 padding for single digit chapters
  let chapterNumberString = chapter;

  if (chapter !== 'front') {
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

    if (files) {
      const chapterNumber = parseInt(chapter);
      files = sortFilesByTstudioReadOrder(files);

      if ((chapterNumber === 0) || isNaN(chapterNumber)) {
        header = addFrontMatter(chapter, files, chapterPath, header);
      } else {
        files.forEach(file => {
          let chunkFileNumber = file.match(/(\d+).txt/) || [''];

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
  return header;
}

/**
 * determines file sequence to be handled for tstudio.  Files ['title.txt','sub-title.txt','intro.txt'] are moved to front
 *      in that order.  Files ['reference.txt','summary.txt'] are moved to back in that order.  Numerical file names
 *      are left in numerical sequence, and anything else becomes a -1.
 * @param {String} fileName - file name to order
 * @return {number}
 */
function getReadOrderForTstudioFIles(fileName) {
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
}

/**
 * sorts files to be handled for tstudio.  Files ['title.txt','sub-title.txt','intro.txt'] are moved to front
 *      in that order.  Files ['reference.txt','summary.txt'] are moved to back in that order.  Numerical file names
 *      are left in numerical sequence, and anything else becomes a -1 (after intro and before numbers).
 * @param {array} files to order
 * @return {array} files in order
 */
function sortFilesByTstudioReadOrder(files) {
  const newOrder = files.sort((a, b) => {
    let orderA = getReadOrderForTstudioFIles(a);
    let orderB = getReadOrderForTstudioFIles(b);
    return orderA - orderB;
  });
  return newOrder;
}

/**
 * extracts verses from chunk
 * @param chapterPath
 * @param file
 * @param chunkVerseNumber
 * @param chapterNumber
 * @param chapterData
 * @param bookData
 */
function extractVersesFromChunk(chapterPath, file, chunkVerseNumber, chapterNumber, chapterData, bookData) {
  const chunkPath = path.join(chapterPath, file);
  let text = fs.readFileSync(chunkPath).toString();
  const hasChapters = text.includes('\\c ');

  if (!text.includes('\\v')) {
    text = `\\v ${chunkVerseNumber} ` + text;
  }

  const currentChunk = usfmjs.toJSON(text, { chunk: !hasChapters });

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
}

/**
 * add front matter file to header
 * @param {String} chapter
 * @param {Array} files in folder
 * @param {String} chapterPath
 * @param {String} header initial value
 * @return {String} updated header
 */
function addFrontMatter(chapter, files, chapterPath, header) {
  if ((parseInt(chapter) === 0) || (chapter.toLowerCase() === 'front')) {
    files.forEach(file => {
      const parts = path.parse(file);

      if (parts.ext === '.txt') {
        const filePath = path.join(chapterPath, file);
        let text = fs.readFileSync(filePath).toString();

        switch (parts.name) {
        case 'title':
          text = '\\toc1 ' + text;
          break;

        case 'reference':
          text = '\\cd ' + text;
          break;
        }

        if (text) {
          header += text + '\n';
        }
      }
    });
  }
  return header;
}

/**
 * add front matter for chapter
 * @param chapterPath
 * @param file
 * @param chapterData
 * @param bookData
 * @param chapterNumber
 */
function addChapterFrontMatter(chapterPath, file, chapterData, bookData, chapterNumber) {
  const parts = path.parse(file);

  if (parts.ext === '.txt') {
    if (!chapterData['front']) {
      chapterData['front'] = '';
      bookData[parseInt(chapterNumber)] = chapterData;
    }

    const chunkPath = path.join(chapterPath, file);
    let text = fs.readFileSync(chunkPath).toString();

    switch (parts.name) {
    case 'title':
      text = '\\cl ' + text;
      break;

    case 'reference':
      text = '\\cd ' + text;
      break;
    }

    if (text) {
      chapterData['front'] += text + '\n';
    }
  }
}

