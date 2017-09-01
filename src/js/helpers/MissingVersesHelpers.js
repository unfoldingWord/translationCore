import * as fs from 'fs-extra';
import path from 'path-extra';
const USER_RESOURCES_DIR = path.join(path.homedir(), 'translationCore/resources');

/**
 * This method reads in all the chunks of a project, and determines if there are any missing verses
 * @param {String} book - Full name of the book
 * @param {String} projectSaveLocation - The current save location of the project
 * @returns {{}} Object of missing verses
 */
export function findMissingVerses(projectSaveLocation, bookAbbr) {
  let expectedBookVerses = getExpectedBookVerses(bookAbbr);
  let allMissingVerses = {};
  if (fs.existsSync(path.join(projectSaveLocation, bookAbbr))) {
    for (var chapterIndex = 1; chapterIndex <= expectedBookVerses.chapters; chapterIndex++) {
      let currentMissingVerses = [];
      let chapterJSONObject;
      try {
        chapterJSONObject = fs.readJSONSync(path.join(projectSaveLocation, bookAbbr, chapterIndex + '.json'));
      } catch(e){
        //if chpater object not found, loop should still go through and check for verses
        //in order to detect all missing verses
        chapterJSONObject = {};
      }
      for (var verseIndex = 1; verseIndex <= expectedBookVerses[chapterIndex]; verseIndex++) {
        let verse = chapterJSONObject[verseIndex];
        if (!verse) {
          currentMissingVerses.push(verseIndex);
        }
      }
      if (currentMissingVerses.length > 0) allMissingVerses[chapterIndex] = currentMissingVerses;
    }

  }
  return allMissingVerses;
}

export function getExpectedBookVerses(bookAbbr) {
  let languageId = 'en';
  let indexLocation = path.join(USER_RESOURCES_DIR, languageId, 'bibles', 'ulb', 'v10', 'index.json');
  let expectedVersesBooks = fs.readJSONSync(indexLocation);
  return expectedVersesBooks[bookAbbr];
}