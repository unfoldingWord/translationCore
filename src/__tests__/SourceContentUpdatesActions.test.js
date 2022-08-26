import wordaligner from 'word-aligner';
import React from 'react';
import sourceContentUpdater, { apiHelpers } from 'tc-source-content-updater';
import fs from 'fs-extra';
import path from 'path-extra';
import { normalizer } from 'string-punctuation-tokenizer';
import {
  getUsfmForVerseContent,
  trimNewLine,
} from '../js/helpers/FileConversionHelpers/UsfmFileConversionHelpers';
import BIBLE_BOOKS, { NT_ORIG_LANG, OT_ORIG_LANG } from '../js/common/BooksOfTheBible';

jest.unmock('fs-extra');
jest.unmock('adm-zip');

const resource_ = {
  languageId: 'en',
  resourceId: 'ult',
  owner: 'unfoldingWord',
};

const translationCoreFolder = path.join('/Users/blm/translationCore');
const alignmentsFolder = path.join(translationCoreFolder, 'alignmentData');

test('get alignments', async () => {
  const resource = {
    ...resource_,
  };

  const destinationPath = path.join(alignmentsFolder, `${resource.owner}_${resource.languageId}_${resource.resourceId}`);
  const destinationBiblePath = path.join(destinationPath, 'bible');

  try {
    for (let testamemnt = 0; testamemnt <= 1; testamemnt++) {
      const alignments = [];
      const origLang = testamemnt ? NT_ORIG_LANG : OT_ORIG_LANG;
      const books = testamemnt ? Object.keys(BIBLE_BOOKS.newTestament) : Object.keys(BIBLE_BOOKS.oldTestament);

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
      console.log(`getALignmentsFromJson() for ${origLang}, ${alignments.length} alignments`);
      // TODO: index and save
    }

    console.log('done');
  } catch (e) {
    console.warn('download failed');
  }
  // /Users/blm/translationCore/alignmentData/unfoldingWord_en_ult/en/bibles/ult/v40_unfoldingWord
  // await generateTargetLanguageBibleFromUsfm(parsedUsfm, manifest, selectedProjectFilename);
  // for each book:
  //  need to merge json chapters into parsedUsfm.chapters
  //  and need empty parsedUsfm.headers
}, 50000);

test('get latest resource', async () => {
  const SourceContentUpdater = new sourceContentUpdater();
  const resource = {
    ...resource_,
  };

  if (!resource.version) {
    const owner = resource.owner;
    const retries = 5;
    const stage = resource.stage !== 'prod' ? 'preprod' : undefined;
    const resourceName = `${resource.languageId}_${resource.resourceId}`;
    const latest = await apiHelpers.getLatestRelease(owner, resourceName, retries, stage) ;
    const release = latest && latest.release;
    let version = release && release.tag_name;

    if (version) {
      resource.version = version;
    }
  }

  const destinationPath = path.join(alignmentsFolder, `${resource.owner}_${resource.languageId}_${resource.resourceId}`);

  try {
    await SourceContentUpdater.downloadAndProcessResource(resource, destinationPath);
    console.log('done');
  } catch (e) {
    console.warn('download failed');
  }

  // /Users/blm/translationCore/alignmentData/unfoldingWord_en_ult/en/bibles/ult/v40_unfoldingWord
  const biblePath = path.join(destinationPath, `${resource.languageId}/bibles/${resource.resourceId}/${resource.version}_${resource.owner}`);
  const destinationBiblePath = path.join(destinationPath, 'bible');

  if (fs.existsSync(destinationBiblePath)) {
    fs.removeSync(destinationBiblePath);
  }
  fs.moveSync(biblePath, destinationBiblePath);

}, 50000);

/**
 * generate the target language bible from parsed USFM and manifest data
 * @param {Object} parsedUsfm - The object containing usfm parsed by chapters
 * @param {Object} manifest
 * @param {String} selectedProjectFilename
 * @param {String} destinationPath
 * @return {Promise<any>}
 */
export const getALignmentsFromJson = async (parsedUsfm, manifest, selectedProjectFilename, destinationPath) => {
  try {
    const chaptersObject = parsedUsfm.chapters;
    const bookID = manifest?.project?.id || selectedProjectFilename;
    const bookAlignments = [];

    Object.keys(chaptersObject).forEach((chapter) => {
      let chapterAlignments = {};
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
