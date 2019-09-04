import fs from 'fs-extra';
import path from 'path-extra';
import isEqual from 'deep-equal';
// helpers
import * as WordAlignmentHelpers from './WordAlignmentHelpers';

export const loadTotalOfInvalidatedChecksForCurrentProject = (invalidatedFolderPath) => {
  let invalidatedChecksTotal = 0;

  try {
    if (fs.existsSync(invalidatedFolderPath)) {
      const chapters = fs.readdirSync(invalidatedFolderPath).filter((filename) => filename !== '.DS_Store');

      chapters.forEach((chapter) => {
        const versesPath = path.join(invalidatedFolderPath, chapter);
        const verses = fs.readdirSync(versesPath).filter((filename) => filename !== '.DS_Store');

        verses.forEach((verse) => {
          const versePath = path.join(invalidatedFolderPath, chapter, verse);
          const files = fs.readdirSync(versePath).filter((filename) => filename !== '.DS_Store');
          const groups = organizedInvalidatedCheckFiles(files, versePath);

          Object.keys(groups).forEach(group => {
            const groupOccurrences = Object.keys(groups[group]);

            groupOccurrences.forEach(occurrence => {
              const groupFilanames = groups[group][occurrence];
              const sortedFilenames = groupFilanames.sort().reverse(); // sort the files to use latest
              const filePath = path.join(versePath, sortedFilenames[0]);
              const invalidatedCheckFile = fs.readJsonSync(filePath);

              if (invalidatedCheckFile.invalidated) {
                invalidatedChecksTotal++;
              }
            });
          });
        });
      });
    }
  } catch (error) {
    console.error(error);
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

    let projectHasZeroAlignments = true;

    // check if project has ever been opened with the word alignment tool or has no alignments
    Object.keys(alignments).forEach((chapterNumber) => {
      Object.keys(alignments[chapterNumber]).forEach((verseNumber) => {
        const currentVerseAlignments = alignments[chapterNumber][verseNumber]['alignments'];

        currentVerseAlignments.forEach((alignment) => {
          if (alignment.bottomWords.length > 0) {
            projectHasZeroAlignments = false;
          }
        });
      });
    });

    if (!projectHasZeroAlignments) {
      Object.keys(editedChapters).forEach((chapterNumber) => {
        editedChapters[chapterNumber].forEach(verseNumber => {
          if (alignments[chapterNumber] && alignments[chapterNumber][verseNumber]) {
            const targetLanguageVerseCleaned = WordAlignmentHelpers.getTargetLanguageVerse(tagetBible[chapterNumber][verseNumber]);
            const targetLanguageVerse = WordAlignmentHelpers.getCurrentTargetLanguageVerseFromAlignments(alignments[chapterNumber][verseNumber], tagetBible[chapterNumber][verseNumber]);

            if (!isEqual(targetLanguageVerseCleaned, targetLanguageVerse)) {
              invalidatedAlignmentsTotal++;
            }
          }
        });
      });
    }
  }

  return invalidatedAlignmentsTotal;
};

/**
 * organized groups into an object of group arrays.
 * {
 *    god: ['filename1.json', 'filename2.json'],
 *    glory: ['filename3.json', 'filename4.json', 'filename5.json']
 * }
 * @param {Array} files - list of invalidated checks files.
 * @param {String} versePath - directory path to verse files.
 */
export const organizedInvalidatedCheckFiles = (files, versePath) => {
  const groups = {};

  files.forEach(file => {
    const filePath = path.join(versePath, file);
    const invalidatedFile = fs.readJsonSync(filePath);
    const groupId = invalidatedFile.contextId.groupId;
    const occurrence = invalidatedFile.contextId.occurrence;

    if (groups[groupId] && groups[groupId][occurrence]) {
      const groupFiles = groups[groupId][occurrence];
      groupFiles.push(file);
      groups[groupId][occurrence] = groupFiles;
    } else {
      const newGroupId = [];
      newGroupId.push(file);
      groups[groupId] = { ...groups[groupId] };
      groups[groupId][occurrence] = newGroupId;
    }
  });

  return groups;
};
