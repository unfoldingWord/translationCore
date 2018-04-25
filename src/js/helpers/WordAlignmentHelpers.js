import fs from 'fs-extra';
import isEqual from 'deep-equal';
import path from 'path-extra';
import usfmjs from 'usfm-js';
import stringHelpers from 'string-punctuation-tokenizer';
//helpers
import * as AlignmentHelpers from './AlignmentHelpers';
import * as manifestHelpers from './manifestHelpers';
import * as exportHelpers from './exportHelpers';
import * as verseObjectHelpers from './VerseObjectHelpers';
import * as ResourcesHelpers from './ResourcesHelpers';
import * as UsfmFileConversionHelpers from './FileConversionHelpers/UsfmFileConversionHelpers';
import * as LoadHelpers from './LoadHelpers';
const STATIC_RESOURCES_PATH = path.join(__dirname, '../../../tC_resources/resources');

/**
 * Concatenates an array of words into a verse.
 * @param {array} verseArray - array of strings in a verse.
 * @return {string} combined verse
 */
export const combineVerseArray = (verseArray) => {
  return verseArray.map(o => getWordText(o)).join(' ');
};

/**
 * get text from word type verse object or word object
 * @param {object} wordObject
 * @return {string|undefined} text from word object
 */
export const getWordText = (wordObject) => {
  if (wordObject && (wordObject.type === 'word')) {
    return wordObject.text;
  }
  return wordObject ? wordObject.word : undefined;
};

/**
 * create an array of word objects with occurrence(s)
 * @param {String|Array|Object} words
 * @return {Array} - array of wordObjects
 */
export const populateOccurrencesInWordObjects = (words) => {
  words = verseObjectHelpers.getWordList(words);
  let index = 0; // only count verseObject words
  return words.map((wordObject) => {
    const wordText = getWordText(wordObject);
    if (wordText) { // if verseObject is word
      wordObject.occurrence = verseObjectHelpers.getOccurrence(words, index++, wordText);
      wordObject.occurrences = verseObjectHelpers.getOccurrences(words, wordText);
      return wordObject;
    }
    return null;
  }).filter(wordObject => (wordObject != null));
};

/**
 * @description wordObjectArray via string
 * @param {String} string - The string to search in
 * @returns {Array} - array of wordObjects
 */
export const wordObjectArrayFromString = (string) => {
  const wordObjectArray = stringHelpers.tokenize(string).map((word, index) => {
    const occurrence = stringHelpers.occurrenceInString(string, index, word);
    const occurrences = stringHelpers.occurrencesInString(string, word);
    return {
      word,
      occurrence: occurrence,
      occurrences: occurrences
    };
  });
  return wordObjectArray;
};
/**
 * @description sorts wordObjectArray via string
 * @param {Array} wordObjectArray - array of wordObjects
 * @param {String|Array|Object} stringData - The string to search in
 * @returns {Array} - sorted array of wordObjects
 */
export const sortWordObjectsByString = (wordObjectArray, stringData) => {
  if (stringData.verseObjects) {
    stringData = populateOccurrencesInWordObjects(stringData.verseObjects);
  } else if (Array.isArray(stringData)) {
    stringData = populateOccurrencesInWordObjects(stringData);
  } else {
    stringData = wordObjectArrayFromString(stringData);
  }
  let _wordObjectArray = wordObjectArray.map((wordObject) => {
    const { word, occurrence, occurrences } = wordObject;
    const _wordObject = {
      word,
      occurrence,
      occurrences
    };
    const indexInString = stringData.findIndex(object => {
      const equal = (
        getWordText(object) === getWordText(_wordObject) &&
        object.occurrence === _wordObject.occurrence &&
        object.occurrences === _wordObject.occurrences
      );
      return equal;
    });
    wordObject.index = indexInString;
    return wordObject;
  });
  _wordObjectArray = _wordObjectArray.sort((a, b) => {
    return a.index - b.index;
  });
  _wordObjectArray = _wordObjectArray.map((wordObject) => {
    delete wordObject.index;
    return wordObject;
  });
  return _wordObjectArray;
};

