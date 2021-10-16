import fs from 'fs-extra';
import path from 'path-extra';
import usfmjs from 'usfm-js';
import wordaligner, { VerseObjectUtils } from 'word-aligner';
//helpers
import { STATIC_RESOURCES_PATH } from '../common/constants';
import * as manifestHelpers from './manifestHelpers';
import * as exportHelpers from './exportHelpers';
import * as ResourcesHelpers from './ResourcesHelpers';
import * as UsfmFileConversionHelpers from './FileConversionHelpers/UsfmFileConversionHelpers';
import * as LoadHelpers from './LoadHelpers';
import ResourceAPI from './ResourceAPI';
import * as BibleHelpers from './bibleHelpers';

/**
 * Helper method to retrieve the greek chapter object according to specified book/chapter
 * @param projectSaveLocation
 * @param {number} chapter - Current chapter from the contextId
 * @param verse
 * @returns {{ verseNumber: {verseObjects: Array} }} - Verses in the chapter object
 */
export const getOriginalVerseFromResources = (projectSaveLocation, chapter, verse) => {
  const { project } = manifestHelpers.getProjectManifest(projectSaveLocation);
  const { languageId, bibleId } = BibleHelpers.getOrigLangforBook(project.id);
  const origLangChapterPath = ResourceAPI.getLatestVersion(path.join(STATIC_RESOURCES_PATH, languageId, 'bibles', bibleId));
  const origLangChapterPathWithBook = path.join(origLangChapterPath, project.id, chapter + '.json');

  //greek path from tcResources
  if (fs.existsSync(origLangChapterPathWithBook)) {
    return fs.readJSONSync(origLangChapterPathWithBook)[verse];
  }
};

/**
 * Returns paths to the alignment data if it exits.
 * @param {string} projectSaveLocation - Full path to the users project to be exported
 */
