import path from 'path-extra';
import fs from 'fs-extra';
import { referenceHelpers } from 'bible-reference-range';
import { toInt } from 'tsv-groupdata-parser/lib/tsvToGroupData';
import {
  DEFAULT_OWNER,
  USER_RESOURCES_PATH,
} from '../common/constants';
import { getProjectManifest, saveProjectManifest } from './ProjectMigration/manifestUtils';
import * as ResourcesHelpers from './ResourcesHelpers';
import ResourceAPI from './ResourceAPI';
import * as BibleHelpers from './bibleHelpers';

const ignoreFields = [ 'tag', 'type', 'text' ];

/**
 * extract words from wordlist
 * @param {array} wordList
 * @param {array} verseObjects
 */
function arrayToWordList(wordList, verseObjects) {
  if (Array.isArray(verseObjects)) {
    for (const item of verseObjects) {
      if ((item?.type === 'word') && item.text) {
        const newWord = {};

        for (const key of Object.keys(item)) {
          if (!ignoreFields.includes(key)) {
            newWord[key] = item[key];
          }
        }
        newWord.word = item.text;
        wordList.push(newWord);
      } else {
        if (item?.children) {
          arrayToWordList(wordList, item?.children);
        }
      }
    }
  }
}

/**
 * find occurrence and occurrences for word at pos in wordList
 * @param {string} word
 * @param {number} pos
 * @param {array} wordList
 * @returns {{occurrences: number, occurrence: number}}
 */
function getOccurrencesForWord(word, pos, wordList) {
  let occurrence = 0;
  let occurrences = 0;

  for (let i = 0, l = wordList.length; i < l; i ++) {
    const item = wordList[i];

    if (item.word === word) {
      if (i <= pos) {
        occurrence++;
      }
      occurrences++;
    }
  }
  return { occurrence, occurrences };
}

/**
 * calculate the occurrence and occurrences for each word in verse
 * @param {array} wordList
 */
function getOccurrencesForWordList(wordList) {
  for (let i = 0, l = wordList.length; i < l; i ++) {
    const item = wordList[i];
    const { occurrence, occurrences } = getOccurrencesForWord(item.word, i, wordList);
    item.occurrence = occurrence;
    item.occurrences = occurrences;
  }
}

/**
 * get the word list for the original language in the format used by alignment data
 @param {array} verseObjects
 * @returns {*[]}
 */
function getOriginalLanguageListForVerseData(verseObjects) {
  const wordList = [];
  arrayToWordList(wordList, verseObjects);
  getOccurrencesForWordList(wordList);
  return wordList;
}

/**
 * get the word list for the original language in the format used by alignment data
 * @param {object} chapterJson
 * @param {string|number} verse
 * @returns {*[]}
 */
export function getOrigLangWordListForVerse(chapterJson, verse) {
  const verseObjects = chapterJson?.[verse]?.verseObjects;
  return getOriginalLanguageListForVerseData(verseObjects);
}

/**
 * get the word list for the aligned original words
 * @param {object} chapterJson
 * @param {string|number} verse
 * @returns {*[]}
 */
export function getAlignedWordListForVerse(chapterJson, verse) {
  const wordList = [];
  const alignments = chapterJson?.[verse]?.alignments || [];

  for (const alignment of alignments) {
    for (const topWord of alignment.topWords) {
      topWord.unmatched = true;

      if (alignment.bottomWords.length) { // this is a data bug, if there are no bottom words, this is not an alignment so skip word
        wordList.push(topWord);
      }
    }
  }

  return wordList;
}

/**
 * update the attributes for the aligned words from latest original language words
 * @param {array} originalLangWordList
 * @param {array} alignmentsWordList
 * @return {boolean} true if verse attributes updated
 */
function updateAlignedWordsFromOriginalWordList(originalLangWordList, alignmentsWordList) {
  let changed = false;

  for (const origWord of originalLangWordList) {
    const found = alignmentsWordList.find(item => (item.word === origWord.word) && (item.occurrence === origWord.occurrence) && (item.occurrences === origWord.occurrences));

    if (found) {
      const keys = Object.keys(origWord);

      for (const key of keys) {
        if (found[key] !== origWord[key]) {
          found[key] = origWord[key]; // update attribute
          changed = true;
        }
      }
      delete found.unmatched;
    }
  }

  return changed;
}

