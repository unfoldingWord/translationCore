import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import isEqual from 'deep-equal';
import {checkSelectionOccurrences} from 'selections';
// helpers
import {generateTimestamp} from '../index';

// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

export const handleProjectReimport = (projectName, bookId, userName, translate) => {
  const projectPath = path.join(PROJECTS_PATH, projectName);
  preserveExistingProjectChecks(projectName, translate);
  createVerseEditsForAllChangedVerses(projectName, bookId, userName);
  createInvalidatedsForAllCheckData(projectName, bookId, userName);
  fs.removeSync(projectPath);
};

/**
 * @description Import Helpers for moving the contents of projects to `~/translationCore/imports` while importing
 * and to `~/translationCore/projects` after migrations and validation.
 * @param {String} projectName
 */
export const preserveExistingProjectChecks = (projectName, translate) => {
  const projectPath = path.join(PROJECTS_PATH, projectName);
  
  // if project dir doesn't exist, it must have been deleted after tC was started. We throw an error and tell them to import the project again
  const importPath = path.join(IMPORTS_PATH, projectName);
  if (!fs.existsSync(projectPath)) {
    fs.removeSync(importPath);
    // two translatable strings are concatenated for response.
    const compoundMessage = translate('projects.project_does_not_exist', {
        project_path: projectName
      }) +
      " " + translate('projects.import_again_as_new_project');
    throw new Error(compoundMessage);
    // if project exists then update import from projects
  } else {
    // copy import contents to project
    if (fs.existsSync(projectPath) && fs.existsSync(importPath)) {
      let projectAppsPath = path.join(projectPath, '.apps');
      let importAppsPath = path.join(importPath, '.apps');
      if (fs.existsSync(projectAppsPath)) {
        if (!fs.existsSync(importAppsPath)) {
          // This wasn't an import of USFM3 so no alignment data exists, can just keep the .apps directory from the project directory
          fs.copySync(path.join(projectPath, '.apps'), path.join(importPath, '.apps'));
        } else {
          // There is some alignment data from the import, as it must have been USFM3, so we preserve it
          // as we copy the rest of the project's .apps data into the import
          let alignmentPath = path.join(importAppsPath, 'translationCore', 'alignmentData');
          if (fs.existsSync(alignmentPath)) {
            let tempAlignmentPath = path.join(importPath, '.temp_alignmentData');
            fs.moveSync(alignmentPath, tempAlignmentPath); // moving new alignment data to a temp dir
            fs.removeSync(importAppsPath); // .apps dir can be removed since we only need alignment data
            fs.copySync(projectAppsPath, importAppsPath); // copying the existing project's .apps dir to preserve it
            const manifest = fs.readJsonSync(path.join(projectPath, 'manifest.json'));
            copyAlignmentData(path.join(tempAlignmentPath, manifest.project.id), path.join(alignmentPath, manifest.project.id)); // Now we overwrite any alignment data of the project from the import
            fs.removeSync(tempAlignmentPath); // Done with the temp alignment dir
          }
        }
      }
      if (fs.existsSync(path.join(projectPath, '.git')))
        fs.copySync(path.join(projectPath, '.git'), path.join(importPath, '.git'));
      return importPath;
    } else {
      throw new Error(translate('projects.not_found'));
    }
  }
};

export const copyAlignmentData = (fromDir, toDir) => {
  let fromFiles = fs.readdirSync(fromDir).filter(file => path.extname(file) === '.json');
  let toFiles = [];
  if (fs.existsSync(toDir))
    toFiles = fs.readdirSync(toDir).filter(file => path.extname(file) === '.json');
  fs.mkdirpSync(toDir);
  fromFiles.forEach((file) => {
    let fromFileJson = fs.readJsonSync(path.join(fromDir, file));
    let index = toFiles.indexOf(file);
    let toFileJson = {};
    if (index >= 0) {
      toFileJson = fs.readJsonSync(path.join(toDir, toFiles[index]));
    }
    Object.keys(fromFileJson).forEach(function (verseNum) {
      if(!toFileJson[verseNum] || !toFileJson[verseNum].alignments) {
        toFileJson[verseNum] = fromFileJson[verseNum];
      }  else {
        const alignments = fromFileJson[verseNum].alignments;
        let newAlignmentData = false;
        alignments.forEach((alignment, idx) => {
          if (toFileJson[verseNum].alignments[idx].bottomWords.length > 0) {
            newAlignmentData = true;
          }
        });
        if (! newAlignmentData) {
          toFileJson[verseNum] = fromFileJson[verseNum];
        }
      }
    });
    fs.writeJsonSync(path.join(toDir, file), toFileJson);
  });
};

