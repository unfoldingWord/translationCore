import path from 'path-extra';
import fs from 'fs-extra';
import xre from 'xregexp';
import React from 'react';
import env from 'tc-electron-env';
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
export const ALIGNMENTS_KEY = 'alignmentsIndex2';
export const TWORDS_KEY = 'tWordsIndex';
export const OT_BOOKS = Object.keys(BIBLE_BOOKS.oldTestament);
export const NT_BOOKS = Object.keys(BIBLE_BOOKS.newTestament);
const TCORE_FOLDER = path.join(env.home(), 'translationCore');
export const ALIGNMENT_DATA_DIR = path.join(TCORE_FOLDER, 'alignmentData');

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
      bibleIndex: alignments.bibleIndex,
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
      pushUnique(found, item);
    }
  }
}

/**
 * push item if it is not already in array
 * @param array
 * @param item
 */
function pushUnique(array, item) {
  const duplicate = array.includes(item); // ignore duplicates

  if (!duplicate) {
    array.push(item);
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
      pushUnique(found, item);
    }
  }
}

/**
 * look in source index for match to source text
 * @param {string} sourceText
 * @param {object} sourceIndex
 * @returns {*[]}
 */
function getSourceIndices(sourceText, sourceIndex) {
  let indices;
  let sourceAlignments = sourceIndex[sourceText];

  // try to find matches in alignment data to get lemma and morph
  if (sourceAlignments && sourceAlignments.length) {
    indices = [sourceAlignments[0]];
  } else {
    const sourceWords = sourceText.split(' ');
    indices = [];

    for (const sourceWord of sourceWords) {
      sourceAlignments = sourceIndex[sourceWord];

      if (sourceAlignments && sourceAlignments.length) {
        indices.push(sourceAlignments[0]);
      } else {
        indices.push(sourceWord);
      }
    }
  }
  return indices;
}

/**
 * find the morph (and lemma) for sourceText
 * @param {object} sourceIndex - alignment indices mapped by source text
 * @param {string} sourceText
 * @param {array} alignments
 * @returns {{sourceLemma: string, morph: string}}
 */
function getMorphData(sourceIndex, sourceText, alignments, sourceKeys) {
  let indices = getSourceIndices(sourceText, sourceIndex);
  let sourceLemma = [];
  let morph = [];

  for (const index of indices) {
    if (index >= 0) {
      const alignment_ = alignments[index];
      morph.push(alignment_.morph);
      sourceLemma.push(alignment_.sourceLemma);
    } else {
      let matchFound = false;
      const { search, flags } = buildSearchRegex(index, true, false);
      const found = searchAlignmentsSub(search, flags, sourceKeys, sourceIndex);

      if (found && found.length) {
        const index_ = found[0];
        const alignment_ = alignments[index_];
        const sourceWords = alignment_.sourceText.split(' ');

        for (let i = 0; i < sourceWords.length; i++) {
          const sourceWord = sourceWords[i];

          if (sourceWord === index) {
            matchFound = true;
            const morph_ = alignment_.morph.split(' ')[i];
            const lemma_ = alignment_.sourceLemma.split(' ')[i];
            morph.push(morph_);
            sourceLemma.push(lemma_);
            break;
          }
        }
      }

      if (!matchFound) {
        morph.push('_');
        sourceLemma.push('_');
      }
    }
  }

  sourceLemma = sourceLemma.join(' ');
  morph = morph.join(' ');
  return { sourceLemma, morph };
}

/**
 * search one or more fields for searchStr and merge the match alignments together
 * @param {object} alignmentData - object that contains raw alignments and indices for search
 * @param {object} tWordsIndex
 * @param {string} searchStr - string to match
 * @param {object} config - search configuration including search types and fields to search
 * @returns {*[]} - array of found alignments
 */
