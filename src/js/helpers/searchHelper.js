import path from 'path-extra';
import fs from 'fs-extra';
import xre from 'xregexp';
import { normalizer } from 'string-punctuation-tokenizer';
import { resourcesHelpers } from 'tc-source-content-updater';
import wordaligner from 'word-aligner';
import {
  BIBLE_BOOKS,
  NT_ORIG_LANG,
  OT_ORIG_LANG,
} from '../common/BooksOfTheBible';
import { getUsfmForVerseContent, trimNewLine } from './FileConversionHelpers/UsfmFileConversionHelpers';

const startWordRegex = '(?<=[\\s,.:;"\']|^)';
const endWordRegex = '(?=[\\s,.:;"\']|$)';

export function getSortedKeys(alignments, langID) {
  let keys = Object.keys(alignments);

  keys = keys.sort(function (a, b) {
    return a.localeCompare(b, langID, { sensitivity: 'base' });
  });

  return keys;
}

export function getCount(alignments) {
  const keys = Object.keys(alignments);
  let count = 0;

  for (const key of keys) {
    const alignments_ = alignments[key];
    count += alignments_.length;
  }
  return count;
}

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

export function regexSearch(keys, search, flags) {
  const found = [];
  const regex = xre(search, flags);

  for (const key of keys) {
    const results = regex.test(key);

    if (results) {
      found.push(key);
    }
  }

  return found;
}

