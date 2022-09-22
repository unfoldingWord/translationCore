import path from 'path-extra';
import fs from 'fs-extra';
import xre from 'xregexp';
import React from 'react';
import { normalizer } from 'string-punctuation-tokenizer';
import { resourcesHelpers } from 'tc-source-content-updater';
import wordaligner from 'word-aligner';
import { getVerses } from 'bible-reference-range';
import {
  BIBLE_BOOKS,
  NT_ORIG_LANG,
  NT_ORIG_LANG_BIBLE,
  OT_ORIG_LANG,
  OT_ORIG_LANG_BIBLE,
} from '../common/BooksOfTheBible';
import { DEFAULT_ORIG_LANG_OWNER, USER_RESOURCES_PATH } from '../common/constants';
import {
  getUsfmForVerseContent,
  trimNewLine,
} from './FileConversionHelpers/UsfmFileConversionHelpers';
import * as BibleHelpers from './bibleHelpers';
import { getMostRecentVersionInFolder } from './originalLanguageResourcesHelpers';
import { getFilesInResourcePath, getFoldersInResourceFolder } from './ResourcesHelpers';

// eslint-disable-next-line no-useless-escape
const START_WORD_REGEX = '(?<=[\\s,.:;“"\'‘({]|^)'; // \(
// eslint-disable-next-line no-useless-escape
const END_WORD_REGEX = '(?=[\\s,.:;“"\'‘!?)}]|$)'; // !?)
export const ALIGNMENTS_KEY = 'testament2';
export const OT_BOOKS = Object.keys(BIBLE_BOOKS.oldTestament);
export const NT_BOOKS = Object.keys(BIBLE_BOOKS.newTestament);

/**
 * get keys for alignments and do sort by locale
 * @param {object} alignments
 * @param {string} langID - language to use for sorting
 * @returns {string[]}
 */
export function getSortedKeys(alignments, langID) {
  let keys = Object.keys(alignments);

  keys = keys.sort(function (a, b) {
    return a.localeCompare(b, langID, { sensitivity: 'base' });
  });

  return keys;
}

/**
 * count total alignments in alignments object
 * @param {object} alignments
 * @returns {number} - total
 */
export function getCount(alignments) {
  const keys = Object.keys(alignments);
  let count = 0;

  for (const key of keys) {
    const alignments_ = alignments[key];
    count += alignments_.length;
  }
  return count;
}

/**
 * generate multiple indices for alignments:
 *    by lemma
 *    by target
 *    by source
 *    by strong's number
 * @param {object} alignments
 * @returns {{strongAlignments: {}, lemmaAlignments: {}, targetAlignments: {}, sourceAlignments: {}}}
 */
export function indexAlignments(alignments) {
  const lemmaAlignments = {};
  const targetAlignments = {};
  const sourceAlignments = {};
  const strongAlignments = {};
  const sourceKeys = Object.keys(alignments);

  for (const sourceKey of sourceKeys) {
    if (!sourceAlignments[sourceKey]) {
      sourceAlignments[sourceKey] = [];
    }

    const targetAlignments_ = alignments[sourceKey];
    const targetKeys = Object.keys(targetAlignments_);

    for (const targetKey of targetKeys) {
      const targetAlignment = targetAlignments_[targetKey];
      const sourceLemma = targetAlignment.sourceLemma;

      if (!lemmaAlignments[sourceLemma]) {
        lemmaAlignments[sourceLemma] = [];
      }
      lemmaAlignments[sourceLemma].push(targetAlignment);
      const strong = targetAlignment.strong;

      if (!strongAlignments[strong]) {
        strongAlignments[strong] = [];
      }
      strongAlignments[strong].push(targetAlignment);
      const targetText = targetAlignment.targetText;

      if (!targetAlignments[targetText]) {
        targetAlignments[targetText] = [];
      }

      targetAlignments[targetText].push(targetAlignment);
      sourceAlignments[sourceKey].push(targetAlignment);
    }
  }
  return {
    lemmaAlignments,
    targetAlignments,
    sourceAlignments,
    strongAlignments,
  };
}

/**
 * do regex search of keys for search string
 * @param {string[]} keys
 * @param {string} searchStr - string to match
 * @param {string} flags - regex flags for searching
 * @returns {*[]}
 */
export function regexSearch(keys, searchStr, flags) {
  const found = [];
  const regex = xre(searchStr, flags);

  for (const key of keys) {
    const results = regex.test(key);

    if (results) {
      found.push(key);
    }
  }

  return found;
}

/**
 * build regex search string based on flags
 * @param {string} search - string to search
 * @param {boolean} fullWord - if true do full word matching
 * @param {boolean} caseInsensitive -if true do cse insensitive matching
 * @returns {boolean} {{search: string, flags: string}}
 */