/**
 * Helper method to retrieve the greek chapter object according to specified book/chapter
 *
 * @param {string} bookId  - Abbreviation of book name
 * @param {number} chapter  - Current chapter from the contextId
 * @returns {{ verseNumber: {verseObjects: Array} }} - Verses in the chapter object
 */
export const getGreekVerseFromResources = (projectSaveLocation, chapter, verse) => {
  const { project } = manifestHelpers.getProjectManifest(projectSaveLocation);
  const greekChapterPath = ResourcesHelpers.getLatestVersionInPath(path.join(STATIC_RESOURCES_PATH, 'grc', 'bibles', 'ugnt'));
  const greekChapterPathWithBook = path.join(greekChapterPath, project.id, chapter + '.json');
  //greek path from tC_resources
  if (fs.existsSync(greekChapterPathWithBook)) {
    return fs.readJSONSync(greekChapterPathWithBook)[verse];
  }
};

/**
 *
 * @param {string} projectSaveLocation - Full path to the users project to be exported
 */
export const getAlignmentPathsFromProject = (projectSaveLocation) => {
  let chapters, wordAlignmentDataPath, projectTargetLanguagePath;
  //Retrieve project manifest, and paths for reading
  const { project } = manifestHelpers.getProjectManifest(projectSaveLocation);
  if (project && project.id) {
    wordAlignmentDataPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', project.id);
    projectTargetLanguagePath = path.join(projectSaveLocation, project.id);
    if (fs.existsSync(wordAlignmentDataPath) && fs.existsSync(projectTargetLanguagePath)) {
      chapters = fs.readdirSync(wordAlignmentDataPath);
      //get integer based chapter files
      chapters = chapters.filter((chapterFile) => !!parseInt(path.parse(chapterFile).name));
      return {
        chapters, wordAlignmentDataPath, projectTargetLanguagePath,
      };
    }
  } return {};
};

/**
 * Method to fetch a target language chapter JSON and source/target language
 * alignment data JSON for the corresponding chapter. This is essientially the data
 * needed to in order to produce a USFM 3 from the aligned data.
 * @param {string} wordAlignmentDataPath - path to where the source/target language
 * alignment data JSON is located
 * @param {string} projectTargetLanguagePath path to where the target language chapter JSON is
 * located
 * @param {string} chapterFile
 * @returns {{
      chapterAlignmentJSON: object,
      targetLanguageChapterJSON: object
 * }}
 */
export const getAlignmentDataFromPath = (wordAlignmentDataPath, projectTargetLanguagePath, chapterFile) => {
  try {
    const chapterAlignmentJSON = fs.readJSONSync(path.join(wordAlignmentDataPath, chapterFile));
    const targetLanguageChapterJSON = fs.readJSONSync(path.join(projectTargetLanguagePath, chapterFile));
    return {
      chapterAlignmentJSON,
      targetLanguageChapterJSON
    };
  } catch (e) {
    return {
      chapterAlignmentJSON: {},
      targetLanguageChapterJSON: {}
    };
  }
};

/**
 * Method to set a key value in the usfm json object to easily account for missing keys
 *
 * @param {object} usfmToJSONObject - Object of all verse object to be converted by usfm-jd library
 * @param {string} chapterNumber - Current chapter number key value
 * @param {string} verseNumber Current verse number key value
 * @param {array} verseObjects - Array of verse objects made from the alignment reducer of the
 * current chapter/verse
 */
export const setVerseObjectsInAlignmentJSON = (usfmToJSONObject, chapterNumber, verseNumber, verseObjects) => {
  !usfmToJSONObject.chapters[chapterNumber] ? usfmToJSONObject.chapters[chapterNumber] = {} : null;
  !usfmToJSONObject.chapters[chapterNumber][verseNumber] ? usfmToJSONObject.chapters[chapterNumber][verseNumber] = {} : null;
  usfmToJSONObject.chapters[chapterNumber][verseNumber].verseObjects = verseObjects;
};

