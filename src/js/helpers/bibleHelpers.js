/* eslint-disable no-console */
import Path from 'path-extra';
import fs from 'fs-extra';
import * as Bible from '../common/BooksOfTheBible';
import ResourceAPI from './ResourceAPI';

/**
 *
 * @param {string} bookAbbr - The book abbreviation to convert
 */
export function convertToFullBookName(bookAbbr) {
  if (!bookAbbr) {
    return;
  }
  return Bible.ALL_BIBLE_BOOKS[bookAbbr.toString().toLowerCase()];
}

/**
 * tests if book is a Old Testament book
 * @param bookId
 * @return {boolean}
 */
export function isOldTestament(bookId) {
  return bookId in Bible.BIBLE_BOOKS.oldTestament;
}

/**
 * tests if book is a New Testament book
 * @param bookId
 * @return {boolean}
 */
export function isNewTestament(bookId) {
  return bookId in Bible.BIBLE_BOOKS.newTestament;
}

/**
 * tests if book is in Old or New Testament
 * @param bookId
 * @return {boolean}
 */
export function isValidBibleBook(bookId) {
  return (isNewTestament(bookId) || isOldTestament(bookId)) ;
}

/**
 * returns true if this bookId and languageId match the original language bible
 * @param {String} languageId
 * @param {String} bookId
 * @return {boolean}
 */
export function isOriginalLanguageBible(languageId, bookId) {
  return ((languageId.toLowerCase() === Bible.NT_ORIG_LANG && bookId.toLowerCase() === Bible.NT_ORIG_LANG_BIBLE) ||
    (languageId.toLowerCase() === Bible.OT_ORIG_LANG && bookId.toLowerCase() === Bible.OT_ORIG_LANG_BIBLE));
}

/**
 * returns true if this bookId and languageId match the original language bible
 * @param {String} languageId
 * @return {boolean}
 */
export function isOriginalLanguage(languageId) {
  return (languageId.toLowerCase() === Bible.NT_ORIG_LANG || languageId.toLowerCase() === Bible.OT_ORIG_LANG);
}

/**
 * determine Original Language and Original Language bible for book
 * @param bookId
 * @return {{resourceLanguage: string, bibleID: string}}
 */
export function getOrigLangforBook(bookId) {
  const isOT = isOldTestament(bookId);
  const languageId = (isOT) ? Bible.OT_ORIG_LANG : Bible.NT_ORIG_LANG;
  const bibleId = (isOT) ? Bible.OT_ORIG_LANG_BIBLE : Bible.NT_ORIG_LANG_BIBLE;
  return { languageId, bibleId };
}

/**
 * This checks if a project is missing verses.
 * @param projectDir
 * @param bookId
 * @param resourceDir
 * @return {boolean}
 */
export const isProjectMissingVerses = (projectDir, bookId, resourceDir) => {
  try {
    let languageId = 'en';
    const resourcePath = Path.join(resourceDir, languageId, 'bibles', 'ult');
    const versionPath = ResourceAPI.getLatestVersion(resourcePath) || resourcePath;
    const indexLocation = Path.join(versionPath, 'index.json');
    const expectedVerses = fs.readJSONSync(indexLocation);
    const actualVersesObject = {};
    const currentFolderChapters = fs.readdirSync(Path.join(projectDir, bookId));
    let chapterLength = 0;

    for (let currentChapterFile of currentFolderChapters) {
      let currentChapter = Path.parse(currentChapterFile).name;

      if (!parseInt(currentChapter)) {
        continue;
      }
      chapterLength++;
      let verseLength = 0;

      try {
        let currentChapterObject = fs.readJSONSync(
          Path.join(projectDir, bookId, currentChapterFile),
        );

        for (let verseIndex in currentChapterObject) {
          let verse = currentChapterObject[verseIndex];

          if (verse && verseIndex > 0) {
            verseLength++;
          }
        }
      } catch (e) {
        console.warn(e);
      }
      actualVersesObject[currentChapter] = verseLength;
    }
    actualVersesObject.chapters = chapterLength;
    let currentExpectedVerese = expectedVerses[bookId];
    return (
      JSON.stringify(currentExpectedVerese) !==
      JSON.stringify(actualVersesObject)
    );
  } catch (e) {
    console.warn(
      'ult index file not found missing verse detection is invalid. Please delete ~/translationCore/resources folder',
    );
    return false;
  }
};
