import path from 'path-extra';
import fs from 'fs-extra';

export function migrateAppsToDotApps(projectPath) {
  let projectDir = fs.readdirSync(projectPath);

  if (projectDir.includes('apps') && projectDir.includes('.apps')) {
    fs.removeSync(path.join(projectPath, '.apps'));
  }

  if (projectDir.includes('apps')) {
    fs.renameSync(path.join(projectPath, 'apps'), path.join(projectPath, '.apps'));
  }
}

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
 * @param {object} chapterJson
 * @param {string|number} verse
 * @returns {*[]}
 */
export function getOrigLangWordListForVerse(chapterJson, verse) {
  const wordList = [];
  const verseObjects = chapterJson?.[verse]?.verseObjects;
  arrayToWordList(wordList, verseObjects);
  getOccurrencesForWordList(wordList);
  return wordList;
}

/**
 * get the word list for the aligned original words
 * @param {object} chapterJson
 * @param {string|number} verse
 * @returns {*[]}
 */
export function getAlignedWordListForVerse(chapterJson, verse) {
  const wordList = [];
  const alignments = chapterJson?.[verse]?.alignments;

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
 */
function updateAlignedWordsFromOriginalWordList(originalLangWordList, alignmentsWordList) {
  const wordBank = [];

  for (const origWord of originalLangWordList) {
    const found = alignmentsWordList.find(item => (item.word === origWord.word) && (item.occurrence === origWord.occurrence) && (item.occurrences === origWord.occurrences));

    if (found) {
      const keys = Object.keys(origWord);

      for (const key of keys) {
        if (found[key] !== origWord[key]) {
          found[key] = origWord[key]; // update attribute
        }
      }
      delete found.unmatched;
    } else {
      wordBank.push(origWord);
    }
  }

  return wordBank;
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
 * get the aligned word attributes for verse from latest original language
 * @param {Object} originalLangChapter
 * @param {Object} alignmentsChapter
 * @param {string|number} verse
 */
export function updateAlignedWordsFromOriginal(originalLangChapter, alignmentsChapter, verse) {
  const originalLangWordList = getOrigLangWordListForVerse(originalLangChapter, verse);
  const alignmentsWordList = getAlignedWordListForVerse(alignmentsChapter, verse);
  const wordBank = updateAlignedWordsFromOriginalWordList(originalLangWordList, alignmentsWordList);

  // update word bank with unused words from original language.
  if (alignmentsChapter?.[verse]?.alignments) {
    alignmentsChapter[verse].wordBank = wordBank;
    removeExtraWordsFromAlignments(alignmentsChapter, verse);
  }
}