export function multiSearchAlignments(alignmentData, tWordsIndex, searchStr, config) {
  const { search, flags } = buildSearchRegex(searchStr, config.fullWord, config.caseInsensitive);
  let found = [];

  if (config.searchTwords) {
    if (config.searchSource) {
      const keys = Object.keys(tWordsIndex.quoteIndex);
      const alignments = tWordsIndex.quoteIndex;
      const searchData = { keys, alignments };
      searchAlignmentsAndAppend(search, flags, searchData, found);
    }

    if (config.searchTarget) {
      const keys = Object.keys(tWordsIndex.groupIndex);
      const alignments = tWordsIndex.groupIndex;
      const searchData = { keys, alignments };
      searchAlignmentsAndAppend(search, flags, searchData, found);
    }

    if (config.searchStrong) {
      const keys = Object.keys(tWordsIndex.strongsIndex);
      const alignments = tWordsIndex.strongsIndex;
      const searchData = { keys, alignments };
      searchAlignmentsAndAppend(search, flags, searchData, found);
    }

    const source = alignmentData.source.alignments;
    const alignments = alignmentData.alignments;
    const sourceKeys = Object.keys(source);

    found = found?.map(index => {
      const check = tWordsIndex.checks[index];
      const contextId = check?.contextId;
      const targetText = contextId?.groupId || '';
      const sourceText = check?.quoteString || '';
      const strong = check.strong;
      const { sourceLemma, morph } = getMorphData(source, sourceText, alignments, sourceKeys);

      const newCheck = {
        ...check,
        targetText,
        sourceText,
        strong,
        sourceLemma,
        morph,
      };

      return newCheck;
    });
  } else {
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

    found = found?.map(index => alignmentData.alignments[index]);
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
 * @param {function} callback - async callback function(percentProress:number)
 * @returns {{strongAlignments: {alignments: {}}, alignments: *[], lemmaAlignments: {alignments: {}}, targetAlignments: {alignments: {}}, sourceAlignments: {alignments: {}}}}
 */
export async function getAlignmentsFromResource(resourceFolder, resource, callback = null) {
  const bibleIndex = {};

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
          reference: r_,
        } = alignment;

        if (!alignments_[sourceText]) {
          alignments_[sourceText] = {};
        }

        const sourceALignment = alignments_[sourceText];
        let index;

        if (!sourceALignment[targetText]) {
          alignment.refs = [ref];
          delete alignment.ref;
          index = uniqueAlignments.length;
          uniqueAlignments.push(alignment);
          sourceALignment[targetText] = [index];
        } else {
          index = sourceALignment[targetText];
          const matchedAlignment = uniqueAlignments[index];
          matchedAlignment.refs.push(ref);
        }

        let bookIndex = bibleIndex[r_.bookId];

        if (!bookIndex) {
          bookIndex = {};
          bibleIndex[r_.bookId] = bookIndex;
        }

        let chapterIndex = bookIndex[r_.chapter];

        if (!chapterIndex) {
          chapterIndex = {};
          bookIndex[r_.chapter] = chapterIndex;
        }

        let verseIndex = chapterIndex[r_.verse];

        if (!verseIndex) {
          verseIndex = [];
          chapterIndex[r_.verse] = verseIndex;
        }

        verseIndex.push(index);
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
        bibleIndex,
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
    const bookId = manifest?.project?.id || selectedProjectFilename;
    const bookAlignments = [];

    Object.keys(chaptersObject).forEach((chapter) => {
      const bibleChapter = {};
      const verses = Object.keys(chaptersObject[chapter]);
      const chapterRef = `${bookId} ${chapter}:`;

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
              // eslint-disable-next-line object-curly-newline
              reference: { bookId, chapter, verse },
            });
          }
        }
      });
    });

    console.log(`getALignmentsFromJson() for book ${bookId}, ${bookAlignments.length} alignments`);
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
    const indexedResources = getAlignmentIndices(ALIGNMENT_DATA_DIR);

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

export function addTwordsInfoToResource(resource, resourcesFolder) {
  let tWordsLangID = resource.languageId;
  let subFolder = 'translationWordsLinks';
  let origLang = resource.origLang;
  let filterBooks = null;

  if (resource.owner === DEFAULT_ORIG_LANG_OWNER) {
    if (!origLang) {
      const olForBook = resource.origLang || BibleHelpers.getOrigLangforBook(resource.bookId);
      origLang = olForBook.languageId;
    }
    subFolder = 'translationWords';
    tWordsLangID = origLang;
    filterBooks = (origLang === OT_ORIG_LANG) ? OT_BOOKS : NT_BOOKS;
  }

  const tWordsPath = path.join(resourcesFolder, `${tWordsLangID}/translationHelps/${subFolder}`);
  const latestTWordsVersion = getMostRecentVersionInFolder(tWordsPath, resource.owner);
  const latestTwordsPath = path.join(tWordsPath, latestTWordsVersion);

  const res = {
    ...resource,
    origLang,
    latestTWordsVersion,
    tWordsLangID,
    filterBooks,
    latestTwordsPath,
  };
  return res;
}

export function getTwordsKey(resource) {
  const key = `${resource.tWordsLangID}_${resource.origLang}_${resource.latestTWordsVersion}_${TWORDS_KEY}`;
  return key;
}

export function getTwordsIndexFileName(key) {
  return path.join(ALIGNMENT_DATA_DIR, `${key}.json`);
}

export function saveTwordsIndex(key, index) {
  const filePath = getTwordsIndexFileName(key);
  fs.outputJsonSync(filePath, index);
}

export function getTwordsIndex(key) {
  let filePath;

  try {
    filePath = getTwordsIndexFileName(key);

    if (fs.existsSync(filePath)) {
      return fs.readJsonSync(filePath);
    }
  } catch (e) {
    console.warn(`getTwordsIndex - cannot read ${filePath}`);
  }
  return null;
}

