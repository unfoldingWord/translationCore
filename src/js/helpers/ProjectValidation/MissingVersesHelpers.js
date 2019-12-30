import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import ResourceAPI from '../ResourceAPI';
import * as BibleHelpers from '../bibleHelpers';
// constants
const USER_RESOURCES_DIR = path.join(ospath.home(), 'translationCore/resources');

/**
 * returns chapter count - if index already has a chapter count we use that, otherwise we
 *  return highest chapter number
 * @param {Object} bookIndex
 * @return {*}
 */
export function getChapters(bookIndex) {
  let chapterCount = 0;

  if (bookIndex) {
    if (bookIndex.chapters) {
      chapterCount = bookIndex.chapters;
    } else { // chapter count not saved, get highest chapter number
      const chapters = Object.keys(bookIndex).sort();

      for (let i = chapters.length-1; i >= 0; i--) { // reverse search
        const chapter = chapters[i];
        const chapterNum = parseInt(chapter, 10);

        if (chapterNum > chapterCount) { // will skip any values that are not numbers
          chapterCount = chapterNum;
          break;
        }
      }
    }
  }
  return chapterCount;
}

/**
 * Determines if a project is missing verses
 * @param {string} projectDir: the project directory
 * @param {string} bookAbbr: the abbreviation of the book name
 * @param {{}} expectedVerses: the authoritative list of chapter/verses that should be in the project
 * @return {{}} An object of missing verses
 */
export const getMissingVerses = (projectDir, bookAbbr, expectedVerses) => {
  let allMissingVerses = {};

  if (fs.existsSync(path.join(projectDir, bookAbbr))) {
    for (let chapterIndex = 1; chapterIndex <= getChapters(expectedVerses); chapterIndex++) {
      let currentMissingVerses = [];
      let chapterJSONObject;

      try {
        chapterJSONObject = fs.readJSONSync(path.join(projectDir, bookAbbr, chapterIndex + '.json'));
      } catch (e) {
        //if chapter object not found, loop should still go through and check for verses
        //in order to detect all missing verses
        chapterJSONObject = {};
      }

      for (let verseIndex = 1; verseIndex <= expectedVerses[chapterIndex]; verseIndex++) {
        let verse = chapterJSONObject[verseIndex];

        if (!verse) {
          currentMissingVerses.push(verseIndex);
        }
      }

      if (currentMissingVerses.length > 0) {
        allMissingVerses[chapterIndex] = currentMissingVerses;
      }
    }
  }
  return allMissingVerses;
};

/**
 * get index of expected chapter/verses for book from original language
 * @param {Object} bookAbbr
 * @return {{}|null}
 */
export function getExpectedBookIndex(bookAbbr) {
  const { languageId, bibleId } = BibleHelpers.getOrigLangforBook(bookAbbr);
  let expectedBookVerses = getExpectedBookVerses(bookAbbr, languageId, bibleId);
  return expectedBookVerses;
}

/**
 * This method reads in all the chunks of a project, and determines if there are any missing verses
 * @param {String} usfmFilePath - The current save location of the project
 * @param {String} bookAbbr - Full name of the book
 * @returns {{}} Object of missing verses
 */
export function findMissingVerses(usfmFilePath, bookAbbr) {
  const expectedBookVerses = getExpectedBookIndex(bookAbbr);
  return getMissingVerses(usfmFilePath, bookAbbr, expectedBookVerses);
}

/**
 * Retrieves the authoritative list of verses in a book
 * @param {string} bookAbbr
 * @param {string} languageId
 * @param {string} bookName - actually id of bible
 * @param {string} optional version, if null then get latest
 * @return {Object} verses in book
 */
export function getExpectedBookVerses(bookAbbr, languageId = 'en', bookName = 'ult', version = null) {
  let indexLocation;

  if (version) {
    indexLocation = path.join(USER_RESOURCES_DIR, languageId, 'bibles', bookName, version, 'index.json');
  } else {
    let versionPath = ResourceAPI.getLatestVersion(path.join(USER_RESOURCES_DIR, languageId, 'bibles', bookName));

    if (versionPath === null) { // if failed, return nothing
      return {};
    }
    indexLocation = path.join(versionPath, 'index.json');
  }

  let expectedVersesBooks = null;

  if (fs.existsSync(indexLocation)) {
    expectedVersesBooks = fs.readJSONSync(indexLocation);
  }
  return expectedVersesBooks ? expectedVersesBooks[bookAbbr] : null;
}