/**
 * remove aligned words no longer in original language
 * @param {array} alignmentsChapter
 * @param {string|number} verse
 */
function removeExtraWordsFromAlignments(alignmentsChapter, verse) {
  const alignments = alignmentsChapter?.[verse]?.alignments || [];
  const toRemove = [];

  for (let j = 0, l = alignments.length; j < l; j++) {
    const alignment = alignments[j];
    let topWords = alignment.topWords;

    for (let i = 0; i < topWords.length; i++) {
      const topWord = topWords[i];

      if (topWord.unmatched || !alignment.bottomWords.length) { // remove extra word or unaligned word
        topWords.splice(i, 1);
        i--;
      }
    }

    if (!topWords.length) { // if empty, remove alignment
      toRemove.push(j);
    }
  }

  if (toRemove.length) {
    for (let j = toRemove.length - 1; j >= 0; j--) {
      const removeIdx = toRemove[j];
      alignments.splice(removeIdx, 1);
    }
  }
}

/**
 * check if verseRef is a verse span
 * @param verseRef
 * @return {*|boolean}
 */
function isValidVerseSpan(verseRef) {
  return referenceHelpers.isVerseSpan(verseRef) && !isNaN(referenceHelpers.toInt(verseRef));
}

/**
 * get all verses included in verse range
 * @param {string} verseRef - number to look up
 * @param {object} chapterData
 * @return {null|{verseObjects: *[]}}
 */
function getVersesForSpan(verseRef, chapterData) {
  // coerce to look like a book so we can use library call
  const chapter = 1;
  const bookData = { [chapter]: chapterData };
  const ref = `${chapter}:${verseRef}`;
  const verses = referenceHelpers.getVerses(bookData, ref);

  if (verses?.length) {
    let verseData = [];

    for (const verse_ of verses) {
      if (verse_.verseData?.verseObjects) {
        Array.prototype.push.apply(verseData, verse_.verseData.verseObjects);
      }
    }
    return { verseObjects: verseData };
  }
  return null;
}

/**
 * finds best match for verse
 * @param {object} originalLangChapter
 * @param {object} alignmentsChapter
 * @param {string|number} verse
 */
export function getBestMatchForVerse(originalLangChapter, alignmentsChapter, verse) {
  let verse_ = null;
  let originalLangWordList = null;
  let alignmentsWordList = null;

  if (originalLangChapter?.[verse]?.verseObjects?.length && alignmentsChapter?.[verse]?.alignments?.length) {
    verse_ = verse; // exact match is best
    originalLangWordList = getOrigLangWordListForVerse(originalLangChapter, verse);
    alignmentsWordList = getAlignedWordListForVerse(alignmentsChapter, verse);
  } else if (isValidVerseSpan(verse)) {
    const verseData = getVersesForSpan(verse, originalLangChapter);

    if (verseData) {
      alignmentsWordList = getAlignedWordListForVerse(alignmentsChapter, verse);

      if (alignmentsWordList?.length) {
        originalLangWordList = getOriginalLanguageListForVerseData(verseData?.verseObjects);
        verse_ = verse;
      }
    }
  }

  return {
    verse: verse_,
    originalLangWordList,
    alignmentsWordList,
  };
}

/**
 * get the aligned word attributes for verse from latest original language
 * @param {Object} originalLangChapter
 * @param {Object} alignmentsChapter
 * @param {string|number} verse
 * @return {boolean} true if verse attributes updated
 */
export function updateAlignedWordsFromOriginalForVerse(originalLangChapter, alignmentsChapter, verse) {
  let changed = false;
  const {
    verse: verse_,
    originalLangWordList,
    alignmentsWordList,
  } = getBestMatchForVerse(originalLangChapter, alignmentsChapter, verse);

  if (originalLangWordList?.length && alignmentsWordList?.length) {
    const changed_ = updateAlignedWordsFromOriginalWordList(originalLangWordList, alignmentsWordList);
    changed = changed || changed_;

    if (alignmentsChapter?.[verse_]?.alignments) {
      // clear word bank so it will be regenerated
      alignmentsChapter[verse_].wordBank = [];
      removeExtraWordsFromAlignments(alignmentsChapter, verse_);
    }
  }
  return changed;
}

