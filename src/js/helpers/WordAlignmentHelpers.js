import fs from 'fs-extra';
import path from 'path-extra';
import usfmjs from 'usfm-js';
import wordaligner, { VerseObjectUtils } from 'word-aligner';
import { verseHelpers } from 'tc-ui-toolkit';
//helpers
import {
  DEFAULT_OWNER,
  STATIC_RESOURCES_PATH,
  USER_RESOURCES_PATH,
} from '../common/constants';
import * as manifestHelpers from './manifestHelpers';
import * as exportHelpers from './exportHelpers';
import * as ResourcesHelpers from './ResourcesHelpers';
import * as UsfmFileConversionHelpers from './FileConversionHelpers/UsfmFileConversionHelpers';
import * as LoadHelpers from './LoadHelpers';
import ResourceAPI from './ResourceAPI';
import * as BibleHelpers from './bibleHelpers';

/**
 * Helper method to retrieve the original language chapter according to manifest
 * @param {object} manifest
 * @param {string} basePath
 * @param {number|string} chapter
 * @returns {object} - Chapter data
 */
export function getOriginalChapterFromManifest(manifest, chapter, basePath) {
  const { project } = manifest;
  const { languageId, bibleId } = BibleHelpers.getOrigLangforBook(project.id);
  const origLangChapterPath = ResourceAPI.getLatestVersion(path.join(basePath, languageId, 'bibles', bibleId));
  const origLangChapterPathWithBook = path.join(origLangChapterPath, project.id, chapter + '.json');
  let chapterData = null;

  if (fs.existsSync(origLangChapterPathWithBook)) {
    chapterData = fs.readJSONSync(origLangChapterPathWithBook);
  }
  return chapterData;
}

/**
 * Helper method to retrieve the original language chapter according to manifest in project folder
 * @param {string} projectPath
 * @param {number|string} chapter - Current chapter
 * @param {string} basePath - base path for resources
 * @returns {object} - Chapter data
 */
export function getOriginalChapterFromResources(projectPath, chapter, basePath = STATIC_RESOURCES_PATH) {
  let manifest = manifestHelpers.getProjectManifest(projectPath);
  let chapterData = getOriginalChapterFromManifest(manifest, chapter, basePath);
  return chapterData;
}

/**
 * Helper method to retrieve the greek verse according to specified manifest
 * @param {string} projectPath
 * @param {number} chapter - Current chapter
 * @param {string} verse - current verse
 * @returns {object} - Verses in the chapter object
 */
export const getOriginalVerseFromResources = (projectPath, chapter, verse) => {
  const chapterData = getOriginalChapterFromResources(projectPath, chapter);
  return chapterData && chapterData[verse];
};

/**
 * Returns paths to the alignment data if it exits.
 * @param {string} projectPath - Full path to the users project to be exported
 */
