import fs from 'fs-extra';
import path from 'path-extra';
import usfmjs from 'usfm-js';
//helpers
import * as stringHelpers from './stringHelpers';
import * as AlignmentHelpers from './AlignmentHelpers';
import * as manifestHelpers from './manifestHelpers';
import * as bibleHelpers from './bibleHelpers';
//consts
import { BIBLES_ABBRV_INDEX } from '../common/BooksOfTheBible';

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
  return wordObjects.map((wordObject, index) => {
    wordObject.occurrence = stringHelpers.occurrenceInString(string, index, getWordText(wordObject));
    wordObject.occurrences = stringHelpers.occurrencesInString(string, getWordText(wordObject));
    return wordObject;
  });
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
 * @param {String|Array} stringData - The string to search in
 * @returns {Array} - sorted array of wordObjects
 */
export const sortWordObjectsByString = (wordObjectArray, stringData) => {
  if (stringData.constructor !== Array) {
    stringData = wordObjectArrayFromString(stringData);
  } else {
    stringData = populateOccurrencesInWordObjects(stringData);
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
  if (usfm && typeof(usfm)  === 'string') fs.writeFileSync(exportFilePath, usfm);
};

/**
 * Gets the project name for an aligment export based on the 
 * door43 standards.
 * 
 * @param {object} manifest 
 * @returns {string}
 */
export function getProjectAlignmentName(manifest) {
  if (manifest && manifest.project && manifest.project.id) {
    const bookAbbrv = manifest.project.id;
    const index = BIBLES_ABBRV_INDEX[bookAbbrv];
    return `${index}-${bookAbbrv.toUpperCase()}`;
  }
}

/**
 * Method to retreive project alignment data and perform conversion in usfm 3
 * 
 * @param {string} projectSaveLocation - Full path to the users project to be exported
 * @returns {Promise}
 */
export const convertAlignmentDataToUSFM = (wordAlignmentDataPath, projectTargetLanguagePath,
   chapters, projectSaveLocation) => {
  return new Promise((resolve) => {
    let usfmToJSONObject = { headers:{}, chapters: {} };
    for (let chapterFile of chapters) {
      const chapterNumber = path.parse(chapterFile).name;
      const { chapterAlignmentJSON, targetLanguageChapterJSON } = getAlignmentDataFromPath(wordAlignmentDataPath, projectTargetLanguagePath, chapterFile);
      for (let verseNumber in chapterAlignmentJSON) {
        if (verseNumber === 'front') {
          debugger;
        }
        if (!parseInt(verseNumber)) continue; // only import integer based data, there are other files
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
    usfmToJSONObject.headers = getHeaderTags(projectSaveLocation);
    //Have iterated through all chapters and verses and stored verse objects from alignment data
    //converting from verseObjects to usfm and returning string
    resolve(usfmjs.toUSFM(usfmToJSONObject));
  });
};

/**
 * This function uses the manifest to populate the usfm JSON object id key in preparation
 * of usfm to JSON conversion
 * @param {string} projectSaveLocation - Path location in the filesystem for the project.
 */
export function getHeaderTags(projectSaveLocation) {
  const manifest = manifestHelpers.getProjectManifest(projectSaveLocation);
  const bookName = manifest.project.id;
  /**Has fields such as "language_id": "en" and "resource_id": "ulb" and "direction":"ltr"*/
  let sourceTranslation = manifest.source_translations[0];
  let resourceName = sourceTranslation && sourceTranslation.language_id && sourceTranslation.resource_id ?
    `${sourceTranslation.language_id.toUpperCase()}_${sourceTranslation.resource_id.toUpperCase()}` :
    'N/A';
  /**This will look like: ar_العربية_rtl to be included in the usfm id.
   * This will make it easier to read for tC later on */
  let targetLanguageCode = manifest.target_language ?
    `${manifest.target_language.id}_${manifest.target_language.name}_${manifest.target_language.direction}` :
    'N/A';
  /**Date object when project was las changed in FS */
  let lastEdited = fs.statSync(path.join(projectSaveLocation), bookName).atime;
  let bookNameUppercase = bookName.toUpperCase();
  /**Note the indication here of tc on the end of the id. This will act as a flag to ensure the correct parsing*/
  return [{
    "content": `${bookNameUppercase} ${resourceName} ${targetLanguageCode} ${lastEdited} tc`,
    "tag": "id"
  },
  {
    "content": bibleHelpers.convertToFullBookName(bookName),
    "tag": "h"
  }];
}