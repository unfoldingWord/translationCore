import wordaligner from 'word-aligner';
import React from 'react';
import sourceContentUpdater, { apiHelpers, resourcesHelpers } from 'tc-source-content-updater';
import fs from 'fs-extra';
import path from 'path-extra';
import { normalizer } from 'string-punctuation-tokenizer';
import {
  getUsfmForVerseContent,
  trimNewLine,
} from '../js/helpers/FileConversionHelpers/UsfmFileConversionHelpers';
import {
  BIBLE_BOOKS,
  NT_ORIG_LANG,
  OT_ORIG_LANG,
} from '../js/common/BooksOfTheBible';
import { getSortedKeys } from '../js/helpers/searchHelper';

jest.unmock('fs-extra');
jest.unmock('adm-zip');

const resource_ = {
  languageId: 'en',
  resourceId: 'ult',
  owner: 'unfoldingWord',
};

const translationCoreFolder = path.join('/Users/blm/translationCore');
const alignmentsFolder = path.join(translationCoreFolder, 'alignmentData');

test.skip('download alignments', async () => {
  const resource = { ...resource_ };

  await downloadBibles(resource);
}, 50000);

test('index aligned Bibles', () => {
  const resourceDir = path.join(translationCoreFolder, 'resources');
  const alignments = getAlignedBibles(resourceDir);
  console.log('alignments', alignments);
});

test('get latest resource', async () => {
  const resource = { ...resource_ };

  await getAlignmentsFromVerseObjects(resource);
}, 50000);

// helpers

function getAlignedBibles(resourceDir) {
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
            biblePath
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
  } catch (e) { }
  return false;
}

function readDirectory(dirPath, foldersOnly = true, sort = true, extension = null) {
  if (isDirectory(dirPath)) {
    let content = fs.readdirSync(dirPath).filter(item => {
      if (item === '.DS_Store') {
        return false;
      }

      if (foldersOnly) {
        return isDirectory(path.join(dirPath, item));
      }

      if (extension) {
        return path.parse(item).ext === extension;
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

async function downloadBibles(resource) {
  const SourceContentUpdater = new sourceContentUpdater();

  if (!resource.version) {
    const owner = resource.owner;
    const retries = 5;
    const stage = resource.stage !== 'prod' ? 'preprod' : undefined;
    const resourceName = `${resource.languageId}_${resource.resourceId}`;
    const latest = await apiHelpers.getLatestRelease(owner, resourceName, retries, stage);
    const release = latest && latest.release;
    let version = release && release.tag_name;

    if (version) {
      resource.version = version;
    }
  }

  const destinationPath = path.join(alignmentsFolder, `${resource.owner}_${resource.languageId}_${resource.resourceId}`);

  try {
    console.log('downloadBibles() - downloading resource', resource);
    await SourceContentUpdater.downloadAndProcessResource(resource, destinationPath);
    console.log('downloadBibles() - download done');
  } catch (e) {
    console.warn('downloadBibles() - download failed');
  }

  // /Users/blm/translationCore/alignmentData/unfoldingWord_en_ult/en/bibles/ult/v40_unfoldingWord
  const biblePath = path.join(destinationPath, `${resource.languageId}/bibles/${resource.resourceId}/${resource.version}_${resource.owner}`);
  const destinationBiblePath = path.join(destinationPath, 'bible');

  if (fs.existsSync(destinationBiblePath)) {
    fs.removeSync(destinationBiblePath);
  }
  fs.moveSync(biblePath, destinationBiblePath);
}

async function getAlignmentsFromVerseObjects(resource) {
  const destinationPath = path.join(alignmentsFolder, `${resource.owner}_${resource.languageId}_${resource.resourceId}`);
  const destinationBiblePath = path.join(destinationPath, 'bible');

  try {
    for (let testament = 0; testament <= 1; testament++) {
      const alignments = [];
      const origLang = testament ? NT_ORIG_LANG : OT_ORIG_LANG;
      console.log(`getAlignmentsFromVerseObjects() - get alignments for ${origLang}`);
      const books = testament ? Object.keys(BIBLE_BOOKS.newTestament) : Object.keys(BIBLE_BOOKS.oldTestament);

      for (const bookId of books) {
        const bookPath = path.join(destinationBiblePath, bookId);

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

          const manifest = { };
          const selectedProjectFilename = bookId;
          const alignmentsPath = path.join(destinationPath, 'alignments');
          // eslint-disable-next-line no-await-in-loop
          const bookAlignments = await getALignmentsFromJson(parsedUsfm, manifest, selectedProjectFilename, alignmentsPath);
          Array.prototype.push.apply(alignments, bookAlignments);
        }
      }
      console.log(`getAlignmentsFromVerseObjects() for ${origLang}, ${alignments.length} alignments, indexing`);
      const outputFile = path.join(alignmentsFolder, `${resource.languageId}_${resource.resourceId}_${resource.owner}_${origLang}_whole.json`);
      const lemmaAlignments = {alignments: {}};
      const targetAlignments = {alignments: {}};
      const sourceAlignments = {alignments: {}};
      const strongAlignments = {alignments: {}};

      for (let i = 0, l = alignments.length; i < l; i++) {
        const alignment = alignments[i];
        const {
          sourceText,
          sourceLemma,
          strong,
          targetText
        } = alignment;
        appendToALignmentIndex(sourceAlignments.alignments, sourceText, i);
        appendToALignmentIndex(strongAlignments.alignments, strong, i);
        appendToALignmentIndex(lemmaAlignments.alignments, sourceLemma, i);
        appendToALignmentIndex(targetAlignments.alignments, targetText, i);
      }

      console.log(`getAlignmentsFromVerseObjects() for ${origLang}, getting keys`);
      strongAlignments.keys = getSortedKeys(strongAlignments.alignments, 'en');
      lemmaAlignments.keys = getSortedKeys(lemmaAlignments.alignments, origLang);
      sourceAlignments.keys = getSortedKeys(sourceAlignments.alignments, origLang);
      targetAlignments.keys = getSortedKeys(targetAlignments.alignments, resource.languageId);
      const alignmentData = {
        alignments,
        lemmaAlignments,
        targetAlignments,
        sourceAlignments,
        strongAlignments
      };
      fs.outputJsonSync(outputFile, alignmentData);
    }

    console.log('done');
  } catch (e) {
    console.warn('download failed');
  }
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
 * @param {String} destinationPath
 * @return {Promise<any>}
 */
const getALignmentsFromJson = async (parsedUsfm, manifest, selectedProjectFilename, destinationPath) => {
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