export function buildSearchRegex(search, fullWord, caseInsensitive) {
  let flags = 'u'; // enable unicode support
  search = xre.escape(normalizer(search)); // escape any special character we are trying to match

  if (search.includes('\\?') || search.includes('\\*')) { // check for wildcard characters
    search = search.replaceAll('\\?', '\\S{1}');
    search = search.replaceAll('\\*', '\\S*');
  }

  if (fullWord) {
    search = `${START_WORD_REGEX}${search}${END_WORD_REGEX}`;
  }

  if (caseInsensitive) {
    flags += 'i';
  }

  return { search, flags };
}

/**
 * load alignments from alignments json
 * @param {string} alignmentsPath
 * @returns {null|{targetLang: string, strong: ({}|{alignments: {}}|*), alignments, lemma: ({}|{alignments: {}}|*), origLang: string, descriptor: string, source: ({}|{alignments: {}}|*), target: ({}|{alignments: {}}|*)}}
 */
export function loadAlignments(alignmentsPath) {
  try {
    const alignments = fs.readJsonSync(alignmentsPath);
    const baseName = path.parse(alignmentsPath).name;
    const [targetLang, descriptor, origLang] = baseName.split('_');

    return {
      alignments: alignments.alignments,
      targetLang,
      descriptor,
      origLang,
      target: alignments.targetAlignments,
      lemma: alignments.lemmaAlignments,
      source: alignments.sourceAlignments,
      strong: alignments.strongAlignments,
    };
  } catch (e) {
    console.warn(`loadAlignments() - could not read ${alignmentsPath}`);
  }
  return null;
}

/**
 * search object keys for matches with search string, when match is found get matching alignment from alignments
 * @param {string} searchStr - string to match
 * @param {string} flags - regex flags
 * @param {string[]} objectKeys - keys for alignments object
 * @param {object} alignments - index alignments
 * @returns {*[]}
 */
export function searchAlignmentsSub(searchStr, flags, objectKeys, alignments) {
  const foundKeys = regexSearch(objectKeys, searchStr, flags);
  const foundAlignments = [];

  for (const key of foundKeys) {
    const alignments_ = alignments[key];
    Array.prototype.push.apply(foundAlignments, alignments_);
  }
  return foundAlignments;
}

/**
 * first convert alignment refs to refsStr and then search object keys for matches with search string, when match is found get matching alignment from alignments
 * @param {string} searchStr - string to match
 * @param {string} flags - regex flags
 * @param {string[]} objectKeys - keys for alignments object
 * @param {object} alignments - index alignments
 * @param {object[]} alignmentsArray - list of alignment data that has been indexed
 * @returns {*[]}
 */
export function searchRefs(searchStr, flags, objectKeys, alignments, alignmentsArray) {
  const refsAlignments = {};

  // create refs alignments object
  for (const key of objectKeys) {
    const alignments_ = alignments[key];

    for (const index of alignments_) {
      const alignment = alignmentsArray[index];
      const refs = alignment?.refs || [];
      const refsStr = refs.join(' ');

      if (!refsAlignments[refsStr]) {
        refsAlignments[refsStr] = [];
      }
      refsAlignments[refsStr].push(index);
    }
  }

  const foundAlignments = searchAlignmentsSub(searchStr, flags, Object.keys(refsAlignments), refsAlignments);
  return foundAlignments;
}

/**
 * search object keys for matches with search string, when match is found get matching alignment from alignments
 * @param {string} searchStr - string to match
 * @param {boolean} fullWord - if true do full word matching
 * @param {boolean} caseInsensitive -if true do cse insensitive matching
 * @param {string[]} objectKeys - keys for alignments object
 * @param {object} alignments - index alignments
 * @returns {*[]}
 */
export function searchAlignments(searchStr, fullWord, caseInsensitive, objectKeys, alignments) {
  const { search, flags } = buildSearchRegex(searchStr, fullWord, caseInsensitive);
  const foundAlignments = searchAlignmentsSub(search, flags, objectKeys, alignments);
  return foundAlignments;
}

/**
 * search searchData for matches with search string, merge found alignments into found
 * @param {string} searchStr - string to match
 * @param {string} flags - regex flags
 * @param {object} searchData - data to search
 * @param {object[]} found - array to accumulate found alignments into if not duplicated
 */
export function searchAlignmentsAndAppend(searchStr, flags, searchData, found) {
  const found_ = searchAlignmentsSub(searchStr, flags, searchData.keys, searchData.alignments);

  if (found_.length) {
    for (const item of found_) {
      const duplicate = found.includes(item); // ignore duplicates

      if (!duplicate) {
        found.push(item);
      }
    }
  }
}

/**
 * search references in search data and merge found alignments into found
 * @param {string} searchStr - string to match
 * @param {string} flags - regex flags
 * @param {object} searchData - data to search
 * @param {object[]} found - array to accumulate found alignments into if not duplicated
 * @param {object[]} alignmentsArray - list of alignment data that has been indexed
 */
