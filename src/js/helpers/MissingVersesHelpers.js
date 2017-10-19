import * as fs from 'fs-extra';
import path from 'path-extra';
const USER_RESOURCES_DIR = path.join(path.homedir(), 'translationCore/resources');

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
            } catch(e) {
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
            if (currentMissingVerses.length > 0) allMissingVerses[chapterIndex] = currentMissingVerses;
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
 * @param bookAbbr
 * @return {*}
 */
export function getExpectedBookVerses(bookAbbr) {
  let languageId = 'en';
  let indexLocation = path.join(USER_RESOURCES_DIR, languageId, 'bibles', 'ulb', 'v11', 'index.json');
  let expectedVersesBooks = fs.readJSONSync(indexLocation);
  return expectedVersesBooks[bookAbbr];
}