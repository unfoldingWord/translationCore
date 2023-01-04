import { referenceHelpers } from 'bible-reference-range';
import { DEFAULT_OWNER } from '../common/constants';
import { getProjectManifest } from './ProjectMigration/manifestUtils';
import * as ResourcesHelpers from './ResourcesHelpers';

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
 * @returns {*[]}
 * @param {array} verseObjects
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

function isValidVerseSpan(verse) {
  return referenceHelpers.isVerseSpan(verse) && !isNaN(referenceHelpers.toInt(verse));
}

function getVersesForSpan(verse, chapterData) {
  // coerce to look like a book so we can use library
  const chapter = 1;
  const bookData = { [chapter]: chapterData };
  const ref = `${chapter}:${verse}`;
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
 * get the aligned word attributes for verse from latest original language
 * @param {Object} originalLangChapter
 * @param {Object} alignmentsChapter
 * @return {array} list of verses that had attributes changed
 */
export function updateAlignedWordsFromOriginalForChapter(originalLangChapter, alignmentsChapter) {
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

export function getCurrentOrigLanguageVersionOwner(projectPath) {
  const manifest = getProjectManifest(projectPath);
  const waOwner = manifest?.toolsSelectedOwners?.wordAlignment || DEFAULT_OWNER;
  const owner = ResourcesHelpers.getOriginalLangOwner(waOwner);
  const version = manifest?.tc_orig_lang_check_version_wordAlignment;
  return { owner, version };
}
