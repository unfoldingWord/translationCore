import fs from 'fs-extra';
import path from 'path-extra';
import usfmjs from 'usfm-js';
//helpers
import * as stringHelpers from './stringHelpers';
import * as AlignmentHelpers from './AlignmentHelpers';
import * as manifestHelpers from './manifestHelpers';
import * as exportHelpers from './exportHelpers';
import * as verseObjectHelpers from './VerseObjectHelpers';
import * as verseObjectActions from '../actions/VerseObjectActions';
//consts
import { STATIC_RESOURCES_PATH } from './ResourcesHelpers';

/**
 * Concatenates an array of words into a verse.
 * @param {array} verseArray - array of strings in a verse.
 * @return {string} combined verse
 */
export const combineGreekVerse = (verseArray) => {
  return verseArray.map(o => getWordText(o)).join(' ');
};

/**
 * get text for word object, if not in new format, falls back to old format
 * @param {object} wordObject
 * @return {string|undefined} text from word object
 */
export const getWordText = (wordObject) => {
  if (wordObject && (wordObject.type === 'word')) {
    return wordObject.text;
  }
  return wordObject ? wordObject.word : undefined;
};

export const populateOccurrencesInWordObjects = (wordObjects) => {
  const string = combineGreekVerse(wordObjects);
  let index = 0; // only count verseObject words
  return wordObjects.map((wordObject) => {
    const wordText = getWordText(wordObject);
    if (wordText) { // if verseObject is word
      wordObject.occurrence = stringHelpers.occurrenceInString(string, index++, wordText);
      wordObject.occurrences = stringHelpers.occurrencesInString(string, wordText);
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
        chapters, wordAlignmentDataPath, projectTargetLanguagePath
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
 * @param {string} projectSaveLocation - Location of usfm to be written
 */
export const writeToFS = (exportFilePath, usfm) => {
  if (usfm && typeof (usfm) === 'string') fs.writeFileSync(exportFilePath, usfm);
};

/**
 * Method to retreive project alignment data and perform conversion in usfm 3
 *
 * @param {string} projectSaveLocation - Full path to the users project to be exported
 * @returns {Promise}
 */
export const convertAlignmentDataToUSFM = (wordAlignmentDataPath, projectTargetLanguagePath,
  chapters, projectSaveLocation) => {
  return new Promise((resolve) => {
    let usfmToJSONObject = { headers: {}, chapters: {} };
    for (let chapterFile of chapters) {
      const chapterNumber = path.parse(chapterFile).name;
      const { chapterAlignmentJSON, targetLanguageChapterJSON } = getAlignmentDataFromPath(wordAlignmentDataPath, projectTargetLanguagePath, chapterFile);
      for (let verseNumber in chapterAlignmentJSON) {
        if (!parseInt(verseNumber)) continue; // only import integer based verses
        //Iterate through verses of chapter alignment data,
        //and retieve relevant information for conversion
        const verseAlignments = chapterAlignmentJSON[verseNumber];
        const verseString = targetLanguageChapterJSON[verseNumber];
        const verseObjects = AlignmentHelpers.merge(
          verseAlignments.alignments, verseAlignments.wordBank, verseString
        );
        setVerseObjectsInAlignmentJSON(usfmToJSONObject, chapterNumber, verseNumber, verseObjects);
      }
    }
    usfmToJSONObject.headers = exportHelpers.getHeaderTags(projectSaveLocation);
    //Have iterated through all chapters and verses and stored verse objects from alignment data
    //converting from verseObjects to usfm and returning string
    resolve(usfmjs.toUSFM(usfmToJSONObject));
  });
};

export const checkProjectForVerseChanges = (chapterAlignmentData, bookId, chapter, verse, projectSaveLocation) => {
  const verseAlignments = chapterAlignmentData[verse];
  debugger;
  if (checkVerseForChanges(verseAlignments, bookId, chapter, verse, projectSaveLocation)) {
    return resetWordAlignmentsForVerse(bookId, chapter, verse, projectSaveLocation);
  } else {
    return chapterAlignmentData;
  }
};


export const getStaticGreekVerse = (bookId, chapter) => {
  const greekChapterPath = path.join(STATIC_RESOURCES_PATH, 'grc', 'bibles', 'ugnt', 'v0', bookId, `${chapter}.json`);
  if (fs.existsSync(greekChapterPath)) {
    return fs.readJSONSync(greekChapterPath);
  }
};

//string
export const getGreekVerse = (bookId, chapter, verse) => {
  const greekChapterObject = getStaticGreekVerse(bookId, chapter);
  return getVerseStringFromWordObjects(greekChapterObject[verse], ['word']);
};

export const getVerseStringFromWordObjects = (wordbjects, filter) => {
  const verseTextObjects = verseObjectActions.getWordListForVerse(wordbjects);
  let verseText = verseObjectHelpers.mergeVerseData(verseTextObjects, filter);
  return verseText.replace(/ ,(\n|\s)/g, ', ').trim();
};

export const getTargetLanguageVerse = (bookId, chapter, verse, projectSaveLocation) => {
  const targetLanguageChapterPath = path.join(projectSaveLocation, bookId, `${chapter}.json`);
  if (fs.existsSync(targetLanguageChapterPath)) {
    const targetLanguageChapterObject = fs.readJSONSync(targetLanguageChapterPath);
    const targetLanguageVerse = targetLanguageChapterObject[verse];
    return generateWordBank(targetLanguageVerse)
      .map(({ word }) => word)
      .join(' ');
  }
};

export const checkVerseForChanges = (verseAlignments, bookId, chapter, verse, projectSaveLocation) => {
  const staticGreekVerse = getGreekVerse(bookId, chapter, verse);
  const staticTargetLanguageVerse = getTargetLanguageVerse(bookId, chapter, verse, projectSaveLocation);

  const currentGreekVerse = getCurrentGreekVerseFromAlignments(verseAlignments);
  const currentTargetLanguageVerse = getCurrentTargetLanguageVerseFromAlignments(verseAlignments, staticTargetLanguageVerse);
  const greekChanged = staticGreekVerse !== currentGreekVerse;
  const targetLanguageChanged = staticTargetLanguageVerse !== currentTargetLanguageVerse;
  return greekChanged || targetLanguageChanged;
};

export const getCurrentGreekVerseFromAlignments = ({ alignments }) => {
  return alignments.map(({ topWords }) => {
    return topWords.map(({ word }) => {
      return word;
    });
  }).join(' ');
};

export const getCurrentTargetLanguageVerseFromAlignments = ({ alignments, wordBank }, verseString) => {
  let verseObjectWithAlignments;
  try {
    verseObjectWithAlignments = AlignmentHelpers.merge(alignments, wordBank, verseString);
  } catch (e) {
    if (e && e.message && e.message.includes('missing from word bank')) {
      return null;
    }
  }
  const verseObjects = getWordsFromVerseObjects(verseObjectWithAlignments);
  return getVerseStringFromWordObjects(verseObjects);
};

export const getWordsFromVerseObjects = (verseObjects) => {
  const wordObjects = verseObjects.map((versebject) => {
    return versebject.children ? versebject.children : versebject;
  });
  return [].concat(...wordObjects);
};

export const resetWordAlignmentsForVerse = (bookId, chapter, verse, projectSaveLocation) => {
  const greekVerseObjects = getStaticGreekVerse(bookId, chapter);
  const targetLanguageVerse = getTargetLanguageVerse(bookId, chapter, verse, projectSaveLocation);
  const alignments = generateBlankAlignments(greekVerseObjects[verse]);
  // generate the wordbank
  const wordBank = generateWordBank(targetLanguageVerse);
  return { alignments, wordBank };
};

/**
 * @description - generates the word alignment tool alignmentData from the UGNT verseData
 * @param {Array} verseData - array of verseObjects
 * @return {Array} alignmentObjects from verse text
 */
export const generateBlankAlignments = (verseData) => {
  if (verseData.verseObjects) {
    verseData = verseData.verseObjects;
  }
  const combinedVerse = combineGreekVerse(verseData);
  let wordList = verseObjectHelpers.getWordListFromVerseObjectArray(verseData);
  const alignments = wordList.map((wordData, index) => {
    const word = wordData.word || wordData.text;
    let occurrences = stringHelpers.occurrencesInString(combinedVerse, word);
    let occurrence = stringHelpers.occurrenceInString(combinedVerse, index, word);
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
 * @param {String} verseText - string of the verseText in the targetLanguage
 * @return {Array} alignmentObjects from verse text
 */
export const generateWordBank = (verseText) => {
  const verseWords = stringHelpers.tokenize(verseText);
  // TODO: remove once occurrencesInString uses tokenizer, can't do that until bug is addressed with Greek
  const _verseText = verseWords.join(' ');
  const wordBank = verseWords.map((word, index) => {
    let occurrences = stringHelpers.occurrencesInString(_verseText, word);
    let occurrence = stringHelpers.occurrenceInString(_verseText, index, word);
    return {
      word,
      occurrence,
      occurrences
    };
  });
  return wordBank;
};

export const getEmptyAlignmentData = (alignmentData, ugnt, targetLanguage, chapter) => {
  let _alignmentData = JSON.parse(JSON.stringify(alignmentData));

  const ugntChapter = ugnt[chapter];
  const targetLanguageChapter = targetLanguage[chapter];
  // loop through the chapters and populate the alignmentData
  Object.keys(ugntChapter).forEach((verseNumber) => {
    // create the nested objects to be assigned
    if (!_alignmentData[chapter]) _alignmentData[chapter] = {};
    if (!_alignmentData[chapter][verseNumber]) _alignmentData[chapter][verseNumber] = {};
    // generate the blank alignments
    const alignments = generateBlankAlignments(ugntChapter[verseNumber]);
    // generate the wordbank
    const wordBank = generateWordBank(targetLanguageChapter[verseNumber]);
    _alignmentData[chapter][verseNumber].alignments = alignments;
    _alignmentData[chapter][verseNumber].wordBank = wordBank;
  });
  return _alignmentData;
};