export function searchRefsAndAppend(searchStr, flags, searchData, found, alignmentsArray) {
  const found_ = searchRefs(searchStr, flags, searchData.keys, searchData.alignments, alignmentsArray);

  if (found_.length) {
    for (const item of found_) {
      const duplicate = found.includes(item); // ignore duplicates

      if (!duplicate) {
        found.push(item);
      }
    }
  }
}

/**
 * search one or more fields for searchStr and merge the match alignments together
 * @param {object} alignmentData - object that contains raw alignments and indices for search
 * @param {string} searchStr - string to match
 * @param {object} config - search configuration including search types and fields to search
 * @returns {*[]} - array of found alignments
 */
export function multiSearchAlignments(alignmentData, searchStr, config) {
  const { search, flags } = buildSearchRegex(searchStr, config.fullWord, config.caseInsensitive);

  const found = [];

  if (config.searchTarget) {
    searchAlignmentsAndAppend(search, flags, alignmentData.target, found);
  }

  if (config.searchStrong) {
    searchAlignmentsAndAppend(search, flags, alignmentData.strong, found);
  }

  if (config.searchLemma) {
    searchAlignmentsAndAppend(search, flags, alignmentData.lemma, found);
  }

  if (config.searchSource) {
    searchAlignmentsAndAppend(search, flags, alignmentData.source, found);
  }

  if (config.searchRefs) {
    searchRefsAndAppend(search, flags, alignmentData.source, found, alignmentData.alignments);
  }
  return found;
}

/**
 * generate a key to identify bible
 * @param {object} bible
 * @param {string} type
 * @returns {string}
 */
export function getKeyForBible(bible, type = null) {
  const bibleId = bible.resourceId || bible.bibleId;
  const key = `${bible.languageId}_${bibleId}_${(encodeParam(bible.owner))}_${bible.origLang}_${type}_${encodeParam(bible.version)}`;
  return key;
}

/**
 * filter downloaded aligned bibles and remove those that did not actually have alignments in them (by checking alignment count in index)
 * @param {object[]} downloadedAlignedBibles - aligned bibles found in user resources
 * @param {object[]} indexedResources - indexed aligned bibles found in alignmentData folder
 * @returns {*[]}
 */
export function filterAvailableAlignedBibles(downloadedAlignedBibles, indexedResources) {
  const filtered = [];

  for (const downloadedBible of downloadedAlignedBibles) {
    for (let testament = 0; testament <= 1; testament++) {
      let origLang = testament ? NT_ORIG_LANG : OT_ORIG_LANG;

      if ((downloadedBible.languageId === NT_ORIG_LANG) || (downloadedBible.languageId === OT_ORIG_LANG)) {
        if (origLang !== downloadedBible.languageId) {
          continue; // skip over incompatible testaments
        }
      }

      const found = indexedResources.find(item => (
        item.languageId === downloadedBible.languageId &&
        item.resourceId === downloadedBible.bibleId &&
        item.owner === downloadedBible.owner &&
        item.origLang === origLang &&
        item.version === downloadedBible.version
      ));

      if (found) {
        if (found.alignmentCount) {
          filtered.push(found);
        }
      } else {
        const newResource = {
          ...downloadedBible,
          origLang,
          resourceId: downloadedBible.bibleId,
        };

        filtered.push(newResource);
      }
    }
  }
  return filtered;
}

/**
 * parse the resource key into resource object
 * @param {string} name
 * @returns {{owner: string, alignmentCount: string, resourceId: string, languageId: string, origLang: string, type: string, version: string}}
 */
export function parseResourceKey(name) {
  const parts = (name || '').split('_');
  let [
    languageId,
    resourceId,
    owner,
    origLang,
    type,
    version,
    alignmentCount,
  ] = parts;
  owner = decodeURIComponent(owner);
  version = decodeURIComponent(version);

  return {
    languageId,
    resourceId,
    owner,
    origLang,
    type,
    version,
    alignmentCount,
  };
}

/**
 * return list of indexed aligned bibles found in alignmentData folder
 * @param {string} alignmentDataDir - folder to search
 * @returns {*[]}
 */
export function getAlignmentIndices(alignmentDataDir) {
  const resources = [];
  const resourcesIndexed = readDirectory(alignmentDataDir, false, true, '.json');

  for (const fileName of resourcesIndexed) {
    // const fileFolder = path.join(resourcesIndexed, fileName);
    // ~/translationCore/alignmentData/en_ult_unfoldingWord_hbo_testament_v0_275433.json
    const name = path.parse(fileName).name;
    let {
      languageId,
      resourceId,
      owner,
      origLang,
      type,
      version,
      alignmentCount,
    } = parseResourceKey(name);

    if (type !== ALIGNMENTS_KEY) {
      continue;
    }

    alignmentCount = parseInt(alignmentCount, 10);
    resources.push({
      languageId,
      resourceId,
      owner,
      origLang,
      version,
      alignmentCount,
    });
  }
  return resources;
}

/**
 * test if dirPath is actually a folder
 * @param {string} dirPath
 * @returns {boolean|*} true if folder
 */
function isDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      return fs.statSync(dirPath).isDirectory();
    }
    // eslint-disable-next-line no-empty
  } catch (e) { }
  return false;
}

/**
 * read the directory and filter by folders or file extensions
 * @param {string} dirPath - path to folder to read
 * @param {boolean} foldersOnly - if true then only return folders
 * @param {boolean} sort - if true then sort the results
 * @param {string} extension - optional file extension to match
 * @returns {*[]|*}
 */
export function readDirectory(dirPath, foldersOnly = true, sort = true, extension = null) {
  if (isDirectory(dirPath)) {
    let content = fs.readdirSync(dirPath).filter(item => {
      if (item === '.DS_Store') {
        return false;
      }

      if (foldersOnly) {
        return isDirectory(path.join(dirPath, item));
      }

      if (extension) {
        const ext = path.parse(item).ext;
        return ext === extension;
      }
      return true;
    });

    if (sort) {
      content = content.sort();
    }
    return content;
  }
  return [];
}

// export async function downloadBibles(resource, alignmentsFolder) {
//   const SourceContentUpdater = new sourceContentUpdater();
//
//   if (!resource.version) {
//     const owner = resource.owner;
//     const retries = 5;
//     const stage = resource.stage !== 'prod' ? 'preprod' : undefined;
//     const resourceName = `${resource.languageId}_${resource.resourceId}`;
//     const latest = await apiHelpers.getLatestRelease(owner, resourceName, retries, stage);
//     const release = latest && latest.release;
//     let version = release && release.tag_name;
//
//     if (version) {
//       resource.version = version;
//     }
//   }
//
//   const destinationPath = path.join(alignmentsFolder, `${resource.owner}_${resource.languageId}_${resource.resourceId}`);
//
//   try {
//     console.log('downloadBibles() - downloading resource', resource);
//     await SourceContentUpdater.downloadAndProcessResource(resource, destinationPath);
//     console.log('downloadBibles() - download done');
//   } catch (e) {
//     console.warn('downloadBibles() - download failed');
//   }
//
//   // /Users/blm/translationCore/alignmentData/unfoldingWord_en_ult/en/bibles/ult/v40_unfoldingWord
//   const biblePath = path.join(destinationPath, `${resource.languageId}/bibles/${resource.resourceId}/${resource.version}_${resource.owner}`);
//   const destinationBiblePath = path.join(destinationPath, 'bible');
//
//   if (fs.existsSync(destinationBiblePath)) {
//     fs.removeSync(destinationBiblePath);
//   }
//   fs.moveSync(biblePath, destinationBiblePath);
// }

/**
 * URI encode param and replace _ or . with URI codes to prevent problems parsing as key or filename
 * @param {string} param
 * @returns {string}
 */
export function encodeParam(param) {
  let encoded = encodeURIComponent(param);
  encoded = encoded.replaceAll('_', '%5F');
  encoded = encoded.replaceAll('.', '%2E');
  return encoded;
}

async function doCallback(callback, percent) {
  if (callback) {
    await callback(Math.round(percent));
  }
}

/**
 * open Bible json data and extract alignment data for specific testament
 * @param {string} resourceFolder
 * @param {object} resource
 * @returns {{strongAlignments: {alignments: {}}, alignments: *[], lemmaAlignments: {alignments: {}}, targetAlignments: {alignments: {}}, sourceAlignments: {alignments: {}}}}
 */
