import path from 'path-extra';
import fs from 'fs-extra';
import { normalizer } from 'string-punctuation-tokenizer';
import { referenceHelpers } from 'bible-reference-range';
import { toInt } from 'tsv-groupdata-parser/lib/tsvToGroupData';
import {
  DEFAULT_OWNER,
  USER_RESOURCES_PATH,
} from '../common/constants';
import * as ProjectDetailsActions from '../actions/ProjectDetailsActions';
import { getProjectManifest } from '../selectors';
import * as manifestUtils from './ProjectMigration/manifestUtils';
import * as ResourcesHelpers from './ResourcesHelpers';
import ResourceAPI from './ResourceAPI';
import * as BibleHelpers from './bibleHelpers';

const ignoreFields = [ 'tag', 'type', 'text' ];
const ignoreOrig = [ 'tw' ];

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
 * @returns {object[]}
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
 * @param {string|number} verseRef
 * @returns {object[]}
 */
export function getOrigLangWordListForVerse(chapterJson, verseRef) {
  const verseObjects = chapterJson?.[verseRef]?.verseObjects;
  return getOriginalLanguageListForVerseData(verseObjects);
}

/**
 * get the word list for the aligned original words
 * @param {object} chapterJson
 * @param {string|number} verseRef
 * @returns {object[]}
 */