/**
 * for a chapter update the aligned word attributes for verse from latest original language
 * @param {Object} originalLangChapter
 * @param {Object} alignmentsChapter
 * @return {array} list of verses that had attributes changed
 */
export function updateAlignedWordAttribFromOriginalForChapter(originalLangChapter, alignmentsChapter) {
  const changedVerses = [];
  const verses = Object.keys(alignmentsChapter);

  for (const verse of verses) {
    const changed = updateAlignedWordsFromOriginalForVerse(originalLangChapter, alignmentsChapter, verse);

    if (changed) {
      changedVerses.push(verse);
    }
  }
  return changedVerses;
}

/**
 * read from manifest the current GL owner and from that get the original language owner
 * @param {string} manifest
 * @return {{owner: (*|string), version: *}}
 */
export function getCurrentOrigLanguageVersionOwner(manifest) {
  const waOwner = manifest?.toolsSelectedOwners?.wordAlignment || DEFAULT_OWNER;
  const owner = ResourcesHelpers.getOriginalLangOwner(waOwner);
  const version = manifest?.tc_orig_lang_wordAlignment || null;
  return { owner, version };
}

/**
 * generate path to the latest original language
 * @param {string} bookId
 * @param {string} owner
 * @param {string} resourcesPath
 * @return {string}
 */
function getLatestVersionPath(bookId, owner, resourcesPath = USER_RESOURCES_PATH) {
  const { languageId: olLanguageID, bibleId: olBibleId } = BibleHelpers.getOrigLangforBook(bookId);
  const latestVersionPath = ResourceAPI.getLatestVersion(path.join(resourcesPath, olLanguageID, 'bibles', olBibleId), owner);
  return latestVersionPath;
}

/**
 * get the manifest for the latest original language
 * @param {string} bookId
 * @param {string} owner
 * @param {string} resourcesPath
 * @return {*}
 */
export function getLatestBibleVersionManifest(bookId, owner, resourcesPath = USER_RESOURCES_PATH) {
  const latestVersionPath = getLatestVersionPath(bookId, owner, resourcesPath);
  const manifest = getProjectManifest(latestVersionPath) || null;
  return manifest;
}

/**
 * check manifests to see if latest original language is different than project
 * @param {Object|null} projectManifest
 * @param {Object|null} latestOrigLangManifest
 * @return {{owner: (String|null), latestOrigLangManifest: {}, latestVersion: (String|null), version: (String|null), changed: boolean, projectManifest: {}}}
 */
export function hasOriginalLanguageChangedSub(projectManifest, latestOrigLangManifest) {
  const { owner, version } = getCurrentOrigLanguageVersionOwner(projectManifest);
  const latestVersion = latestOrigLangManifest?.version || null;
  // check for changes after doing some sanity checks
  const changed = !!(projectManifest && latestVersion && version !== latestVersion);
  return {
    changed,
    owner,
    version,
    latestVersion,
    latestOrigLangManifest,
    projectManifest,
  };
}

/**
 * check to see if latest original language is different than project
 * @param {String} projectPath
 * @param {String} bookId
 * @param {String} resourcesPath
 * @return {{owner: (String|null), latestOrigLangManifest: {}, latestVersion: (String|null), version: (String|null), changed: boolean, projectManifest: {}}}
 */
export function hasOriginalLanguageChanged(projectPath, bookId, resourcesPath = USER_RESOURCES_PATH) {
  const projectManifest = getProjectManifest(projectPath);
  const { owner } = getCurrentOrigLanguageVersionOwner(projectManifest);
  const latestOrigLangManifest = getLatestBibleVersionManifest(bookId, owner, resourcesPath);
  const results = hasOriginalLanguageChangedSub(projectManifest, latestOrigLangManifest);
  return results;
}

/**
 * read the latest original language for the owner and book
 * @param {string} bookId
 * @param {string} owner
 * @param {string} resourcesPath
 * @return {{}}
 */
export function getLatestOriginalLanguageResource(bookId, owner, resourcesPath = USER_RESOURCES_PATH) {
  const resourcePath = getLatestVersionPath(bookId, owner, resourcesPath);
  const resourceBookPath = path.join(resourcePath, bookId);
  const files = ResourcesHelpers.getFilesInResourcePath(resourceBookPath, '.json');
  const origBook = {};

  if (files?.length) {
    for (const file of files) {
      const filePath = path.join(resourceBookPath, file);

      if (fs.existsSync(filePath)) {
        const chapter = toInt(file);
        origBook[chapter] = fs.readJsonSync(filePath);
      }
    }
  }

  return origBook;
}