export const getAlignmentPathsFromProject = (projectSaveLocation) => {
  let chapters = [];
  //Retrieve project manifest, and paths for reading
  const { project } = manifestHelpers.getProjectManifest(projectSaveLocation);

  if (project && project.id) {
    const wordAlignmentDataPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', project.id);
    const projectTargetLanguagePath = path.join(projectSaveLocation, project.id);

    if (fs.existsSync(wordAlignmentDataPath) && fs.existsSync(projectTargetLanguagePath)) {
      chapters = fs.readdirSync(wordAlignmentDataPath);
      //get integer based chapter files
      chapters = chapters.filter((chapterFile) => !!parseInt(path.parse(chapterFile).name));
      return {
        chapters,
        wordAlignmentDataPath,
        projectTargetLanguagePath,
      };
    }
  }
  return {};
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
 * @returns {{ chapterAlignmentJSON: object, targetLanguageChapterJSON: object }}
 */
export const getAlignmentDataFromPath = (wordAlignmentDataPath, projectTargetLanguagePath, chapterFile) => {
  try {
    const chapterAlignmentJSON = fs.readJSONSync(path.join(wordAlignmentDataPath, chapterFile));
    const targetLanguageChapterJSON = fs.readJSONSync(path.join(projectTargetLanguagePath, chapterFile));
    return {
      chapterAlignmentJSON,
      targetLanguageChapterJSON,
    };
  } catch (e) {
    return {
      chapterAlignmentJSON: {},
      targetLanguageChapterJSON: {},
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
  /* eslint-disable no-unused-expressions */
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
  if (usfm && typeof (usfm) === 'string') {
    fs.writeFileSync(exportFilePath, usfm);
  }
};

/**
 * add verse in USFM format to output
 * @param usfmToJSONObject
 * @param targetLanguageChapter
 * @param chapter
 * @param verse
 */
function saveUsfmVerse(usfmToJSONObject, targetLanguageChapter, chapter, verse) {
  const verseObjects = usfmjs.toJSON('\\v 1 ' + targetLanguageChapter[verse], { chunk: true });

  if (verseObjects && verseObjects.verses && verseObjects.verses[1] && verseObjects.verses[1].verseObjects) {
    setVerseObjectsInAlignmentJSON(usfmToJSONObject, chapter, verse, verseObjects.verses[1].verseObjects);
  }
}

/**
 * Method to retrieve project alignment data and perform conversion in usfm 3
 * TODO: this will eventually become deprecated in favor of a separate conversion tool either imported dirrectly or accessed through the tool api.
 * @param {string} wordAlignmentDataPath
 * @param {string} projectTargetLanguagePath
 * @param {array} chapters aligned
 * @param {string} projectSaveLocation - Full path to the users project to be exported
 * @param {string} projectID
 * @returns {Promise} USFM data for book
 */
export const convertAlignmentDataToUSFM = (wordAlignmentDataPath, projectTargetLanguagePath,
  chapters, projectSaveLocation, projectID) => {
  if (!chapters) {
    chapters = [];
  }

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
      const chapterFile = chapterNumber + '.json';
      let chapterAlignmentJSON = {};
      let targetLanguageChapterJSON;
      const missingAlignmentData = chapters.indexOf(chapterFile) < 0;

      if (missingAlignmentData) { // if no alignment data, generate empty
        targetLanguageChapterJSON = LoadHelpers.loadFile(projectTargetLanguagePath, chapterFile);

        if (!targetLanguageChapterJSON) {
          continue;
        }

        const olData = UsfmFileConversionHelpers.getOriginalLanguageChapterResources(projectID, chapterNumber);

        for (let verse of Object.keys(olData[chapterNumber])) {
          // generate the blank alignments
          const alignments = wordaligner.generateBlankAlignments(olData[chapterNumber][verse]);
          // generate the wordbank
          const wordBank = wordaligner.generateWordBank(targetLanguageChapterJSON[verse]);

          chapterAlignmentJSON[verse] = {
            alignments,
            wordBank,
          };
        }
      } else {
        const alignmentData = getAlignmentDataFromPath(wordAlignmentDataPath, projectTargetLanguagePath, chapterFile);
        chapterAlignmentJSON = alignmentData.chapterAlignmentJSON;
        targetLanguageChapterJSON = alignmentData.targetLanguageChapterJSON;
      }

      let frontMatter = 'front';

      if (frontMatter in targetLanguageChapterJSON) { // see if front matter
        saveUsfmVerse(usfmToJSONObject, targetLanguageChapterJSON, chapterNumber, frontMatter);
      }

      for (let verseNum in targetLanguageChapterJSON) { // look for extra verses in target translation not in OL
        if (!parseInt(verseNum)) {
          continue;
        } // only look at numbered verses

        if (!chapterAlignmentJSON[verseNum]) { // if this is an extra verse
          saveUsfmVerse(usfmToJSONObject, targetLanguageChapterJSON, chapterNumber, verseNum); // add verse to output
        }
      }

      //Iterate through verses of chapter alignment data,
      //and retrieve relevant information for conversion
      for (let verseNumber in chapterAlignmentJSON) {
        if (!parseInt(verseNumber)) {
          continue;
        } // only import integer based verses

        const verseAlignments = chapterAlignmentJSON[verseNumber];
        const targetVerse = targetLanguageChapterJSON[verseNumber];

        if (targetVerse === undefined) {
          continue; // skip if no target verse
        }

        const verseString = UsfmFileConversionHelpers.cleanAlignmentMarkersFromString(targetVerse);
        let verseObjects;

        try {
          verseObjects = wordaligner.merge(
            verseAlignments.alignments, verseAlignments.wordBank, verseString, true,
          );
        } catch (e) {
          if (e && e.type && e.type === 'InvalidatedAlignments') {
            //This is an expected error for invalidated alignments
            return reject({
              error: e, verse: verseNumber, chapter: chapterNumber,
            });
          }
        }
        setVerseObjectsInAlignmentJSON(usfmToJSONObject, chapterNumber, verseNumber, verseObjects);
      }
    }
    usfmToJSONObject.headers = exportHelpers.getHeaderTags(projectSaveLocation);
    //Have iterated through all chapters and verses and stored verse objects from alignment data
    //converting from verseObjects to usfm and returning string
    resolve(usfmjs.toUSFM(usfmToJSONObject, { forcedNewLines: true }));
  });
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
    const { newVerseObjects } = VerseObjectUtils.getOrderedVerseObjectsFromString(targetLanguageVerse);
    const verseObjectsCleaned = VerseObjectUtils.getWordList(newVerseObjects);
    return VerseObjectUtils.combineVerseArray(verseObjectsCleaned);
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
    verseObjectWithAlignments = wordaligner.merge(alignments, wordBank, verseString);
  } catch (e) {
    if (e && e.type && e.type === 'InvalidatedAlignments') {
      console.warn(e.message);
      return null;
    }
  }

  if (verseObjectWithAlignments) {
    const verseObjects = VerseObjectUtils.getWordsFromVerseObjects(verseObjectWithAlignments);
    const verseObjectsCleaned = VerseObjectUtils.getWordList(verseObjects);
    return VerseObjectUtils.combineVerseArray(verseObjectsCleaned);
  }
  return null;
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
    if (!_alignmentData[chapter]) {
      _alignmentData[chapter] = {};
    }

    if (!_alignmentData[chapter][verseNumber]) {
      _alignmentData[chapter][verseNumber] = {};
    }

    const alignments = wordaligner.generateBlankAlignments(ugntChapter[verseNumber]);
    const wordBank = wordaligner.generateWordBank(targetLanguageChapter[verseNumber]);
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
      const origLangVerseObjects = getOriginalVerseFromResources(projectSaveLocation, chapter, verse);
      const origLangVerseObjectsWithoutPunctuation = origLangVerseObjects && origLangVerseObjects.verseObjects ? origLangVerseObjects.verseObjects.filter(({ type }) => type === 'word') : [];
      const resetVerseAlignments = wordaligner.getBlankAlignmentDataForVerse(origLangVerseObjectsWithoutPunctuation, targetLanguageVerse);
      const wordAlignmentPathWithChapter = path.join(wordAlignmentDataPath, chapter + '.json');
      const wordAignmentChapterJSON = fs.readJSONSync(wordAlignmentPathWithChapter);
      wordAignmentChapterJSON[verse] = resetVerseAlignments;
      fs.writeJSONSync(wordAlignmentPathWithChapter, wordAignmentChapterJSON);
      resolve();
    }, 100);
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

  if (wordAlignmentDataPath && fs.existsSync(wordAlignmentDataPath)) {
    for (var chapterFile of chapters) {
      const wordAlignmentJSON = fs.readJSONSync(path.join(wordAlignmentDataPath, chapterFile));

      hasAlignments = Object.keys(wordAlignmentJSON).filter((chapterNumber) => {
        const { alignments } = wordAlignmentJSON[chapterNumber];
        return !!alignments.filter(({ bottomWords }) => bottomWords.length > 0).length;
      }).length > 0;

      if (hasAlignments) {
        return true;
      }
    }
  }
  return hasAlignments;
}
