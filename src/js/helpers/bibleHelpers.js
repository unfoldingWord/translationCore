/* eslint-disable no-console */
import Path from 'path-extra';
import fs from 'fs-extra';
import BooksOfBible from '../../../tC_resources/resources/books';
import {getLatestVersionInPath} from "./ResourcesHelpers";

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
    if (BooksOfBible[book] == 'Malachi' && passedBook) {
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
    const resourcePath = Path.join(resourceDir, languageId, 'bibles', 'ulb');
    const versionPath = getLatestVersionInPath(resourcePath);
    const indexLocation = Path.join(versionPath, 'index.json');
    const expectedVerses = fs.readJSONSync(indexLocation);
    const actualVersesObject = {};
    const currentFolderChapters = fs.readdirSync(Path.join(projectDir, bookId));
    let chapterLength = 0;
    for (let currentChapterFile of currentFolderChapters) {
      let currentChapter = Path.parse(currentChapterFile).name;
      if (!parseInt(currentChapter)) continue;
      chapterLength++;
      let verseLength = 0;
      try {
        let currentChapterObject = fs.readJSONSync(
          Path.join(projectDir, bookId, currentChapterFile)
        );
        for (let verseIndex in currentChapterObject) {
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
    return (
      JSON.stringify(currentExpectedVerese) !==
      JSON.stringify(actualVersesObject)
    );
  } catch (e) {
    console.warn(
      'ulb index file not found missing verse detection is invalid. Please delete ~/translationCore/resources folder'
    );
    return false;
  }
};