/**
 * build regex search string
 * @param {string} search
 * @param {boolean} fullWord
 * @param caseInsensitive
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
    search = `${startWordRegex}${search}${endWordRegex}`;
  }

  if (caseInsensitive) {
    flags += 'i';
  }

  return { search, flags };
}

export function loadAlignments(jsonPath) {
  try {
    const alignments = fs.readJsonSync(jsonPath);
    const baseName = path.parse(jsonPath).name;
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
    console.warn(`loadAlignments() - could not read ${jsonPath}`);
  }
  return null;
}

export function searchAlignmentsSub(search, flags, keys, alignments) {
  const foundKeys = regexSearch(keys, search, flags);
  const foundAlignments = [];

  for (const key of foundKeys) {
    const alignments_ = alignments[key];
    Array.prototype.push.apply(foundAlignments, alignments_);
  }
  return foundAlignments;
}

export function searchRefs(search, flags, keys, alignments) {
  const refsAlignments = {};

  // create refs allignments object
  for (const key of keys) {
    const alignments_ = alignments[key];

    for (const alignment of alignments_) {
      const refs = alignment.refs || [];
      const refsStr = refs.join(' ');

      if (!refsAlignments[refsStr]) {
        refsAlignments[refsStr] = [];
      }
      refsAlignments[refsStr].push(alignment);
    }
  }

  const foundAlignments = searchAlignmentsSub(search, flags, Object.keys(refsAlignments), refsAlignments);
  return foundAlignments;
}

export function searchAlignments(search_, fullWord, caseInsensitive, keys, alignments) {
  const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);
  const foundAlignments = searchAlignmentsSub(search, flags, keys, alignments);
  return foundAlignments;
}

export function searchAlignmentsAndAppend(search, flags, config, searchData, found) {
  const found_ = searchAlignmentsSub(search, flags, searchData.keys, searchData.alignments);

  if (found_.length) {
    for (const item of found_) {
      const duplicate = found.includes(item); // ignore duplicates

      if (!duplicate) {
        found.push(item);
      }
    }
  }
}

export function searchRefsAndAppend(search, flags, config, searchData, found) {
  const found_ = searchRefs(search, flags, searchData.keys, searchData.alignments);

  if (found_.length) {
    for (const item of found_) {
      const duplicate = found.includes(item); // ignore duplicates

      if (!duplicate) {
        found.push(item);
      }
    }
  }
}

export function multiSearchAlignments(alignmentData, search_, config) {
  const { search, flags } = buildSearchRegex(search_, config.fullWord, config.caseInsensitive);

  const found = [];

  if (config.searchTarget) {
    searchAlignmentsAndAppend(search, flags, config, alignmentData.target, found);
  }

  if (config.searchStrong) {
    searchAlignmentsAndAppend(search, flags, config, alignmentData.strong, found);
  }

  if (config.searchLemma) {
    searchAlignmentsAndAppend(search, flags, config, alignmentData.lemma, found);
  }

  if (config.searchSource) {
    searchAlignmentsAndAppend(search, flags, config, alignmentData.source, found);
  }

  if (config.searchRefs) {
    searchRefsAndAppend(search, flags, config, alignmentData.source, found);
  }
  return found;
}

export function filterAvailableAlignedBibles(downloadedAlignedBibles, indexedResources) {
  const filtered = [];

  for (const downloadedBible of downloadedAlignedBibles) {
    for (let testament = 0; testament <= 1; testament++) {
      const origLang = testament ? NT_ORIG_LANG : OT_ORIG_LANG;
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

export function getAlignmentIndices(alignmentDataDir) {
  const resources = [];
  const resourcesIndexed = readDirectory(alignmentDataDir, false, true, '.json');

  for (const fileName of resourcesIndexed) {
    // const fileFolder = path.join(resourcesIndexed, fileName);
    // ~/translationCore/alignmentData/en_ult_unfoldingWord_hbo_testament_v0_275433.json
    const name = path.parse(fileName).name;
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

    if (type !== 'testament') {
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

export function getAlignedBibles(resourceDir) {
  const alignments = [];
  const languages = readDirectory(resourceDir, true, true, null);

  for (const languageId of languages) {
    const biblesFolder = path.join(resourceDir, languageId, 'bibles');
    const bibles = readDirectory(biblesFolder, true, true, null);

    for (const bibleId of bibles) {
      const biblePath = path.join(biblesFolder, bibleId);
      const owners = resourcesHelpers.getLatestVersionsAndOwners(biblePath);

      for (const owner of Object.keys(owners)) {
        const biblePath = owners[owner];
        let manifest = null;
        const manifestPath = path.join(biblePath, 'manifest.json');

        if (fs.pathExistsSync(manifestPath)) {
          manifest = fs.readJsonSync(manifestPath);
        }

        const isAligned = manifest?.subject === 'Aligned Bible';
        const version = resourcesHelpers.splitVersionAndOwner(path.basename(biblePath))?.version;

        if (isAligned) {
          alignments.push({
            languageId,
            bibleId,
            owner,
            version,
            biblePath,
          });
        }
      }
    }
  }
  return alignments;
}

function isDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      return fs.statSync(dirPath).isDirectory();
    }
    // eslint-disable-next-line no-empty
  } catch (e) { }
  return false;
}

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

export function encodeParam(param) {
  let encoded = encodeURIComponent(param);
  encoded = encoded.replaceAll('_', '%5F');
  encoded = encoded.replaceAll('.', '%2E');
  return encoded;
}

export function getAlignmentsFromResource(resourceFolder, resource) {
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

      for (const bookId of books) {
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

      for (const alignment of alignments) {
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
      const outputFile = path.join(alignmentsFolder, `${resource.languageId}_${resource.resourceId}_${(encodeParam(resource.owner))}_${resource.origLang}_testament_${encodeParam(resource.version)}_${alignments.length}.json`);
      const lemmaAlignments = { alignments: {} };
      const targetAlignments = { alignments: {} };
      const sourceAlignments = { alignments: {} };
      const strongAlignments = { alignments: {} };

      for (let i = 0, l = alignments.length; i < l; i++) {
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
      strongAlignments.keys = getSortedKeys(strongAlignments.alignments, 'en');
      lemmaAlignments.keys = getSortedKeys(lemmaAlignments.alignments, resource.origLang);
      sourceAlignments.keys = getSortedKeys(sourceAlignments.alignments, resource.origLang);
      targetAlignments.keys = getSortedKeys(targetAlignments.alignments, resource.languageId);
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

            for (const originalWord of alignment.topWords) {
              const {
                strong,
                lemma,
                word,
              } = originalWord;
              strongs.push(strong);
              lemmas.push(lemma);
              sources.push(word);
            }

            for (const targetWord of alignment.bottomWords) {
              targets.push(targetWord.word);
            }
            bookAlignments.push({
              sourceText: normalizer(sources.join(' ')),
              sourceLemma: normalizer(lemmas.join(' ')),
              strong: strongs.join(' '),
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

export function getSearchableAlignments(translationCoreFolder) {
  const resourceDir = path.join(translationCoreFolder, 'resources');
  const downloadedAlignedBibles = getAlignedBibles(resourceDir);
  const indexedResources = getAlignmentIndices(path.join(translationCoreFolder, 'alignmentData'));

  // filter selections
  const filtered = filterAvailableAlignedBibles(downloadedAlignedBibles, indexedResources);
  return filtered;
}