export function getAlignedWordListForVerse(chapterJson, verseRef) {
  const wordList = [];
  const alignments = chapterJson?.[verseRef]?.alignments || [];

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
 * normalize word by doing unicode normalization, converting to lower case, and then fixing the trailing accent
 * @param {string} word
 * @return {{string}}
 */
function normalize(word) {
  let word_ = normalizer(word || '');
  word_ = word_.toLowerCase();

  if (word_.length) {
    const lastCharPos = word_.length - 1;
    const lastChar = word_[lastCharPos];

    if (lastChar === ResourcesHelpers.QUOTE_MARK) { // handle invalid accent at end of word
      word_ = word_.substring(0, lastCharPos) + '\u02BC';
    }
  }

  return word_;
}

/**
 * iterate through the word list normalizing words and then fixing occurrences using the normalized word text
 * @param {array} originalWordList - list of words to normalize
 * @param {array} normalOrig - array to populate with normalized words
 */
function normalizeList(originalWordList, normalOrig) {
  for (const origWord of originalWordList) {
    const origWord_ = { // shallow copy
      ...origWord,
      word: normalize(origWord.word),
    };
    normalOrig.push(origWord_);
  }
  getOccurrencesForWordList(normalOrig);
}

/**
 * update the attributes for the aligned words from latest original language words
 * @param {array} originalLangWordList
 * @param {array} alignmentsWordList
 * @return {boolean} true if verse attributes updated
 */
function updateAlignedWordsFromOriginalWordList(originalLangWordList, alignmentsWordList) {
  let changed = false;
  let normalOrig = []; // an array to keep normalized original words
  let normalAlign = []; // an array to keep normalized aligned words

  for (let i = 0, l = alignmentsWordList.length; i < l; i++) {
    const alignedWord = alignmentsWordList[i];
    let foundOrig = originalLangWordList.find(item => (item.word === alignedWord.word) && (item.occurrence === alignedWord.occurrence) && (item.occurrences === alignedWord.occurrences));

    if (!foundOrig) { // fall back to normalized matching
      if (!normalOrig.length) { // if not initialized
        normalizeList(originalLangWordList, normalOrig);
        normalizeList(alignmentsWordList, normalAlign);
      }

      const normalWord = normalAlign[i];
      const foundPos = normalOrig.findIndex(item => (item.word === normalWord.word) && (item.occurrence === normalWord.occurrence) && (item.occurrences === normalWord.occurrences));

      if (foundPos >= 0) {
        foundOrig = originalLangWordList[foundPos];
      }
    }

    if (foundOrig) {
      const keys = Object.keys(foundOrig);

      for (const key of keys) {
        if (ignoreOrig.includes(key)) {
          continue; // skip over ignored keys
        }

        if (foundOrig[key] !== alignedWord[key]) {
          alignedWord[key] = foundOrig[key]; // update attribute
          changed = true;
        }
      }
      delete alignedWord.unmatched;
    }
  }

  return changed;
}

/**
 * remove aligned words no longer in original language
 * @param {array} alignmentsChapter
 * @param {string|number} verseRef
 * @return {boolean} true if extra word found
 */
function removeExtraWordsFromAlignments(alignmentsChapter, verseRef) {
  const alignments = alignmentsChapter?.[verseRef]?.alignments || [];
  const toRemove = [];
  let extraWordFound = false;

  for (let j = 0, l = alignments.length; j < l; j++) {
    const alignment = alignments[j];
    let topWords = alignment.topWords;

    for (let i = 0; i < topWords.length; i++) {
      const topWord = topWords[i];

      if (topWord.unmatched || !alignment.bottomWords.length) { // remove extra word or unaligned word
        topWords.splice(i, 1);
        i--;

        if (topWord.unmatched) {
          extraWordFound = true;
        }
      }
    }

    if (!topWords.length) { // if empty, remove alignment
      toRemove.push(j);
    }
  }

  if (toRemove.length) {
    for (let j = toRemove.length - 1; j >= 0; j--) { // reverse order so remaining indices not messed up by removals
      const removeIdx = toRemove[j];
      alignments.splice(removeIdx, 1);
    }
  }

  return { extraWordFound, emptyAlignmentsFound: !!toRemove.length };
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
 * @return {null|{verseObjects: object[]}}
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
 * finds best match for verseRef of original language and alignments
 * @param {object} originalLangChapter
 * @param {object} alignmentsChapter
 * @param {string|number} verseRef
 */
export function getBestMatchForVerse(originalLangChapter, alignmentsChapter, verseRef) {
  let verse_ = null;
  let originalLangWordList = null;
  let alignmentsWordList = null;

  if (originalLangChapter?.[verseRef]?.verseObjects?.length && alignmentsChapter?.[verseRef]?.alignments?.length) {
    verse_ = verseRef; // exact match is best
    originalLangWordList = getOrigLangWordListForVerse(originalLangChapter, verseRef);
    alignmentsWordList = getAlignedWordListForVerse(alignmentsChapter, verseRef);
  } else if (isValidVerseSpan(verseRef)) {
    const verseData = getVersesForSpan(verseRef, originalLangChapter);

    if (verseData) {
      alignmentsWordList = getAlignedWordListForVerse(alignmentsChapter, verseRef);

      if (alignmentsWordList?.length) {
        originalLangWordList = getOriginalLanguageListForVerseData(verseData?.verseObjects);
        verse_ = verseRef;
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
 * if flag is true, increment and return count
 * @param {number} count
 * @param {boolean} flag
 * @return {number} new count
 */
function increment(count, flag) {
  if (flag) {
    count++;
  }
  return count;
}

/**
 * get the aligned word attributes for verse from latest original language
 * @param {Object} originalLangChapter
 * @param {Object} alignmentsChapter
 * @param {string|number} verse
 * @return {{removedExtraWords: number, emptyAlignments: number, changed: number}}
 */
export function updateAlignedWordsFromOriginalForVerse(originalLangChapter, alignmentsChapter, verse) {
  let changed = 0;
  let removedExtraWords = 0;
  let emptyAlignments = 0;
  const {
    verse: verse_,
    originalLangWordList,
    alignmentsWordList,
  } = getBestMatchForVerse(originalLangChapter, alignmentsChapter, verse);

  if (originalLangWordList?.length && alignmentsWordList?.length) {
    const changed_ = updateAlignedWordsFromOriginalWordList(originalLangWordList, alignmentsWordList);
    changed = increment(changed, changed_);

    if (alignmentsChapter?.[verse_]?.alignments) {
      // clear word bank so it will be regenerated
      alignmentsChapter[verse_].wordBank = [];
      const { extraWordFound, emptyAlignmentsFound } = removeExtraWordsFromAlignments(alignmentsChapter, verse_);
      removedExtraWords = increment(removedExtraWords, extraWordFound);
      emptyAlignments = increment(emptyAlignments, emptyAlignmentsFound);
    }
  }
  return {
    changed,
    removedExtraWords,
    emptyAlignments,
  };
}

/**
 * for a chapter update the aligned word attributes for verse from latest original language
 * @param {Object} originalLangChapter
 * @param {Object} alignmentsChapter
 * @return {{emptyAlignmentsVerses: object[], changedVerses: object[], removedExtraWordsVerses: object[]}}
 */
export function updateAlignedWordAttribFromOriginalForChapter(originalLangChapter, alignmentsChapter) {
  const changedVerses = [];
  const removedExtraWordsVerses = [];
  const emptyAlignmentsVerses = [];
  const verses = Object.keys(alignmentsChapter);

  for (const verse of verses) {
    const {
      changed,
      removedExtraWords,
      emptyAlignments,
    } = updateAlignedWordsFromOriginalForVerse(originalLangChapter, alignmentsChapter, verse);

    if (emptyAlignments > 0) {
      emptyAlignmentsVerses.push({ verse, count: emptyAlignments });
    }

    if (removedExtraWords > 0) {
      removedExtraWordsVerses.push({ verse, count: removedExtraWords });
    }

    if (changed > 0) {
      changedVerses.push({ verse, count: changed });
    }
  }
  return {
    changedVerses,
    removedExtraWordsVerses,
    emptyAlignmentsVerses,
  };
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
  const manifest = manifestUtils.getProjectManifest(latestVersionPath) || null;
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
  const projectManifest = manifestUtils.getProjectManifest(projectPath);
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
 * @return {{removedExtraWordsChapters: {}, emptyAlignmentsChapters: {}, changedChapters: {}}}
 */
export function updateAlignedWordAttribFromOriginalForBook(origBook, alignments, bookID) {
  const changedChapters = {};
  const removedExtraWordsChapters = {};
  const emptyAlignmentsChapters = {};

  if (origBook) {
    const chapters = Object.keys(origBook);

    for (const chapter of chapters) {
      const originalLangChapter = origBook[chapter];
      const alignmentsChapter = alignments[chapter];

      if (originalLangChapter && alignmentsChapter) {
        const {
          changedVerses,
          removedExtraWordsVerses,
          emptyAlignmentsVerses,
        } = updateAlignedWordAttribFromOriginalForChapter(originalLangChapter, alignmentsChapter);

        if (changedVerses?.length) {
          changedChapters[chapter] = changedVerses;
        }

        if (emptyAlignmentsVerses?.length) {
          emptyAlignmentsChapters[chapter] = emptyAlignmentsVerses;
        }

        if (removedExtraWordsVerses?.length) {
          removedExtraWordsChapters[chapter] = removedExtraWordsVerses;
        }
      } else {
        console.log(`updateAlignedWordsFromOriginalForBook(${bookID}) - missing chapter ${chapter} data OriginalLang = ${!!originalLangChapter}, alignments = ${alignmentsChapter}`);
      }
    }
  }
  return {
    changedChapters,
    removedExtraWordsChapters,
    emptyAlignmentsChapters,
  };
}

/**
 * for a project, load alignments for project and original language for GL. Then update the aligned word attributes for
 *   verse from latest original language
 * @param {string} projectPath
 * @param {string} bookId
 * @param {string} resourcesPath
 * @return {{removedExtraWordsChapters: {}, changedChapters: {}}}
 */
export const updateAlignedWordsFromOrigLanguage = (projectPath, bookId, resourcesPath = USER_RESOURCES_PATH) => (dispatch, getState) => {
  const results = hasOriginalLanguageChanged(projectPath, bookId, resourcesPath);
  const origBook = getLatestOriginalLanguageResource(bookId, results.owner, resourcesPath);
  const alignments = getProjectAlignments(bookId, projectPath);
  const {
    changedChapters,
    removedExtraWordsChapters,
    emptyAlignmentsChapters,
  } = updateAlignedWordAttribFromOriginalForBook(origBook, alignments, bookId);

  const changedChaptersCount = Object.keys(changedChapters).length;
  const emptyAlignmentsChaptersCount = Object.keys(emptyAlignmentsChapters).length;
  const removedExtraWordsChaptersCount = Object.keys(removedExtraWordsChapters).length;

  if (changedChaptersCount || removedExtraWordsChaptersCount || emptyAlignmentsChaptersCount) { // save changes
    if (changedChaptersCount) {
      console.log(`updateAlignedWordsFromOrigLanguage(${projectPath}) - alignment words updated in refs:`, changedChapters);
    }

    if (emptyAlignmentsChaptersCount) {
      console.log(`updateAlignedWordsFromOrigLanguage(${projectPath}) - empty alignments removed in refs:`, emptyAlignmentsChapters);
    }

    if (removedExtraWordsChaptersCount) {
      console.log(`updateAlignedWordsFromOrigLanguage(${projectPath}) - extra words removed in refs:`, removedExtraWordsChapters);
    }

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

  // update project manifest, first try to get from reducers
  let manifest = getProjectManifest(getState());
  const manifestInReducer = manifest;

  if (!manifestInReducer) { // not in reducers, so use what we fetched from file
    manifest = results.projectManifest;
  }
  manifest.tc_orig_lang_wordAlignment = results.latestVersion;

  if (!manifest.toolsSelectedOwners) {
    manifest.toolsSelectedOwners = {};
  }

  manifest.toolsSelectedOwners.wordAlignment = results.owner;

  if (manifestInReducer) {
    console.log(`updateAlignedWordsFromOrigLanguage() - updating manifest in reducer`, manifest);
    dispatch(ProjectDetailsActions.setProjectManifest(manifest));
  } else {
    console.log(`updateAlignedWordsFromOrigLanguage(${projectPath}) - saving directly to manifest`, manifest);
    manifestUtils.saveProjectManifest(projectPath, manifest);
  }

  return { changedChapters, removedExtraWordsChapters };
};
