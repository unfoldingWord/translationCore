import * as fs from 'fs-extra';
import path from 'Path-extra';
const USER_RESOURCES_DIR = path.join(path.homedir(), 'translationCore/resources');

/**
 * This method reads in all the chunks of a project, and determines if there are any missing verses
 * @param {String} book - Full name of the book
 * @param {String} projectSaveLocation - The current save location of the project
 * @returns {Boolean} True if there is any missing verses, false if the project does not contain any
 */
export function findMissingVerses(projectSaveLocation, bookAbbr) {
  try {
    debugger;
    let languageId = 'en';
    let indexLocation = path.join(USER_RESOURCES_DIR, languageId, 'bibles', 'ulb', 'v10', 'index.json');
    let expectedVerses = fs.readJSONSync(indexLocation);
    let actualVersesObject = {};
    if (fs.pathExistsSync(path.join(projectSaveLocation, bookAbbr))) {
      let currentFolderChapters = fs.readdirSync(path.join(projectSaveLocation, bookAbbr));
      let chapterLength = 0;
      actualVersesObject = {};
      for (var currentChapterFile of currentFolderChapters) {
        let currentChapter = path.parse(currentChapterFile).name;
        if (!parseInt(currentChapter)) continue;
        chapterLength++;
        let verseLength = 0;
        try {
          let currentChapterObject = fs.readJSONSync(path.join(projectSaveLocation, bookAbbr, currentChapterFile));
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
    } else {
      return false
    }
  } catch (e) {
    debugger;
    console.warn('ulb index file not found missing verse detection is invalid. Please delete ~/translationCore/resources folder');
    return false;
  }
}