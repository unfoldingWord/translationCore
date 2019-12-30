/* eslint-disable no-console */
import Path from 'path-extra';
import fs from 'fs-extra';
import * as Bible from '../common/BooksOfTheBible';
import BooksOfBible from '../../../tcResources/books';
import ResourceAPI from './ResourceAPI';

/**
 *
 * @param {string} bookAbbr - The book abbreviation to convert
 */
export function convertToFullBookName(bookAbbr) {
  if (!bookAbbr) {
    return;
  }
  return BooksOfBible[bookAbbr.toString().toLowerCase()];
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
 * get highest int value from string array
 * @param {Array} array
 * @return {number} highest value or -1 if no numeric values found
 */
export function getHighestValueFromStrArray(array) {
  const arrayValues = array.map((item) => { // convert to int
    const value = parseInt(item, 10);
    return isNaN(value) ? -1 : value;
  }).sort((a, b) => (a-b));
  const highestValue = arrayValues.length > 0 ? arrayValues[arrayValues.length - 1] : -1;
  return highestValue;
}

/**
 * get verse count index object (chapters of verse counts)
 * @param {Object} initialIndex
 * @return {boolean}
 */
export function getVerseCountIndex(initialIndex) {
  const chapters = getHighestValueFromStrArray(Object.keys(initialIndex));
  const index = {};

  for (let chapter = 1; chapter <= chapters; chapter++) {
    let currentExpectedVersesInChapter = initialIndex[chapter];

    if (currentExpectedVersesInChapter) {
      const isObject = typeof currentExpectedVersesInChapter !== 'number';

      if (isObject) {
        currentExpectedVersesInChapter = getHighestValueFromStrArray(Object.keys(currentExpectedVersesInChapter));
      }
    } else {
      currentExpectedVersesInChapter = 0;
    }
    index[chapter] = currentExpectedVersesInChapter;
  }
  index.chapters = chapters;
  return index;
}

/**
 * get verse counts for each chapter in target project
 * @param {String} projectDir
 * @param {String} bookId
 * @return {{}}
 */
export function getTargetVerseCountIndex(projectDir, bookId) {
  const actualIndex = {};
  const currentFolderChapters = fs.readdirSync(Path.join(projectDir, bookId));
  let chapterLength = 0;
  let missingVerses = false;

  for (let currentChapterFile of currentFolderChapters) {
    let currentChapter = Path.parse(currentChapterFile).name;

    if (!parseInt(currentChapter)) {
      continue;
    }
    chapterLength++;
    let verseLength = 0;
    let currentChapterObject;

    try {
      currentChapterObject = fs.readJSONSync(
        Path.join(projectDir, bookId, currentChapterFile)
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

    const highestVerse = currentChapterObject ? getHighestValueFromStrArray(Object.keys(currentChapterObject)) : 0;
    missingVerses = missingVerses || (verseLength !== highestVerse);
    actualIndex[currentChapter] = highestVerse;
  }

  const highestChapter = getHighestValueFromStrArray(Object.keys(actualIndex));
  missingVerses = missingVerses || (chapterLength !== highestChapter);
  actualIndex.chapters = highestChapter;
  return { actualIndex, missingVerses };
}

/**
 * get verse counts for each chapter in original language
 * @param {String} bookId
 * @param resourceDir
 * @return {{}}
 */
export function getOriginalLanguageVerseCountIndex(bookId, resourceDir) {
  const { languageId, bibleId } = getOrigLangforBook(bookId);
  const resourcePath = Path.join(resourceDir, languageId, 'bibles', bibleId);
  const versionPath = ResourceAPI.getLatestVersion(resourcePath) || resourcePath;
  const indexLocation = Path.join(versionPath, 'index.json');
  const expectedVerses = fs.readJSONSync(indexLocation);
  const expectedIndex = getVerseCountIndex(expectedVerses[bookId]);
  return expectedIndex;
}

/**
 * get superset of verse counts between target language project and original language
 * @param {String} projectDir
 * @param {String} bookId
 * @param {String} resourceDir
 * @return {Object}
 */
export const getProjectVerseCounts = (projectDir, bookId, resourceDir) => {
  const { actualIndex: targetIndex } = getTargetVerseCountIndex(projectDir, bookId);
  const originalIndex = getOriginalLanguageVerseCountIndex(bookId, resourceDir);
  const chapterCounts = Math.max(targetIndex.chapters, originalIndex.chapters);

  // merge verse counts
  for (let chapter = 1; chapter <= chapterCounts; chapter++) {
    const targetHasChapter = targetIndex.includes(chapter);
    const originalHasChapter = originalIndex.includes(chapter);

    if (targetHasChapter) {
      if (originalHasChapter) {
        targetIndex[chapter] = Math.max(targetIndex[chapter], originalIndex[chapter]); // use the greater count
      }
    } else if (originalHasChapter) {
      targetIndex[chapter] = originalIndex[chapter]; // copy over original since missing in target
    }
  }
  return targetIndex;
};

/**
 * This checks if a project is missing verses.
 * @param {String} projectDir
 * @param {String} bookId
 * @param {String} resourceDir
 * @return {boolean}
 */
export const isProjectMissingVerses = (projectDir, bookId, resourceDir) => {
  try {
    const { actualIndex, missingVerses } = getTargetVerseCountIndex(projectDir, bookId);

    if (missingVerses) {
      return true;
    }

    const expectedIndex = getOriginalLanguageVerseCountIndex(bookId, resourceDir);
    return (
      JSON.stringify(expectedIndex) !==
      JSON.stringify(actualIndex)
    );
  } catch (e) {
    console.warn(
      'ult index file not found missing verse detection is invalid. Please delete ~/translationCore/resources folder'
    );
    return false;
  }
};
