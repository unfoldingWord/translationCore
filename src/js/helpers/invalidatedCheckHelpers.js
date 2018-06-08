import fs from 'fs-extra';
import path from 'path-extra';
import isEqual from 'deep-equal';
// helpers
import * as WordAlignmentHelpers from './WordAlignmentHelpers';

export const loadTotalOfInvalidatedChecksForCurrentProject = (invalidatedFolderPath) => {
  let invalidatedChecksTotal = 0;

  if (fs.existsSync(invalidatedFolderPath)) {
    const chapters = fs.readdirSync(invalidatedFolderPath).filter((filename) => filename !== '.DS_Store');

    chapters.forEach((chapter) => {
      const versesPath = path.join(invalidatedFolderPath, chapter);
      const verses = fs.readdirSync(versesPath).filter((filename) => filename !== '.DS_Store');
      verses.forEach((verse) => {
        const versePath = path.join(invalidatedFolderPath, chapter, verse);
        const files = fs.readdirSync(versePath).filter((filename) => filename !== '.DS_Store');
        const sorted = files.sort().reverse(); // sort the files to use latest
        const filePath = path.join(versePath, sorted[0]);
        const invalidatedFile = fs.readJsonSync(filePath);

        if (invalidatedFile.invalidated) invalidatedChecksTotal++;
      });
    });
  }

  return invalidatedChecksTotal;
};

export const getTotalOfEditedVerses = (verseEditFolderPath) => {
  let verseEditsTotal = 0;

  if (fs.existsSync(verseEditFolderPath)) {
    const chapters = fs.readdirSync(verseEditFolderPath).filter((filename) => filename !== '.DS_Store');

    chapters.forEach((chapter) => {
      const versesPath = path.join(verseEditFolderPath, chapter);
      const verses = fs.readdirSync(versesPath).filter((filename) => filename !== '.DS_Store');
      verses.forEach(() => {
      verseEditsTotal++;
      });
    });
  }

  return verseEditsTotal;
};


const getListOfVerseEdited = (verseEditFolderPath) => {
  const editedChapters = {};

  if (fs.existsSync(verseEditFolderPath)) {
    const chapters = fs.readdirSync(verseEditFolderPath).filter((filename) => filename !== '.DS_Store');

    chapters.forEach((chapter) => {
      const versesPath = path.join(verseEditFolderPath, chapter);
      const verses = fs.readdirSync(versesPath).filter((filename) => filename !== '.DS_Store');
      editedChapters[chapter] = verses;
    });
  }

  return editedChapters;
};

export const getTotalInvalidatedAlignments = (projectLocation, bibleId) => {
  const alignmentChaptersPath = path.join(projectLocation, '.apps', 'translationCore', 'alignmentData', bibleId);
  let invalidatedAlignmentsTotal = 0;

  if (fs.existsSync(alignmentChaptersPath)) {
    const alignmentChapters = fs.readdirSync(alignmentChaptersPath).filter((filename) => filename !== '.DS_Store');
    const alignments = {};
    const tagetBible = {};

    alignmentChapters.forEach((chapter) => {
      const targetBibleChapterPath= path.join(projectLocation, bibleId, chapter);
      const chapterNumber = chapter.replace(/.json/g, '');
      const chapterAlignment = fs.readJsonSync(path.join(alignmentChaptersPath, chapter));
      const bibleChapter = fs.readJsonSync(targetBibleChapterPath);
      alignments[chapterNumber] = chapterAlignment;
      tagetBible[chapterNumber] = bibleChapter;
    });

    const verseEditsPath = path.join(projectLocation, '.apps', 'translationCore', 'checkData', 'verseEdits', bibleId);
    const editedChapters = getListOfVerseEdited(verseEditsPath);

    Object.keys(editedChapters).forEach((chapterNumber) => {
      editedChapters[chapterNumber].forEach(verseNumber => {
        if (alignments[chapterNumber] && alignments[chapterNumber][verseNumber]) {
          const targetLanguageVerseCleaned = WordAlignmentHelpers.getTargetLanguageVerse(tagetBible[chapterNumber][verseNumber]);
          const targetLanguageVerse = WordAlignmentHelpers.getCurrentTargetLanguageVerseFromAlignments(alignments[chapterNumber][verseNumber], tagetBible[chapterNumber][verseNumber]);
          if (!isEqual(targetLanguageVerseCleaned, targetLanguageVerse)) invalidatedAlignmentsTotal++;
        }
      });
    });
  }

  return invalidatedAlignmentsTotal;
};