export async function getAlignmentsFromResource(resourceFolder, resource, callback = null) {
  try {
    // /Users/blm/translationCore/resources/en/bibles/ult/v40_Door43-Catalog
    const alignmentsFolder = path.join(resourceFolder, '../alignmentData');
    const bibleVersionsPath = path.join(resourceFolder, `${resource.languageId}/bibles/${resource.resourceId}`);
    const latestVersionPath = resourcesHelpers.getLatestVersionInPath(bibleVersionsPath, resource.owner);

    if (!latestVersionPath) {
      console.warn(`getAlignmentsFromResource() - no bibles found for ${resource.owner} in ${bibleVersionsPath}`);
    } else {
      const version = resourcesHelpers.splitVersionAndOwner(path.parse(latestVersionPath).base || '').version;
      resource.version = version;

      let alignments = [];
      console.log(`getAlignmentsFromResource() - get alignments for ${resource.origLang}`);
      const books = resource.origLang === NT_ORIG_LANG ? Object.keys(BIBLE_BOOKS.newTestament) : Object.keys(BIBLE_BOOKS.oldTestament);

      const total = books.length;
      let count = -1;

      for (const bookId of books) {
        const percent = ++count * 25 / total;
        // eslint-disable-next-line no-await-in-loop
        await doCallback(callback, percent);
        const bookPath = path.join(latestVersionPath, bookId);

        if (fs.existsSync(bookPath)) {
          const chapters = {};
          const parsedUsfm = {
            chapters,
            headers: [],
          };

          const chapterFiles = fs.readdirSync(bookPath)
            .filter(file => path.extname(file) === '.json');

          for (const chapterFile of chapterFiles) {
            const chapterPath = path.join(bookPath, chapterFile);
            const chapterJson = fs.readJsonSync(chapterPath);
            const c = path.parse(chapterPath).name;
            chapters[c] = chapterJson;
          }

          const manifest = {};
          // eslint-disable-next-line no-await-in-loop
          const bookAlignments = getALignmentsFromJson(parsedUsfm, manifest, bookId);
          Array.prototype.push.apply(alignments, bookAlignments);
        }
      }

      // merge alignments
      const alignments_ = {};
      const uniqueAlignments = [];
      let l = alignments.length;
      let stepSize = Math.round(l / 5);

      for (let i = 0; i < l; i++) {
        if (i % stepSize === 0) {
          const percent = 25 + 25 * i / l;
          // eslint-disable-next-line no-await-in-loop
          await doCallback(callback, percent);
        }

        const alignment = alignments[i];
        const {
          sourceText,
          targetText,
          ref,
        } = alignment;

        if (!alignments_[sourceText]) {
          alignments_[sourceText] = {};
        }

        const sourceALignment = alignments_[sourceText];

        if (!sourceALignment[targetText]) {
          alignment.refs = [ref];
          delete alignment.ref;
          const index = uniqueAlignments.length;
          uniqueAlignments.push(alignment);
          sourceALignment[targetText] = [index];
        } else {
          const index = sourceALignment[targetText];
          const matchedAlignment = uniqueAlignments[index];
          matchedAlignment.refs.push(ref);
        }
      }

      alignments = uniqueAlignments;

      console.log(`getAlignmentsFromResource() for ${resource.origLang}, ${alignments.length} alignments, indexing`);
      const outputFile = path.join(alignmentsFolder, `${resource.languageId}_${resource.resourceId}_${(encodeParam(resource.owner))}_${resource.origLang}_${ALIGNMENTS_KEY}_${encodeParam(resource.version)}_${alignments.length}.json`);
      const lemmaAlignments = { alignments: {} };
      const targetAlignments = { alignments: {} };
      const sourceAlignments = { alignments: {} };
      const strongAlignments = { alignments: {} };
      l = alignments.length;
      stepSize = Math.round(l / 5);

      for (let i = 0; i < l; i++) {
        if (i % stepSize === 0) {
          const percent = 50 + 25 * i / l;
          // eslint-disable-next-line no-await-in-loop
          await doCallback(callback, percent);
        }

        const alignment = alignments[i];
        const {
          sourceText,
          sourceLemma,
          strong,
          targetText,
        } = alignment;
        appendToALignmentIndex(sourceAlignments.alignments, sourceText, i);
        appendToALignmentIndex(strongAlignments.alignments, strong, i);
        appendToALignmentIndex(lemmaAlignments.alignments, sourceLemma, i);
        appendToALignmentIndex(targetAlignments.alignments, targetText, i);
      }

      console.log(`getAlignmentsFromResource() for ${resource.origLang}, getting keys`);
      await doCallback(callback, 80);
      strongAlignments.keys = getSortedKeys(strongAlignments.alignments, 'en');
      await doCallback(callback, 82);
      lemmaAlignments.keys = getSortedKeys(lemmaAlignments.alignments, resource.origLang);
      await doCallback(callback, 84);
      sourceAlignments.keys = getSortedKeys(sourceAlignments.alignments, resource.origLang);
      await doCallback(callback, 90);
      targetAlignments.keys = getSortedKeys(targetAlignments.alignments, resource.languageId);
      await doCallback(callback, 95);
      const alignmentData = {
        alignments,
        lemmaAlignments,
        targetAlignments,
        sourceAlignments,
        strongAlignments,
      };
      fs.outputJsonSync(outputFile, alignmentData);
      return alignmentData;
    }
  } catch (e) {
    console.warn('getAlignmentsFromResource() - parsing alignments failed', e);
  }
}

/**
 * open Bible json data and extract alignment data for both testaments
 * @param {string} resourceFolder
 * @param {object} resource_
 */
export function getAlignmentsFromDownloadedBible(resourceFolder, resource_) {
  for (let testament = 0; testament <= 1; testament++) {
    const origLang = testament ? NT_ORIG_LANG : OT_ORIG_LANG;
    const resource = {
      ...resource_,
      origLang,
    };
    getAlignmentsFromResource(resourceFolder, resource);
  }

  console.log('done');
}

/**
 * append an alignment to alignments
 * @param alignments
 * @param sourceText
 * @param alignment
 */
function appendToALignmentIndex(alignments, sourceText, alignment) {
  if (!alignments[sourceText]) {
    alignments[sourceText] = [];
  }
  alignments[sourceText].push(alignment);
}

/**
 * generate the target language bible from parsed USFM and manifest data
 * @param {Object} parsedUsfm - The object containing usfm parsed by chapters
 * @param {Object} manifest
 * @param {String} selectedProjectFilename
 * @return {Promise<any>}
 */