/**
 * Wrapper for writing to the fs.
 *
 * @param {string} usfm - Usfm data to be written to FS
 * @param {string} exportFilePath - Location of usfm to be written
 */
export const writeToFS = (exportFilePath, usfm) => {
  if (usfm && typeof (usfm) === 'string') fs.writeFileSync(exportFilePath, usfm);
};

/**
 * Method to retrieve project alignment data and perform conversion in usfm 3
 * @param {string} wordAlignmentDataPath
 * @param {string} projectTargetLanguagePath
 * @param {array} chapters aligned
 * @param {string} projectSaveLocation - Full path to the users project to be exported
 * @param {string} projectID
 * @returns {Promise} USFM data for book
 */
export const convertAlignmentDataToUSFM = (wordAlignmentDataPath, projectTargetLanguagePath,
  chapters, projectSaveLocation, projectID) => {
  return new Promise((resolve, reject) => {
    let usfmToJSONObject = { headers: {}, chapters: {} };
    let expectedChapters = 0;

    // get the bibleIndex to get the list of expected chapters
    const bibleIndex = ResourcesHelpers.getBibleIndex('en', 'ult');
    if (bibleIndex && bibleIndex[projectID]) {
      expectedChapters = bibleIndex[projectID].chapters;
    } else { // fallback just get highest chapter
      for (let chapter of chapters) {
        const chapterNum = (typeof chapter === 'string') ? parseInt(chapter) : chapter;
        if (chapterNum > expectedChapters) {
          expectedChapters = chapterNum;
        }
      }
    }

    for (let chapterNumber = 1; chapterNumber <= expectedChapters; chapterNumber++) {
      const chapterFile = chapterNumber + ".json";
      let chapterAlignmentJSON = {};
      let targetLanguageChapterJSON;
      const missingAlignmentData = chapters.indexOf(chapterFile) < 0;
      if (missingAlignmentData) { // if no alignment data, generate empty
        targetLanguageChapterJSON = LoadHelpers.loadFile(projectTargetLanguagePath, chapterFile);
        const olData = UsfmFileConversionHelpers.getOriginalLanguageChapterResources(projectID, chapterNumber);
        for (let verse of Object.keys(olData[chapterNumber])) {
          // generate the blank alignments
          const alignments = generateBlankAlignments(olData[chapterNumber][verse]);
          // generate the wordbank
          const wordBank = generateWordBank(targetLanguageChapterJSON[verse]);
          chapterAlignmentJSON[verse] = {
            alignments,
            wordBank
          };
        }

      } else {
        const alignmentData = getAlignmentDataFromPath(wordAlignmentDataPath, projectTargetLanguagePath, chapterFile);
        chapterAlignmentJSON = alignmentData.chapterAlignmentJSON;
        targetLanguageChapterJSON = alignmentData.targetLanguageChapterJSON;
      }
      for (let verseNumber in chapterAlignmentJSON) {
        if (!parseInt(verseNumber)) continue; // only import integer based verses
        //Iterate through verses of chapter alignment data,
        //and retrieve relevant information for conversion
        const verseAlignments = chapterAlignmentJSON[verseNumber];
        const verseString = targetLanguageChapterJSON[verseNumber];
        let verseObjects;
        try {
          verseObjects = AlignmentHelpers.merge(
            verseAlignments.alignments, verseAlignments.wordBank, verseString, true
          );
        } catch (e) {
          if (e && e.type && e.type === 'InvalidatedAlignments') {
            //This is an expected error for invalidated alignments
            return reject({ error: e, verse: parseInt(verseNumber), chapter: chapterNumber });
          }
        }
        setVerseObjectsInAlignmentJSON(usfmToJSONObject, chapterNumber, verseNumber, verseObjects);
      }
    }
    usfmToJSONObject.headers = exportHelpers.getHeaderTags(projectSaveLocation);
    //Have iterated through all chapters and verses and stored verse objects from alignment data
    //converting from verseObjects to usfm and returning string
    resolve(usfmjs.toUSFM(usfmToJSONObject));
  });
};

