import fs from 'fs-extra';
import path from 'path-extra';
import isEqual from 'deep-equal';
import { STATIC_RESOURCES_PATH } from '../common/constants';
import { getTranslation } from './localizationHelpers';
import ResourceAPI from './ResourceAPI';

function createGroupItem(bookId, chapter, verse, toolName) {
  return {
    'contextId': {
      'reference': {
        'bookId': bookId,
        'chapter': chapter,
        'verse': verse,
      },
      'tool': toolName,
      'groupId': 'chapter_' + chapter,
    },
  };
}

/**
 * TODO: should this use the user's resources in the home dir instead of the static resources?
 * @description - Auto generate the chapter group data since more projects will use it
 * @param {String} bookId - id of the current book
 * @param {String} toolName - id of the current tool
 * @param {String} bookDataDir - if given, use chapter data to identify verse spans
 */
export const generateChapterGroupData = (bookId, toolName, bookDataDir) => {
  let groupsData = [];
  let ultPath = path.join(STATIC_RESOURCES_PATH, 'en', 'bibles', 'ult');
  let versionPath = ResourceAPI.getLatestVersion(ultPath) || ultPath;
  const ultIndexPath = path.join(versionPath, 'index.json');

  if (fs.existsSync(ultIndexPath)) { // make sure it doesn't crash if the path doesn't exist
    const ultIndex = fs.readJsonSync(ultIndexPath); // the index of book/chapter/verses
    const bookData = ultIndex[bookId]; // get the data in the index for the current book

    groupsData = Array(bookData.chapters).fill().map((_, i) => { // create array from number of chapters
      const chapter = i + 1; // index is 0 based, so add one for chapter number
      const verses = bookData[chapter]; // get the number of verses in the chapter
      return Array(verses).fill().map((_, i) => { // turn number of verses into array
        const verse = i + 1; // index is 0 based, so add one for verse number
        return createGroupItem(bookId, chapter, verse, toolName);
      });
    });

    if (bookDataDir) {
      // look for verse spans in book data
      for (let chapter = 1; chapter < bookData.chapters; chapter++) {
        const chapterJson = fs.readJsonSync(path.join(bookDataDir, `${chapter}.json`));

        if (chapterJson) {
          const chapterData = groupsData[chapter-1];
          const verses = Object.keys(chapterJson);

          for (let verse of verses) {
            if (verse.includes('-')) {
              // found verse span
              let [low, high] = verse.split('-');
              low = parseInt(low);
              high = parseInt(high);

              for (let i = low; i <= high; i++) {
                const idx = chapterData.findIndex(item => (item.contextId.reference.verse === i));

                if (idx >= 0) {
                  if (i === low) {
                    // replace with verse span
                    chapterData[idx] = createGroupItem(bookId, chapter, verse, toolName);
                  } else {
                    // remove
                    chapterData.splice(idx, 1);
                  }
                }
              }
              groupsData[chapter-1] = chapterData;
            }
          }
        }
      }
    }
  }
  return groupsData;
};

/**
 * Generates a chapter-based group index.
 * Most tools will use a chapter based-index.
 * TODO: do not localize the group name here. Instead localize it as needed. See todo on {@link loadProjectGroupIndex}
 * @param {function} translate - the locale function
 * @param {number} [numChapters=150] - the number of chapters to generate
 * @return {*}
 */
export const generateChapterGroupIndex = (translate, numChapters = 150) => {
  const chapterLocalized = getTranslation(translate, 'tools.chapter',
    'Chapter');
  return Array(numChapters).fill().map((_, i) => {
    let chapter = i + 1;
    return {
      id: 'chapter_' + chapter,
      name: chapterLocalized + ' ' + chapter,
    };
  });
};

/**
 * Reads the latest unique checks from the directory.
 * @param {string} dir - directory where check data is saved.
 * @return {array} - array of the most recent check data
 */
export function readLatestChecks(dir) {
  let checks = [];

  if (!fs.existsSync(dir)) {
    return [];
  }

  // list sorted json files - most recents are in front of list
  const files = fs.readdirSync(dir).filter(file => path.extname(file) === '.json').sort().reverse();

  for (let i = 0, len = files.length; i < len; i ++) {
    const checkPath = path.join(dir, files[i]);

    try {
      const data = fs.readJsonSync(checkPath);

      if (isCheckUnique(data, checks)) {
        checks.push(data);
      }
    } catch (err) {
      console.error(`Check data could not be loaded from ${checkPath}`, err);
    }
  }

  return checks;
}

/**
 * Evaluates whether a check has already been loaded
 * @param {object} checkData - the json check data
 * @param {array} loadedChecks - an array of loaded unique checks
 * @returns {boolean} - true if the check has not been loaded yet.
 */
export function isCheckUnique(checkData, loadedChecks) {
  const checkContextId = checkData.contextId;

  if (checkContextId) {
    for (const check of loadedChecks) {
      const quoteCondition = Array.isArray(check.contextId.quote) ?
        isEqual(check.contextId.quote, checkContextId.quote) : check.contextId.quote === checkContextId.quote;

      if (check.contextId && check.contextId.groupId === checkContextId.groupId &&
          quoteCondition && check.contextId.occurrence === checkContextId.occurrence) {
        return false;
      }
    }
    return true;
  }
  throw new Error('Invalid check data, missing contextId');
}