const getALignmentsFromJson = (parsedUsfm, manifest, selectedProjectFilename) => {
  try {
    const chaptersObject = parsedUsfm.chapters;
    const bookID = manifest?.project?.id || selectedProjectFilename;
    const bookAlignments = [];

    Object.keys(chaptersObject).forEach((chapter) => {
      const bibleChapter = {};
      const verses = Object.keys(chaptersObject[chapter]);
      const chapterRef = `${bookID} ${chapter}:`;

      // check if chapter has alignment data
      const alignmentIndex = verses.findIndex(verse => {
        const verseParts = chaptersObject[chapter][verse];
        let alignmentData = false;

        for (let part of verseParts.verseObjects) {
          if (part.type === 'milestone') {
            alignmentData = true;
            break;
          }
        }
        return alignmentData;
      });
      const alignmentData = (alignmentIndex >= 0);

      if (!alignmentData) {
        return;
      }

      verses.forEach((verse) => {
        const verseRef = `${chapterRef}${verse}`;
        const verseParts = chaptersObject[chapter][verse];
        let verseText = getUsfmForVerseContent(verseParts);
        bibleChapter[verse] = trimNewLine(verseText);

        if (alignmentData) {
          const object = wordaligner.unmerge(verseParts);

          for (const alignment of object.alignment) {
            const strongs = [];
            const lemmas = [];
            const targets = [];
            const sources = [];
            const morphs = [];

            for (const originalWord of alignment.topWords) {
              const {
                strong,
                lemma,
                word,
                morph,
              } = originalWord;
              strongs.push(strong);
              lemmas.push(lemma);
              sources.push(word);
              morphs.push(morph);
            }

            for (const targetWord of alignment.bottomWords) {
              targets.push(targetWord.word);
            }
            bookAlignments.push({
              sourceText: normalizer(sources.join(' ')),
              sourceLemma: normalizer(lemmas.join(' ')),
              strong: strongs.join(' '),
              morph: morphs.join(' '),
              targetText: normalizer(targets.join(' ')),
              ref: verseRef,
            });
          }
        }
      });
    });

    console.log(`getALignmentsFromJson() for book ${bookID}, ${bookAlignments.length} alignments`);
    return bookAlignments;
  } catch (error) {
    console.log('getALignmentsFromJson() error:', error);
    throw (error);
  }
};

/**
 * get list of searchable bibles loaded in resources
 * @param translationCoreFolder
 * @returns {*[]}
 */
export function getSearchableAlignments(translationCoreFolder) {
  try {
    console.log('getSearchableAlignments() - getting aligned bibles');
    const resourceDir = path.join(translationCoreFolder, 'resources');
    const downloadedAlignedBibles = getAlignedBibles(resourceDir);
    console.log('getSearchableAlignments() - getting alignment indexes for bibles');
    const indexedResources = getAlignmentIndices(path.join(translationCoreFolder, 'alignmentData'));

    // filter selections
    console.log('getSearchableAlignments() - filtering aligned bibles');
    const filtered = filterAvailableAlignedBibles(downloadedAlignedBibles, indexedResources);
    return filtered;
  } catch (e) {
    console.error('getSearchableAlignments() - could not load available bibles');
  }
}

/**
 * aligned bibles found in user resources
 * @param {string} resourceDir - path to user resources
 * @param {boolean} alignedBiblesOnly - if true then filter for alignment
 * @returns {*[]}
 */
export function getAvailableBibles(resourceDir, alignedBiblesOnly = true) {
  const alignedBibles = [];

  try {
    const languages = readDirectory(resourceDir, true, true, null);

    for (const languageId of languages) {
      const biblesFolder = path.join(resourceDir, languageId, 'bibles');
      const bibles = readDirectory(biblesFolder, true, true, null);

      for (const bibleId of bibles) {
        const biblePath = path.join(biblesFolder, bibleId);
        const owners = resourcesHelpers.getLatestVersionsAndOwners(biblePath) || {};

        for (const owner of Object.keys(owners)) {
          try {
            const biblePath = owners[owner];
            let manifest = null;
            const manifestPath = path.join(biblePath, 'manifest.json');

            if (fs.pathExistsSync(manifestPath)) {
              manifest = fs.readJsonSync(manifestPath);
            }

            let useBible = false;
            const subject = manifest?.subject;

            if (alignedBiblesOnly) {
              let isAligned = (subject === 'Aligned Bible');

              if (!isAligned) { // check for original bibles
                if ((languageId === NT_ORIG_LANG) || (languageId === OT_ORIG_LANG)) {
                  if ((bibleId === NT_ORIG_LANG_BIBLE) || (bibleId === OT_ORIG_LANG_BIBLE)) {
                    isAligned = true;
                  }
                }
              }
              useBible = isAligned;
            } else {
              useBible = !!subject;
            }

            const version = resourcesHelpers.splitVersionAndOwner(path.basename(biblePath))?.version;

            if (useBible) {
              alignedBibles.push({
                languageId,
                bibleId,
                owner,
                version,
                biblePath,
              });
            }
          } catch (e) {
            console.error(`getAlignedBibles() - could not load ${biblePath} for ${owner}`, e);
          }
        }
      }
    }
  } catch (e) {
    console.error(`getAlignedBibles() - error getting bibles`, e);
  }
  return alignedBibles;
}