/**
 * generate the path to the alignment data for a project
 * @param {string} projectPath
 * @param {string} bookId
 * @return {*}
 */
function getAlignmentDataPath(projectPath, bookId) {
  const alignmentDataPath = path.join(projectPath, '.apps', 'translationCore', 'alignmentData', bookId);
  return alignmentDataPath;
}

/**
 * get current alignments for a project
 * @param {string} bookId
 * @param {string} projectPath
 * @return {{}}
 */
export function getProjectAlignments(bookId, projectPath) {
  const alignmentDataPath = getAlignmentDataPath(projectPath, bookId);
  const files = ResourcesHelpers.getFilesInResourcePath(alignmentDataPath, '.json');
  const origBook = {};

  if (files?.length) {
    for (const file of files) {
      const filePath = path.join(alignmentDataPath, file);

      if (fs.existsSync(filePath)) {
        const chapter = toInt(file);
        origBook[chapter] = fs.readJsonSync(filePath);
      }
    }
  }

  return origBook;
}

/**
 * for a book update the aligned word attributes for verse from latest original language
 * @param {object} origBook
 * @param {object} alignments
 * @param {string} bookID
 * @return {{}}
 */
export function updateAlignedWordAttribFromOriginalForBook(origBook, alignments, bookID) {
  const changedChapters = {};

  if (origBook) {
    const chapters = Object.keys(origBook);

    for (const chapter of chapters) {
      const originalLangChapter = origBook[chapter];
      const alignmentsChapter = alignments[chapter];

      if (originalLangChapter && alignmentsChapter) {
        const changes = updateAlignedWordAttribFromOriginalForChapter(originalLangChapter, alignmentsChapter);

        if (changes?.length) {
          changedChapters[chapter] = changes;
        }
      } else {
        console.log(`updateAlignedWordsFromOriginalForBook(${bookID}) - missing chapter ${chapter} data OriginalLang = ${!!originalLangChapter}, alignments = ${alignmentsChapter}`);
      }
    }
  }
  return changedChapters;
}

/**
 * for a project, load alignments for project and original language for GL. Then update the aligned word attributes for
 *   verse from latest original language
 * @param {string} projectPath
 * @param {string} bookId
 * @param {string} resourcesPath
 * @return {{}}
 */
export function updateAlignedWordsFromOrigLanguage(projectPath, bookId, resourcesPath = USER_RESOURCES_PATH) {
  const results = hasOriginalLanguageChanged(projectPath, bookId, resourcesPath);
  const origBook = getLatestOriginalLanguageResource(bookId, results.owner, resourcesPath);
  const alignments = getProjectAlignments(bookId, projectPath);
  const chapterChanges = updateAlignedWordAttribFromOriginalForBook(origBook, alignments, bookId);

  if (Object.keys(chapterChanges).length) { // save changes
    console.log(`updateAlignedWordsFromOrigLanguage(${projectPath}) - updates made in refs:`, chapterChanges);

    // update project manifest
    const manifest = results.projectManifest;
    manifest.tc_orig_lang_wordAlignment = results.latestVersion;

    if (!manifest.toolsSelectedOwners) {
      manifest.toolsSelectedOwners = {};
    }

    manifest.toolsSelectedOwners.wordAlignment = results.owner;
    saveProjectManifest(projectPath, manifest);

    const alignmentDataPath = getAlignmentDataPath(projectPath, bookId);
    const chapters = Object.keys(alignments);

    for (const chapter of chapters) {
      const filePath = path.join(alignmentDataPath, `${chapter}.json`);
      fs.outputJsonSync(filePath, alignments[chapter]);
    }
    console.log(`updateAlignedWordsFromOrigLanguage(${projectPath}) - Original Language Version changed from ${results.version} to  ${results.latestVersion}`);
  } else {
    console.log(`updateAlignedWordsFromOrigLanguage(${projectPath}) - NO updates NEEDED`);
  }

  return chapterChanges;
}