/**
 * Wrapper method to get the greek verse objects from the resources and
 * then convert them to a verse string.
 * Note: This verse string does not contain punctuation, or special tags
 * simply contains all the greek words in the verse.
 * @param {object} ugntVerse - Array of verse objects containing ugnt words
 * @returns {array} - Greek verse obejcts for the current book/chapter/verse
 */
export const getGreekVerse = (ugntVerse) => {
  if (ugntVerse) {
    ugntVerse = getWordsFromVerseObjects(ugntVerse);
    const greekVerseArray = ugntVerse.filter(({ type }) => {
      return type === 'word';
    }).map((word) => verseObjectHelpers.wordVerseObjectFromBottomWord(word, 'text'));
    return combineVerseArray(greekVerseArray);
  }
};

/**
 * Wrapper method to retrieve the target language verse according to specified book/chapter
 *
 * @param {string} targetLanguageVerse - Current target language verse from the bibles
 * reducer.
 * @returns {string} - Combined verse objects into a single string
 * Note: The returning string will not contain any punctuation, or special markers
 * not including in the 'word' attribute
 */
export const getTargetLanguageVerse = (targetLanguageVerse) => {
  if (targetLanguageVerse) {
    const verseObjects = verseObjectHelpers.getOrderedVerseObjectsFromString(targetLanguageVerse);
    const verseObjectsCleaned = verseObjectHelpers.getWordList(verseObjects);
    return combineVerseArray(verseObjectsCleaned);
  }
};

/**
 * Wrapper method to retrieve relevant data from alignments and do string comparison.
 *
 * @param {object} verseAlignments - The verse vese alignments object
 * @param {array} verseAlignments.alignments
 * @param {array} verseAlignments.wordBank
 * @param {object} ugnt - Array of verse objects containing ugnt words
 * @param {string} targetLanguageVerse - Current target language string from the bibles reducer
 * @returns {object} - If there were verse changes or not, which bible the changes were in, and
 * whether or not to show the dialog
 */
export const checkVerseForChanges = (verseAlignments, ugnt, targetLanguageVerse) => {
  const showDialog = verseHasAlignments(verseAlignments);
  const targetLanguageVerseCleaned = getTargetLanguageVerse(targetLanguageVerse);
  const staticGreekVerse = getGreekVerse(ugnt.verseObjects);
  const currentGreekVerse = getCurrentGreekVerseFromAlignments(verseAlignments);
  const currentTargetLanguageVerse = getCurrentTargetLanguageVerseFromAlignments(verseAlignments, targetLanguageVerseCleaned);
  const greekChanged = !isEqual(staticGreekVerse, currentGreekVerse);
  const targetLanguageChanged = !isEqual(targetLanguageVerseCleaned, currentTargetLanguageVerse);
  return {
    alignmentsInvalid: greekChanged || targetLanguageChanged,
    alignmentChangesType: greekChanged ? 'ugnt' : targetLanguageChanged ? 'target language' : null,
    showDialog
  };
};

/**
 * Helper method to find if the given alignments object actually
 * has aligned data. If not we do not want to show the reset dialog
 *
 * @param {array} alignments - alignments object with array of top words/bottom words
 * @returns {boolean} - Whether or not the verse has alignments
 */
export const verseHasAlignments = ({ alignments }) => {
  if (alignments) {
    return alignments.filter(({ bottomWords }) => {
      return bottomWords.length > 0;
    }).length > 0;
  }
};

/**
 * Helper method to parse the greek words from an alignments object
 *
 * @param {array} alignments - alignments object with array of top words/bottom words
 * @returns {string} - Greek verse words combined, without punctation
 */
export const getCurrentGreekVerseFromAlignments = ({ alignments }) => {
  if (alignments) {
    const greekVerseArray = flattenArray(alignments.map(({ topWords }) => {
      return topWords.map(word => verseObjectHelpers.wordVerseObjectFromBottomWord(word));
    }));
    return combineVerseArray(greekVerseArray);
  }
};