/**
 * aligned bibles found in user resources
 * @param {string} resourceDir - path to user resources
 * @returns {*[]}
 */
export function getAlignedBibles(resourceDir) {
  return getAvailableBibles(resourceDir, true);
}

/**
 * looks up verses for resource key and caches them
 * @param {string} bibleKey
 * @param {string} ref
 * @param {object} bibles
 */
export function getVerseForKey(bibleKey, ref, bibles) {
  try {
    const {
      languageId,
      resourceId,
      owner,
      version,
    } = parseResourceKey(bibleKey);
    const bibleVersion = resourcesHelpers.addOwnerToKey(version, owner);
    const biblePath = path.join(USER_RESOURCES_PATH, languageId, 'bibles', resourceId, bibleVersion);

    if (fs.existsSync(biblePath)) {
      return getVerse(biblePath, ref, bibles, bibleVersion);
    }
    console.warn(`getVerseForKey() - could not fetch verse for ${bibleVersion} - ${ref} in path ${biblePath}`);
  } catch (e) {
    console.log(`getVerseForKey() - could not fetch verse for ${bibleKey} - ${ref}`);
  }
  return '';
}

/**
 * looks up verses and caches them
 * @param {string} biblePath
 * @param {string} ref
 * @param {object} bibles
 * @param {string} bibleKey
 */
export function getVerse(biblePath, ref, bibles, bibleKey) {
  const [bookId, ref_] = (ref || '').trim().split(' ');

  if (!bibles[bibleKey]) {
    bibles[bibleKey] = {};
  }

  const bible = bibles[bibleKey];

  if ( bookId && ref_ ) {
    const [chapter, verse] = ref_.split(':');

    if (chapter && verse) {
      if (bible?.[bookId]?.[chapter]) {
        const verseData = getVerses(bible?.[bookId], ref_);
        return verseData;
      }

      if (!bible?.[bookId]) {
        bible[bookId] = {};
      }

      const chapterPath = path.join(biblePath, bookId, chapter + '.json');

      if (fs.existsSync(chapterPath)) {
        try {
          const chapterData = fs.readJsonSync(chapterPath);

          if (chapterData) {
            for (const verseRef of Object.keys(chapterData)) {
              let verseData = chapterData[verseRef];

              if (typeof verseData !== 'string') {
                verseData = getUsfmForVerseContent(verseData);
              }

              if (!bible?.[bookId]?.[chapter]) {
                bible[bookId][chapter] = {};
              }

              bible[bookId][chapter][verseRef] = verseData;
            }
          }

          const verseData = getVerses(bible?.[bookId], ref_);
          return verseData;
        } catch (e) {
          console.log(`getVerse() - could not read ${chapterPath}`);
        }
      }
    }
  }
  return '';
}

/**
 * try to find closest matches for target text in verse text
 * @param targetText
 * @param verseText
 * @returns {{targetPos: *[], targetParts: *}}
 */
export function findBestMatchesForTargetText(targetText, verseText) {
  let targetParts = targetText.split(' ');
  let targetPos = [];
  let targetSearchRegEx = [];
  let pos_ = 0;
  let aborted = false;

  // find first position of words in verse
  for (let i = 0; i < targetParts.length; i++) {
    const searchWord = targetParts[i];

    if (!searchWord) {
      break;
    }

    const { search, flags } = buildSearchRegex(searchWord, true, false);
    const regex = xre(search, flags);
    targetSearchRegEx.push(regex);
    const results = xre.exec(verseText, regex, pos_);
    let newPos = results?.index;

    if (newPos >= 0) {
      targetPos.push(newPos);
      newPos += searchWord.length;
      pos_ = newPos;
    } else {
      aborted = true;
      break;
    }
  }

  if (!aborted && targetParts.length > 1) {
    // nudge matched words closer to following word
    for (let i = targetParts.length - 2; i >= 0; i--) {
      const searchWord = targetParts[i];
      let bestPos = targetPos[i];
      const endPos = targetPos[i + 1] - searchWord.length;
      const regex = targetSearchRegEx[i];

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const results = xre.exec(verseText, regex, bestPos + searchWord.length);
        let newPos = results?.index;

        if ((newPos >= 0) && (newPos <= endPos)) {
          bestPos = newPos;
          targetPos[i] = bestPos;
        } else {
          break;
        }
      }
    }
  }
  return { targetParts, targetPos };
}

/**
 * add highlighting to verse
 * @param {string} verseText
 * @param {string} targetText
 * @returns {*[]}
 */
