import fs from 'fs-extra';
import path from 'path-extra';
import isEqual from 'deep-equal';
import { checkSelectionOccurrences } from 'selections';
// Actions
import * as TargetLanguageActions from '../actions/TargetLanguageActions';
// helpers
import * as WordAlignmentHelpers from './WordAlignmentHelpers';
import {generateTimestamp} from '../helpers/index';
// selectors
import {getUsername} from '../selectors';

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

export const createInvalidatedsForAllCheckData = () => {
  return ((dispatch, getState) => {
    let state = getState();
    const projectPath = state.projectDetailsReducer.projectSaveLocation;
    const bookId = state.projectDetailsReducer.manifest.project.id;
    const selectionsPath = path.join(projectPath, '.apps', 'translationCore', 'checkData', 'selections', bookId);
    if (fs.existsSync(selectionsPath)) {
      let chapters = fs.readdirSync(selectionsPath);  
      for (let chapIdx in chapters) {
        let chapter = parseInt(chapters[chapIdx]);
        let chapterPath = path.join(selectionsPath, chapter.toString());
        dispatch(TargetLanguageActions.loadTargetLanguageChapter(chapter));
        state = getState();
        if (state.resourcesReducer && state.resourcesReducer.bibles && state.resourcesReducer.bibles.targetLanguage && state.resourcesReducer.bibles.targetLanguage.targetBible) {
          const bibleChapter = state.resourcesReducer.bibles.targetLanguage.targetBible[chapter];
          if (bibleChapter) {
            let verses = fs.readdirSync(chapterPath);
            for (let verseIdx in verses) {
              let verse = parseInt(verses[verseIdx]);
              let versePath = path.join(chapterPath, verse.toString());
              const verseText = bibleChapter[verse];
              let files = fs.readdirSync(versePath);
              files = files.filter(file => { // filter the filenames to only use .json
                return path.extname(file) === '.json';
              });
              const sorted = files.sort().reverse(); // sort the files to use latest
              const done = {};
              for(let sortedIdx in sorted) {
                const filename = sorted[sortedIdx];
                const selectionsData = fs.readJsonSync(path.join(versePath, filename));
                const doneKey = selectionsData.contextId.tool + '-' + selectionsData.contextId.groupId + '-' + selectionsData.contextId.quote + '-' + selectionsData.contextId.occurrence;
                if ( ! done[doneKey]) {
                  const validSelections = checkSelectionOccurrences(verseText, selectionsData.selections);
                  if (!isEqual(selectionsData.selections, validSelections)) { // if true found invalidated check
                    const username = getUsername(state);
                    const modifiedTimestamp = generateTimestamp();
                    const invalidted = {
                      contextId: selectionsData.contextId,
                      invalidated: true,
                      userName: username,
                      modifiedTimestamp: modifiedTimestamp,
                      gatewayLanguageCode: selectionsData.gatewayLanguageCode,
                      gatewayLanguageQuote: selectionsData.gatewayLanguageQuote
                    };
                    const newFilename = modifiedTimestamp + '.json';
                    const invalidatedCheckPath = path.join(projectPath, '.apps', 'translationCore', 'checkData', 'invalidated', bookId, chapter.toString(), verse.toString());
                    fs.outputJSONSync(path.join(invalidatedCheckPath, newFilename.replace(/[:"]/g, '_')), invalidted);
                    done[doneKey] = true;
                  }
                }
              }
            }
          }
        }
      }
    }
  });
};
