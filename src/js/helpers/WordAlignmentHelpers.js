import fs from 'fs-extra';
import path from 'path-extra';
import usfmjs from 'usfm-js';
import stringHelpers from 'string-punctuation-tokenizer';
//helpers
import * as AlignmentHelpers from './AlignmentHelpers';
import * as manifestHelpers from './manifestHelpers';
import * as exportHelpers from './exportHelpers';
import * as ResourcesHelpers from './ResourcesHelpers';
import * as UsfmFileConversionHelpers from './FileConversionHelpers/UsfmFileConversionHelpers';
import * as LoadHelpers from './LoadHelpers';
// actions
import * as wordAlignmentLoadActions from '../actions/WordAlignmentLoadActions';

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
  if(wordObject && (wordObject.type === 'word')) {
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
 * @param {string} exportFilePath - Location of usfm to be written
 */
export const writeToFS = (exportFilePath, usfm) => {
  if (usfm && typeof(usfm)  === 'string') fs.writeFileSync(exportFilePath, usfm);
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
  return new Promise((resolve) => {
    let usfmToJSONObject = { headers:{}, chapters: {} };
    let expectedChapters = 0;

    // get the bibleIndex to get the list of expected chapters
    const bibleIndex = ResourcesHelpers.getBibleIndex('en', 'ulb');
    if(bibleIndex && bibleIndex[projectID]) {
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
          const alignments = wordAlignmentLoadActions.generateBlankAlignments(olData[chapterNumber][verse]);
          // generate the wordbank
          const wordBank = wordAlignmentLoadActions.generateWordBank(targetLanguageChapterJSON[verse]);
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
