import fs from 'fs-extra';
import path from 'path-extra';
import env from 'tc-electron-env';
import ResourceAPI from '../ResourceAPI';
// constants
const USER_RESOURCES_DIR = path.join(env.home(), 'translationCore/resources');

/**
 * Determines if a project is missing verses
 * @param {string} projectDir: the project directory
 * @param {string} bookAbbr: the abbreviation of the book name
 * @param {{}} expectedVerses: the authoritative list of verses that should be in the project
 * @return {{}} An object of missing verses
 */
export const getMissingVerses = (projectDir, bookAbbr, expectedVerses) => {
  let allMissingVerses = {};

  if (fs.existsSync(path.join(projectDir, bookAbbr))) {
    for (let chapterIndex = 1; chapterIndex <= expectedVerses.chapters; chapterIndex++) {
      let currentMissingVerses = [];
      let chapterJSONObject;

      try {
        chapterJSONObject = fs.readJSONSync(path.join(projectDir, bookAbbr, chapterIndex + '.json'));
      } catch (e) {
        //if chapter object not found, loop should still go through and check for verses
        //in order to detect all missing verses
        chapterJSONObject = {};
      }

      const verses = Object.keys(chapterJSONObject);

      for (let verseIndex = 1; verseIndex <= expectedVerses[chapterIndex]; verseIndex++) {
        let verse = chapterJSONObject[verseIndex];

        if (!verse) {
          // Is there a verse span?
          const verseSpanFound = verses.find((verseText) => {
            let result = '';

            if (typeof verseText == 'string') {
              let pattern = /^[0-9]+(-[0-9]+)+$/gm;
              let results = verseText.match(pattern);
              const result = results ? results[0] : null;
              let isBetween = false;

              if (result) {
                // Verses between starting and ending numbers of verse span
                const numbers = result.split('-');
                const number1 = parseInt(numbers[0]);
                const number2 = parseInt(numbers[1]);
                isBetween = number1 <= verseIndex && number2 >= verseIndex;
              }

              return typeof result == 'string' && isBetween;
            }

            return result;
          });

          if (!verseSpanFound) {
            currentMissingVerses.push(verseIndex);
          }
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
 * This method reads in all the chunks of a project, and determines if there are any missing verses
 * @param {String} usfmFilePath - The current save location of the project
 * @param {String} bookAbbr - Full name of the book
 * @returns {{}} Object of missing verses
 */
export function findMissingVerses(usfmFilePath, bookAbbr) {
  let expectedBookVerses = getExpectedBookVerses(bookAbbr);
  return getMissingVerses(usfmFilePath, bookAbbr, expectedBookVerses);
}

/**
 * Retrieves the authoritative list of verses in a book
 * @param {string} bookAbbr
 * @param {string} languageId
 * @param {string} bookName
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
