/* eslint-disable no-console */
import Path from 'path-extra';
import * as fs from 'fs-extra';
import BooksOfBible from '../../../tC_resources/resources/books';

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
 * This checks if a project is missing verses.
 * @param projectDir
 * @param bookId
 * @param resourceDir
 * @return {boolean}
 */
export const isProjectMissingVerses = (projectDir, bookId, resourceDir) => {
    try {
        let languageId = 'en';
        let indexLocation = Path.join(resourceDir, languageId, 'bibles', 'ulb', 'v11', 'index.json');
        let expectedVerses = fs.readJSONSync(indexLocation);
        let actualVersesObject = {};
        let currentFolderChapters = fs.readdirSync(Path.join(projectDir, bookId));
        let chapterLength = 0;
        actualVersesObject = {};
        for (var currentChapterFile of currentFolderChapters) {
            let currentChapter = Path.parse(currentChapterFile).name;
            if (!parseInt(currentChapter)) continue;
            chapterLength++;
            let verseLength = 0;
            try {
                let currentChapterObject = fs.readJSONSync(Path.join(projectDir, bookId, currentChapterFile));
                for (var verseIndex in currentChapterObject) {
                    let verse = currentChapterObject[verseIndex];
                    if (verse && verseIndex > 0) verseLength++;
                }
            } catch (e) {
                console.warn(e);
            }
            actualVersesObject[currentChapter] = verseLength;
        }
        actualVersesObject.chapters = chapterLength;
        let currentExpectedVerese = expectedVerses[bookId];
        return JSON.stringify(currentExpectedVerese) !== JSON.stringify(actualVersesObject);
    } catch (e) {
        console.warn('ulb index file not found missing verse detection is invalid. Please delete ~/translationCore/resources folder');
        return false;
    }
};