export const createVerseEditsForAllChangedVerses = (projectName, bookId, userName) => {
  const projectPath = path.join(PROJECTS_PATH, projectName);
  const importPath = path.join(IMPORTS_PATH, projectName);
  const projectBiblePath = path.join(projectPath, bookId);
  const importBiblePath = path.join(importPath, bookId);
  if (!fs.pathExistsSync(projectBiblePath) || !fs.pathExistsSync(importBiblePath))
    return;
  const chapterFiles = fs.readdirSync(projectBiblePath).filter(filename => path.extname(filename) == '.json' && parseInt(path.basename(filename)));
  chapterFiles.forEach(filename => {
    try {
      const chapter = parseInt(path.basename(filename));
      const oldChapterVerses = fs.readJsonSync(path.join(projectBiblePath, filename));
      const newChapterVerses = fs.readJsonSync(path.join(importBiblePath, filename));
      Object.keys(newChapterVerses).forEach(verse => {
        let verseBefore = oldChapterVerses[verse];
        let verseAfter = newChapterVerses[verse];
        verse = parseInt(verse);
        if (verseBefore != verseAfter) {
          const modifiedTimestamp = generateTimestamp();
          const verseEdit = {
            verseBefore,
            verseAfter,
            tags: 'other',
            userName,
            activeBook: bookId,
            activeChapter: chapter,
            activeVerse: verse,
            modifiedTimestamp: modifiedTimestamp,
            gatewayLanguageCode: 'en',
            gatewayLanguageQuote: 'Chapter ' + chapter,
            contextId: {
              reference: {
                bookId,
                chapter,
                verse
              },
              tool: 'wordAlignment',
              groupId: 'chapter_' + chapter
            },
          };
          const newFilename = modifiedTimestamp + '.json';
          const verseEditsPath = path.join(importPath, '.apps', 'translationCore', 'checkData', 'verseEdits', bookId, chapter.toString(), verse.toString());
          fs.outputJsonSync(path.join(verseEditsPath, newFilename.replace(/[:"]/g, '_')), verseEdit);
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
};

export const createInvalidatedsForAllCheckData = (projectName, bookId, userName) => {
  const projectPath = path.join(IMPORTS_PATH, projectName);
  const selectionsPath = path.join(projectPath, '.apps', 'translationCore', 'checkData', 'selections', bookId);
  if (fs.existsSync(selectionsPath)) {
    let chapters = fs.readdirSync(selectionsPath);
    for (let chapIdx in chapters) {
      let chapter = parseInt(chapters[chapIdx]);
      let chapterPath = path.join(selectionsPath, chapter.toString());
      let bibleChapter = {};
      try {
        bibleChapter = fs.readJsonSync(path.join(PROJECTS_PATH, projectName, bookId, chapter + '.json'));
      } catch (error) {
        console.log(error);
      }
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
          for (let sortedIdx in sorted) {
            const filename = sorted[sortedIdx];
            const selectionsData = fs.readJsonSync(path.join(versePath, filename));
            const doneKey = selectionsData.contextId.tool + '-' + selectionsData.contextId.groupId + '-' + selectionsData.contextId.quote + '-' + selectionsData.contextId.occurrence;
            if (!done[doneKey]) {
              const validSelections = checkSelectionOccurrences(verseText, selectionsData.selections);
              if (!isEqual(selectionsData.selections, validSelections)) { // if true found invalidated check
                const modifiedTimestamp = generateTimestamp();
                const invalidted = {
                  contextId: selectionsData.contextId,
                  invalidated: true,
                  userName,
                  modifiedTimestamp: modifiedTimestamp,
                  gatewayLanguageCode: selectionsData.gatewayLanguageCode,
                  gatewayLanguageQuote: selectionsData.gatewayLanguageQuote
                };
                const newFilename = modifiedTimestamp + '.json';
                const invalidatedCheckPath = path.join(projectPath, '.apps', 'translationCore', 'checkData', 'invalidated', bookId, chapter.toString(), verse.toString());
                fs.outputJsonSync(path.join(invalidatedCheckPath, newFilename.replace(/[:"]/g, '_')), invalidted);
                done[doneKey] = true;
              }
            }
          }
        }
      }
    }
  }
};