export const getAlignmentPathsFromProject = (projectPath) => {
  let chapters = [];
  //Retrieve project manifest, and paths for reading
  const { project } = manifestHelpers.getProjectManifest(projectPath);

  if (project && project.id) {
    const wordAlignmentDataPath = path.join(projectPath, '.apps', 'translationCore', 'alignmentData', project.id);
    const projectTargetLanguagePath = path.join(projectPath, project.id);

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
 * search through verseAlignments for word and get occurrences
 * @param {object} verseAlignments
 * @param {string|number} matchVerse
 * @param {string} word
 * @return {number}
 */
export function getWordCountInVerse(verseAlignments, matchVerse, word) {
  let matchedAlignment = null;

  for (let alignment of verseAlignments[matchVerse]) {
    for (let topWord of alignment.topWords) {
      if (topWord.word === word) {
        matchedAlignment = topWord;
        break;
      }
    }

    if (matchedAlignment) {
      break;
    }
  }

  const wordCount = matchedAlignment && matchedAlignment.occurrences;
  return wordCount || 0;
}

/**
 * get all the alignments for verse from nested array (finds zaln objects)
 * @param {array} verseSpanAlignments
 * @return {*[]}
 */
export function getVerseAlignments(verseSpanAlignments) {
  let alignments = [];

  if (verseSpanAlignments) {
    for (let alignment of verseSpanAlignments) {
      if (alignment.tag === 'zaln') {
        alignments.push(alignment);
      }

      if (alignment.children) {
        const subAlignments = getVerseAlignments(alignment.children);

        if (subAlignments.length) {
          alignments = alignments.concat(subAlignments);
        }
      }
    }
  }
  return alignments;
}

/**
 * generate blank alignments for all the verses in a verse span
 * @param {string} verseSpan
 * @param {object} origLangChapterJson
 * @param {object} blankVerseAlignments - object to return verse alignments
 * @return {{low, hi}} get range of verses in verse span
 */
export function getRawAlignmentsForVerseSpan(verseSpan, origLangChapterJson, blankVerseAlignments) {
  const { low, hi } = verseHelpers.getVerseRangeFromSpan(verseSpan);

  // generate raw alignment data for each verse in range
  for (let verse = low; verse <= hi; verse++) {
    const originalVerse = origLangChapterJson[verse];

    if (originalVerse) {
      const blankAlignments = wordaligner.generateBlankAlignments(originalVerse);
      blankVerseAlignments[verse] = blankAlignments;
    }
  }

  return { low, hi };
}

/**
 * business logic for convertAlignmentsFromVerseSpansToVerse:
 *    for each alignment determines the original language verse it references, adds reference, and updates occurrence(s)
 * @param {object} verseSpanData - aligned output data - will be modified with verse span fixes
 * @param {number} low - low verse number of span
 * @param {number} hi - high verse number of span
 * @param {object} blankVerseAlignments - raw verse alignments for extracting word counts for each verse
 * @param {number} chapterNumber
 */
export function convertAlignmentsFromVerseSpansToVerseSub(verseSpanData, low, hi, blankVerseAlignments, chapterNumber) {
  const verseSpanAlignments = verseSpanData && verseSpanData.verseObjects;
  const alignments = getVerseAlignments(verseSpanAlignments);

  for (let alignment of alignments) {
    const word = alignment.content;
    let occurrence = alignment.occurrence;

    // transform occurrence(s) from verse span based to verse reference
    for (let verse = low; verse <= hi; verse++) {
      const wordCount = getWordCountInVerse(blankVerseAlignments, verse, word);

      if (occurrence <= wordCount) { // if inside this verse, add reference
        alignment.ref = `${chapterNumber}:${verse}`;
        alignment.occurrences = wordCount;
        alignment.occurrence = occurrence;
        break;
      } else {
        occurrence -= wordCount; // subtract counts for this verse
      }
    }
  }
}

/**
 * goes back to verse spans and for each alignment determines the original language verse it references, adds reference, and updates occurrence(s)
 * @param {array} verseSpans - list of verse spans to convert
 * @param {string} projectPath
 * @param {number} chapterNumber
 * @param {object} chapterAlignments - contains alignment data for chapter
 */
export function convertAlignmentsFromVerseSpansToVerse(verseSpans, projectPath, chapterNumber, chapterAlignments) {
  if (verseSpans.length) {
    const blankVerseAlignments = {};
    const origLangChapterJson = getOriginalChapterFromResources(projectPath, chapterNumber, USER_RESOURCES_PATH);

    for (let verseSpan of verseSpans) {
      const { low, hi } = getRawAlignmentsForVerseSpan(verseSpan, origLangChapterJson, blankVerseAlignments);
      const verseSpanData = chapterAlignments && chapterAlignments[verseSpans];
      convertAlignmentsFromVerseSpansToVerseSub(verseSpanData, low, hi, blankVerseAlignments, chapterNumber);
    }
  }
}

/**
 * test to see if verse is a verseSpan
 * @param {string|number} verse
 * @return {boolean}
 */
export function isVerseSpan(verse) {
  return verse.toString().includes('-');
}

/**
 * Method to retrieve project alignment data and perform conversion in usfm 3
 * TODO: this will eventually become deprecated in favor of a separate conversion tool either imported dirrectly or accessed through the tool api.
 * @param {string} wordAlignmentDataPath
 * @param {string} projectTargetLanguagePath
 * @param {array} chapters aligned
 * @param {string} projectPath - Full path to the users project to be exported
 * @param {string} projectID
 * @returns {Promise} USFM data for book
 */
export const convertAlignmentDataToUSFM = (wordAlignmentDataPath, projectTargetLanguagePath,
  chapters, projectPath, projectID) => {
  if (!chapters) {
    chapters = [];
  }

  return new Promise((resolve, reject) => {
    let usfmToJSONObject = { headers: {}, chapters: {} };
    let expectedChapters = 0;

    // get the bibleIndex to get the list of expected chapters
    const bibleIndex = ResourcesHelpers.getBibleIndex('en', 'ult', DEFAULT_OWNER);

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

      for (let targetVerse in targetLanguageChapterJSON) { // look for extra verses in target translation not in OL
        const verseNum = parseInt(targetVerse);

        if (!verseNum) {
          continue;
        } // only look at numbered verses

        let isExtraVerse = !chapterAlignmentJSON[targetVerse];

        if (isExtraVerse) { // double check to make sure it is not in verse span
          for (let verse_ in chapterAlignmentJSON) {
            if (isVerseSpan(verse_)) {
              const { low, hi } = verseHelpers.getVerseRangeFromSpan(verse_);

              if ((verseNum >= low) && (verseNum <= hi)) {
                isExtraVerse = false;
                break;
              }
            }
          }
        }

        if (isExtraVerse) { // if this is an extra verse
          saveUsfmVerse(usfmToJSONObject, targetLanguageChapterJSON, chapterNumber, targetVerse); // add verse to output
        }
      }

      const verseSpans = [];

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

        if (isVerseSpan(verseNumber)) {
          verseSpans.push(verseNumber); // keep track of verse spans for later cleanup of alignment occurrence(s), ref
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
      convertAlignmentsFromVerseSpansToVerse(verseSpans, projectPath, chapterNumber, usfmToJSONObject && usfmToJSONObject.chapters && usfmToJSONObject.chapters[chapterNumber]);
    }

    usfmToJSONObject.headers = exportHelpers.getHeaderTags(projectPath);
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