/**
 * Helper method to parse alignments for target languge words and combine them in order
 *
 * @param {array} alignments - array of top words/bottom words
 * @param {array} wordBank - array of unused topWords for aligning
 * @param {string} verseString - verse from target language, used for aligning greek words
 * in alingment data and extracting words
 * @returns {string} - Target language verse merged from alignments
 */
export const getCurrentTargetLanguageVerseFromAlignments = ({ alignments, wordBank }, verseString) => {
  let verseObjectWithAlignments;
  try {
    verseObjectWithAlignments = AlignmentHelpers.merge(alignments, wordBank, verseString);
  } catch (e) {
    if (e && e.type && e.type === 'InvalidatedAlignments') {
      console.warn(e.message);
      return null;
    }
  }
  if (verseObjectWithAlignments) {
    const verseObjects = getWordsFromVerseObjects(verseObjectWithAlignments);
    const verseObjectsCleaned = verseObjectHelpers.getWordList(verseObjects);
    return combineVerseArray(verseObjectsCleaned);
  }
  return null;
};

/**
 * Helper method to grab only verse objects or childen of verse objects but
 * not grab verse objects containing children.
 * i.e. given {a:1, b:{2, children:{2a, 2b}} returns 1, 2a, 2b (skips 2)
 *
 * @param {array} verseObjects - Objects containing data for the words such as
 * occurences, occurence, tag, text and type
 * @returns {array} - same format as input, except objects containing childern
 * get flatten to top level
 */
export const getWordsFromVerseObjects = (verseObjects) => {
  const wordObjects = verseObjects.map((versebject) => {
    if (versebject.children) {
      return getWordsFromVerseObjects(versebject.children);
    } else return versebject;
  });
  return flattenArray(wordObjects);
};

/**
 * Helper function to flatten a double nested array
 * @param {array} arr - Array to be flattened
 * @returns {array}
 */
export const flattenArray = (arr) => {
  return [].concat(...arr);
};

/**
 * Wrapper method for resetting alignments in verse to being blank alignments
 * i.e. (all words in word bank and not joined with alignments data)
 * Note: This method does not overwrite any data
 * @param {object} ugnt - Array of verse objects containing ugnt words
 * @param {string} targetLanguageVerse - Current target language string from the bibles reducer
 * @returns {{alignments, wordBank}} - Reset alignments data
 */
export const getBlankAlignmentDataForVerse = (ugntVerse, targetLanguageVerse) => {
  const alignments = generateBlankAlignments(ugntVerse);
  const wordBank = generateWordBank(targetLanguageVerse);
  return { alignments, wordBank };
};

/**
 * @description - generates the word alignment tool alignmentData from the UGNT verseData
 * @param {String|Array|Object} verseData - array of verseObjects
 * @return {Array} alignmentObjects from verse text
 */
export const generateBlankAlignments = (verseData) => {
  let wordList = verseObjectHelpers.getWordList(verseData);
  const alignments = wordList.map((wordData, index) => {
    const word = wordData.word || wordData.text;
    let occurrences = verseObjectHelpers.getOccurrences(wordList, word);
    let occurrence = verseObjectHelpers.getOccurrence(wordList, index, word);
    const alignment = {
      topWords: [
        {
          word: word,
          strong: (wordData.strong || wordData.strongs),
          lemma: wordData.lemma,
          morph: wordData.morph,
          occurrence,
          occurrences
        }
      ],
      bottomWords: []
    };
    return alignment;
  });
  return alignments;
};

/**
 * @description - generates the word alignment tool word bank from targetLanguage verse
 * @param {String|Array|Object} verseData - string of the verseText in the targetLanguage
 * @return {Array} alignmentObjects from verse text
 */
export const generateWordBank = (verseData) => {
  const verseWords = verseObjectHelpers.getWordList(verseData);
  const wordBank = verseWords.map((object, index) => {
    const word = object.text;
    let occurrences = verseObjectHelpers.getOccurrences(verseWords, word);
    let occurrence = verseObjectHelpers.getOccurrence(verseWords, index, word);
    return {
      word,
      occurrence,
      occurrences
    };
  });
  return wordBank;
};

