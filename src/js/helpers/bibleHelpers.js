/* eslint-disable no-console */
import Path from 'path-extra';
import * as fs from 'fs-extra';
import BooksOfBible from '../../../static/data/BooksOfBible';
// helpers

const USER_RESOURCES_DIR = Path.join(Path.homedir(), 'translationCore/resources');

/**
 *
 * @param {string} bookAbbr - The book abbreviation to convert
 */
export function convertToFullBookName(bookAbbr) {
  if (!bookAbbr) return;
  return BooksOfBible[bookAbbr.toString().toLowerCase()];
}
/**
 *
 * @param {string} projectBook - Book abbreviation
 */
export function isOldTestament(projectBook) {
  var passedBook = false;
  for (var book in BooksOfBible) {
    if (book == projectBook) passedBook = true;
    if (BooksOfBible[book] == "Malachi" && passedBook) {
      return true;
    }
  }
  return false;
}
/**
 * This method reads in all the chunks of a project, and determines if there are any missing verses
 * @param {String} book - Full name of the book
 * @param {String} projectSaveLocation - The current save location of the project
 * @returns {Boolean} True if there is any missing verses, false if the project does not contain any
 */
export function projectIsMissingVerses(projectSaveLocation, bookAbbr) {
  try {
    let languageId = 'en';
    let indexLocation = Path.join(USER_RESOURCES_DIR, languageId, 'bibles', 'ulb', 'v10', 'index.json');
    let expectedVerses = fs.readJSONSync(indexLocation);
    let actualVersesObject = {};
    let currentFolderChapters = fs.readdirSync(Path.join(projectSaveLocation, bookAbbr));
    let chapterLength = 0;
    actualVersesObject = {};
    for (var currentChapterFile of currentFolderChapters) {
      let currentChapter = Path.parse(currentChapterFile).name;
      if (!parseInt(currentChapter)) continue;
      chapterLength++;
      let verseLength = 0;
      try {
        let currentChapterObject = fs.readJSONSync(Path.join(projectSaveLocation, bookAbbr, currentChapterFile));
        for (var verseIndex in currentChapterObject) {
          let verse = currentChapterObject[verseIndex];
          if (verse && verseIndex > 0) verseLength++;
        }
      } catch (e) { }
      actualVersesObject[currentChapter] = verseLength;
    }
    actualVersesObject.chapters = chapterLength;
    let currentExpectedVerese = expectedVerses[bookAbbr];
    return JSON.stringify(currentExpectedVerese) !== JSON.stringify(actualVersesObject);
  } catch (e) {
    console.warn('ulb index file not found missing verse detection is invalid. Please delete ~/translationCore/resources folder');
    return false;
  }
}
