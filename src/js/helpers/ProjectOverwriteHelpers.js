import fs from 'fs-extra';
import path from 'path-extra';
import {generateTimestamp} from './index';

/**
 * @description Copies existing project checks from the old project path to the new project path
 * @param {String} oldProjectPath
 * @param {String} newProjectPath
 * @param {function} translate
 */
export const mergeOldProjectToNewProject = (oldProjectPath, newProjectPath, userName) => {
  // if project path doesn't exist, it must have been deleted after tC was started. We throw an error and tell them to import the project again
  if (fs.existsSync(oldProjectPath) && fs.existsSync(newProjectPath)) {
    let oldAppsPath = path.join(oldProjectPath, '.apps');
    let newAppsPath = path.join(newProjectPath, '.apps');
    if (fs.existsSync(oldAppsPath)) {
      if (!fs.existsSync(newAppsPath)) {
        // There is no .apps data in the new path, so we just copy over the old .apps path and we are good to go
        fs.copySync(oldAppsPath, newAppsPath);
      } else {
        // There is alignment data in the new project path, so we need to move it out, preserve any
        // check data, and then copy any new alignment data from the new project path to the alignment data
        // from the old project path
        let alignmentPath = path.join(newAppsPath, 'translationCore', 'alignmentData');
        if (fs.existsSync(alignmentPath)) {
          const bookId = getBookId(newProjectPath);
          let tempAlignmentPath = path.join(newProjectPath, '.temp_alignmentData');
          fs.moveSync(alignmentPath, tempAlignmentPath); // moving new alignment data to a temp dir
          fs.removeSync(newAppsPath); // .apps dir can be removed since we only need new alignment data
          fs.copySync(oldAppsPath, newAppsPath); // copying the old project's .apps dir to preserve it
          // Now we overwrite any alignment data of the old project path from the new project path
          copyAlignmentData(path.join(tempAlignmentPath, bookId), path.join(alignmentPath, bookId));
          fs.removeSync(tempAlignmentPath); // Done with the temp alignment dir
        }
      }
    }
    // Copy the .git history of the old project into the new if it doesn't have it
    const oldGitPath = path.join(oldProjectPath, '.git');
    const newGitPath = path.join(newProjectPath, '.git');
    if (! fs.existsSync(newGitPath) && fs.existsSync(oldGitPath)) {
      fs.copySync(oldGitPath, newGitPath);
    }
    createVerseEditsForAllChangedVerses(oldProjectPath, newProjectPath, userName);
  }
};

export const copyAlignmentData = (fromDir, toDir) => {
  let fromFiles = fs.readdirSync(fromDir).filter(file => path.extname(file) === '.json').sort();
  let toFiles = [];
  if (fs.existsSync(toDir))
    toFiles = fs.readdirSync(toDir).filter(file => path.extname(file) === '.json').sort();
  fs.mkdirpSync(toDir);
  fromFiles.forEach(file => {
    let fromFileJson = fs.readJsonSync(path.join(fromDir, file));
    let toFileJson = {};
    const toFileIndex = toFiles.indexOf(file);
    if (toFileIndex >= 0) {
      toFileJson = fs.readJsonSync(path.join(toDir, toFiles[toFileIndex]));
    }
    Object.keys(fromFileJson).forEach(function (verseNum) {
      if(!toFileJson[verseNum] || !toFileJson[verseNum].alignments) {
        toFileJson[verseNum] = fromFileJson[verseNum];
      }  else {
        const alignments = fromFileJson[verseNum].alignments;
        let hasAlignments = false;
        alignments.forEach(alignment => {
          if (alignment.bottomWords.length > 0) {
            hasAlignments = true;
          }
        });
        if (hasAlignments) {
          toFileJson[verseNum] = fromFileJson[verseNum];
        }
      }
    });
    fs.writeJsonSync(path.join(toDir, file), toFileJson);
  });
};

export const getBookId = (projectPath) => {
  const manifest = fs.readJsonSync(path.join(projectPath, 'manifest.json'));
  return manifest.project.id;
};

export const getProjectName = (projectPath) => {
  return path.basename(projectPath);
};

export const createVerseEditsForAllChangedVerses = (oldProjectPath, newProjectPath, userName) => {
  const bookId = getBookId(newProjectPath);
  const oldBiblePath = path.join(oldProjectPath, bookId);
  const newBiblePath = path.join(newProjectPath, bookId);
  if (!fs.pathExistsSync(oldBiblePath) || !fs.pathExistsSync(newBiblePath))
    return;
  const chapterFiles = fs.readdirSync(oldBiblePath).filter(filename => path.extname(filename) == '.json' && parseInt(path.basename(filename)));
  chapterFiles.forEach(filename => {
    try {
      const chapter = parseInt(path.basename(filename));
      const oldChapterVerses = fs.readJsonSync(path.join(oldBiblePath, filename));
      const newChapterVerses = fs.readJsonSync(path.join(newBiblePath, filename));
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
          const verseEditsPath = path.join(newProjectPath, '.apps', 'translationCore', 'checkData', 'verseEdits', bookId, chapter.toString(), verse.toString());
          fs.outputJsonSync(path.join(verseEditsPath, newFilename.replace(/[:"]/g, '_')), verseEdit);
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
};