export function highlightSelectedTextInVerse(verseText, targetText) {
  const verseParts = [];

  if (targetText) {
    // first try easy case
    const pos = verseText.indexOf(targetText);

    if (pos >= 0) {
      verseParts.push(verseText.substring(0, pos));
      verseParts.push(<span style={ { backgroundColor: 'var(--highlight-color)' } }> {targetText} </span>);
      verseParts.push(verseText.substring(pos + targetText.length));
    } else {
      const { targetParts, targetPos } = findBestMatchesForTargetText(targetText, verseText);
      let lastPos = 0;

      // break into parts with spans for target text
      for (let i = 0; i < targetPos.length; i++) {
        const searchWord = targetParts[i];
        const pos = targetPos[i];

        if (pos >= 0) {
          verseParts.push(verseText.substring(lastPos, pos));
          verseParts.push(<span style={{ backgroundColor: 'var(--highlight-color)' }}> {searchWord} </span>);
          lastPos = pos + searchWord.length;
        } else {
          break;
        }
      }

      if (lastPos < verseText.length) {
        verseParts.push(verseText.substring(lastPos));
      }
    }
  } else {
    verseParts.push(verseText);
  }

  const output = [];

  for (let versePart of verseParts) {
    if (typeof versePart === 'string') {
      let pos = -1;

      while ((pos = versePart.indexOf('\n')) >= 0) {
        output.push(versePart.substring(0, pos));
        output.push(<br/>);
        const remainder = versePart.substring(pos + 1);
        versePart = remainder;
      }
      output.push(versePart);
    } else {
      output.push(versePart);
    }
  }

  const verseContent = output.filter(item => item);
  return verseContent;
}

export function indexTwords(resourcesFolder, resource_) {
  // for D43-Catalog:
  // /Users/blm/translationCore/resources/el-x-koine/translationHelps/translationWords/v0.29_Door43-Catalog/kt/groups/1co
  // for other owners:
  // /Users/blm/translationCore/resources/en/translationHelps/translationWordsLinks/v17_unfoldingWord/kt/groups/1ch

  let languageId = resource_.languageId;
  let subFolder = 'translationWordsLinks';
  let filterBooks = null;
  const checks = [];
  const bookIndex = {};
  const groupIndex = {};

  if (resource_.owner === DEFAULT_ORIG_LANG_OWNER) {
    const olForBook = BibleHelpers.getOrigLangforBook(resource_.bookId);
    subFolder = 'translationWords';
    languageId = olForBook.languageId;
    filterBooks = (olForBook.languageId === OT_ORIG_LANG) ? OT_BOOKS : NT_BOOKS;
  }

  const tWordsPath = path.join(resourcesFolder, `${languageId}/translationHelps/${subFolder}`);
  const latestTWordsVersion = getMostRecentVersionInFolder(tWordsPath, resource_.owner);

  if (latestTWordsVersion) {
    const latestTwordsPath = path.join(tWordsPath, latestTWordsVersion);
    const resource = {
      ...resource_,
      version: latestTWordsVersion,
      tWordsLangID: languageId,
      filterBooks,
      tWordsPath: latestTwordsPath,
    };

    if (fs.existsSync(latestTwordsPath)) {
      console.log(`Found ${latestTWordsVersion}`);
      const catagories = getFoldersInResourceFolder(latestTwordsPath);

      for (const catagory of catagories) {
        const booksPath = path.join(latestTwordsPath, catagory, 'groups');
        let books = getFoldersInResourceFolder(booksPath);

        if (filterBooks) {
          const filteredBooks = books.filter(bookId => filterBooks.includes(bookId));
          books = filteredBooks;
        }

        for (const bookId of books) {
          const bookPath = path.join(booksPath, bookId);
          const groupFiles = getFilesInResourcePath(bookPath, '.json');

          for (const groupFile of groupFiles) {
            const groupFilePath = path.join(bookPath, groupFile);

            try {
              const data = fs.readJsonSync(groupFilePath);
              const groupId = groupFile.split('.json')[0];

              if (!groupIndex[groupId]) {
                groupIndex[groupId] = [];
              }

              const items = groupIndex[groupId];

              for (const item of data) {
                console.log(`found item ${item}`);
                const location = checks.length;
                checks.push(item);

                if (!bookIndex[bookId]) {
                  bookIndex[bookId] = {};
                }

                const chapters = bookIndex[bookId];
                const reference = item?.contextId?.reference;
                const chapter = reference?.chapter;

                if (!chapters[chapter]) {
                  chapters[chapter] = {};
                }

                const verses = chapters[chapter];
                const verse = reference?.verse;

                if (!verses[verse]) {
                  verses[verse] = [];
                }

                const tWords = verses[verse];
                tWords.push(location);
                items.push(location);
              }
              // console.log(data);
            } catch (e) {
              console.warn(`could not read ${groupFilePath}`);
            }
          }
        }
      }
      return {
        bookIndex,
        groupIndex,
        checks,
        resource,
      };
    }
  }
  return null;
}