/**
 * find item in object, if not found then add newItem
 * @param {object} object
 * @param {*} item
 * @param {boolean} newItemIsArray - if true then new item is an empty array, otherwise make it an empty object
 * @returns {*}
 */
function findItem(object, item, newItemIsArray = false) {
  let verseList = object[item];

  if (!verseList) {
    verseList = newItemIsArray ? [] : {};
    object[item] = verseList;
  }
  return verseList;
}

/**
 * index twords for resource
 * @param {string} resourcesFolder
 * @param {object} resource
 * @param {function} callback - async callback function(percentProress:number)
 * @returns {object}
 */
export async function indexTwords(resourcesFolder, resource, callback = null) {
  // for D43-Catalog:
  // ~/translationCore/resources/el-x-koine/translationHelps/translationWords/v0.29_Door43-Catalog/kt/groups/1co
  // for other owners:
  // ~/translationCore/resources/en/translationHelps/translationWordsLinks/v17_unfoldingWord/kt/groups/1ch

  let checks = [];
  const bibleIndex = {};
  const groupIndex = {};
  const quoteIndex = {};
  const strongsIndex = {};
  const alignmentIndex = {};
  const res = addTwordsInfoToResource(resource, resourcesFolder);
  const filterBooks = res.filterBooks;
  const latestTWordsVersion = res.latestTWordsVersion;
  const latestTwordsPath = res.latestTwordsPath;

  if (latestTWordsVersion) {
    await doCallback(callback, 0);

    if (fs.existsSync(latestTwordsPath)) {
      console.log(`Found ${latestTWordsVersion}`);
      const catagories = getFoldersInResourceFolder(latestTwordsPath);
      const catagoryStepSize = 100 / (catagories.length || 1);

      for (let i = 0; i < catagories.length; i++) {
        const catagory = catagories[i];
        const progressCatagory = i * catagoryStepSize;
        const booksPath = path.join(latestTwordsPath, catagory, 'groups');
        let books = getFoldersInResourceFolder(booksPath);

        if (filterBooks) {
          const filteredBooks = books.filter(bookId => filterBooks.includes(bookId));
          books = filteredBooks;
        }

        const bookStepSize = catagoryStepSize / (books.length || 1);

        for (let j = 0; j < books.length; j++) {
          const bookId = books[j];
          const bookProgress = j * bookStepSize + progressCatagory;
          // eslint-disable-next-line no-await-in-loop
          await doCallback(callback, bookProgress);
          const bookPath = path.join(booksPath, bookId);
          const groupFiles = getFilesInResourcePath(bookPath, '.json');

          for (const groupFile of groupFiles) {
            const groupFilePath = path.join(bookPath, groupFile);

            try {
              const data = fs.readJsonSync(groupFilePath);
              const groupId = groupFile.split('.json')[0];
              const groupList = findItem(groupIndex, groupId, true);

              for (const item of data) {
                const contextId = item?.contextId;
                const reference = contextId?.reference;
                let quote = normalizer(contextId?.quote || '');

                if (Array.isArray(quote)) {
                  const quote_ = quote.map(item => item.word);
                  quote = quote_.join(' ');
                }

                item.quoteString = quote;
                let location = checks.length;
                const alignmentKey = `${groupId}_${quote}`;
                let previousCheck = alignmentIndex[alignmentKey];

                if (!previousCheck) {
                  item.refs = [reference];
                  checks.push(item);
                } else {
                  location = previousCheck;
                  const check = checks[previousCheck];
                  check.refs.push(reference);
                }

                const chapter = reference?.chapter;

                let strongs = contextId?.strong || [];
                strongs = Array.isArray(strongs) ? strongs.join(' ') : '';
                item.strong = strongs;
                const strongsList = findItem(strongsIndex, strongs, true);
                pushUnique(strongsList, location);

                const quoteList = findItem(quoteIndex, quote, true);
                pushUnique(quoteList, location);

                const bookIndex = findItem(bibleIndex, bookId, false);
                const chapterIndex = findItem(bookIndex, chapter, false);
                const verse = reference?.verse;
                const verseList = findItem(chapterIndex, verse, true);

                pushUnique(verseList, location);
                pushUnique(groupList, location);
              }
              // console.log(data);
            } catch (e) {
              console.warn(`could not read ${groupFilePath}`);
            }
          }
        }
      }

      const newChecks = checks.map(item => {
        const refs = item.refs.map(r => `${r.bookId} ${r.chapter}:${r.verse}`);
        item.refs = refs;
        return item;
      });

      checks = newChecks;

      return {
        bibleIndex,
        groupIndex,
        quoteIndex,
        strongsIndex,
        checks,
        resource: res,
      };
    }
  }
  return null;
}