/**
 * Wrapper method form creating a blank alignment data given an object and specified chapter data
 *
 * @param {object} alignmentData - Chapter data of alignments, including alignments and word banks
 * for each verse
 * @param {object} ugnt - Entire UGNT book and all its chapters
 * @param {object} targetBible - Entire target language book and all its chapters
 * @param {number} chapter - Current chapter from contextId
 * @returns {object} - All chapters of alignment data reset to blank word banks, and unaligned
 */
export const getEmptyAlignmentData = (alignmentData, ugnt, targetBible, chapter) => {
  let _alignmentData = JSON.parse(JSON.stringify(alignmentData));
  const ugntChapter = ugnt[chapter];
  const targetLanguageChapter = targetBible[chapter];
  // loop through the chapters and populate the alignmentData
  Object.keys(ugntChapter).forEach((verseNumber) => {
    // create the nested objects to be assigned
    if (!_alignmentData[chapter]) _alignmentData[chapter] = {};
    if (!_alignmentData[chapter][verseNumber]) _alignmentData[chapter][verseNumber] = {};
    const alignments = generateBlankAlignments(ugntChapter[verseNumber]);
    const wordBank = generateWordBank(targetLanguageChapter[verseNumber]);
    _alignmentData[chapter][verseNumber].alignments = alignments;
    _alignmentData[chapter][verseNumber].wordBank = wordBank;
  });
  return _alignmentData;
};
/**
 * Helper function to get the alignment data from a specified location and return the
 * reset version of it. (Does not change project data)
 * @param {string} projectSaveLocation - Path of the project that is not reset
 * @param {number} chapter - Number of the current chapter
 * @param {number} verse - Number of the current verse
 * @returns {{alignemnts, wordBank}}
 */
export function resetAlignmentsForVerse(projectSaveLocation, chapter, verse) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { projectTargetLanguagePath, wordAlignmentDataPath } = getAlignmentPathsFromProject(projectSaveLocation);
      const targetLanguageChapterJSON = fs.readJSONSync(path.join(projectTargetLanguagePath, chapter + '.json'));
      const targetLanguageVerse = targetLanguageChapterJSON[verse];
      const ugntVerseObjects = getGreekVerseFromResources(projectSaveLocation, chapter, verse);
      const ugntVerseObjectsWithoutPunctuation = ugntVerseObjects && ugntVerseObjects.verseObjects ? ugntVerseObjects.verseObjects.filter(({ type }) => {
        return type === 'word';
      }) : [];
      const resetVerseAlignments = getBlankAlignmentDataForVerse(ugntVerseObjectsWithoutPunctuation, targetLanguageVerse);
      const wordAlignmentPathWithChapter = path.join(wordAlignmentDataPath, chapter + '.json');
      const wordAignmentChapterJSON = fs.readJSONSync(wordAlignmentPathWithChapter);
      wordAignmentChapterJSON[verse] = resetVerseAlignments;
      fs.writeJSONSync(wordAlignmentPathWithChapter, wordAignmentChapterJSON);
      resolve();
    }, 500);
  });
}

/**
 * Helper method to check if a word alignment project has alignments
 *
 * @param {string} wordAlignmentDataPath - Path to the alignemnt data i.e.
 * projectSaveLocation/.apps/translationCore/alignmentData/project.id
 * @param {Array} chapters - Array of the chapter file paths for easy iterating over
 * @returns {boolean}
 */
export function checkProjectForAlignments(wordAlignmentDataPath, chapters) {
  let hasAlignments = false;
  if (fs.existsSync(wordAlignmentDataPath)) {
    for (var chapterFile of chapters) {
      const wordAlignmentJSON = fs.readJSONSync(path.join(wordAlignmentDataPath, chapterFile));
        hasAlignments = Object.keys(wordAlignmentJSON).filter((chapterNumber) => {
        const { alignments } = wordAlignmentJSON[chapterNumber];
        return !!alignments.filter(({ bottomWords }) => bottomWords.length > 0).length;
      }).length > 0;
      if (hasAlignments) return true;
    }
  }
  return hasAlignments;
}
