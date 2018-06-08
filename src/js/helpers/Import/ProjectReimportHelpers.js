import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import isEqual from 'deep-equal';
import { checkSelectionOccurrences } from 'selections';
// actions
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as TargetLanguageActions from '../../actions/TargetLanguageActions';
// helpers
import {generateTimestamp} from '../index';
// selectors
import {getTranslate, getUsername} from '../../selectors';

// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

/**
 * @description Import Helpers for moving the contents of projects to `~/translationCore/imports` while importing
 * and to `~/translationCore/projects` after migrations and validation.
 * @param {String} projectName
 */
export const preserveExistingProjectChecks = (projectName) => {
  return async (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      const translate = getTranslate(getState());
      const importPath = path.join(IMPORTS_PATH, projectName);
      const projectPath = path.join(PROJECTS_PATH, projectName);

      // if project dir doesn't exist, it must have been deleted after tC was started. We throw an error and tell them to import the project again
      if (!fs.existsSync(projectPath)) {
        fs.removeSync(importPath);
        // two translatable strings are concatenated for response.
        const compoundMessage = translate('projects.project_does_not_exist', {project_path: projectName}) + 
          " " + translate('projects.import_again_as_new_project');
        reject(compoundMessage);
        // if project exists then update import from projects
      } else {
        // copy import contents to project
        if (fs.existsSync(projectPath) && fs.existsSync(importPath)) {
          let projectAppsPath = path.join(projectPath, '.apps');
          let importAppsPath = path.join(importPath, '.apps');
          if (fs.existsSync(projectAppsPath)) {
            if (!fs.existsSync(importAppsPath)) {
              // This wasn't an import of USFM3 so no alignment data exists, can just keep the .apps directory from the project directory
              await fs.copySync(path.join(projectPath, '.apps'), path.join(importPath, '.apps'));
            } else {
              // There is some alignment data from the import, as it must have been USFM3, so we preserve it
              // as we copy the rest of the project's .apps data into the import
              let alignmentPath = path.join(importAppsPath, 'translationCore', 'alignmentData');
              if (fs.existsSync(alignmentPath)) {
                let tempAlignmentPath = path.join(importPath, '.temp_alignmentData');
                await fs.moveSync(alignmentPath, tempAlignmentPath); // moving new alignment data to a temp dir
                await fs.removeSync(importAppsPath); // .apps dir can be removed since we only need alignment data
                await fs.copySync(projectAppsPath, importAppsPath); // copying the existing project's .apps dir to preserve it
                const manifest = await fs.readJsonSync(path.join(projectPath, 'manifest.json'));
                await copyAlignmentData(path.join(tempAlignmentPath, manifest.project.id), path.join(alignmentPath, manifest.project.id)); // Now we overwrite any alignment data of the project from the import
                await fs.removeSync(tempAlignmentPath); // Done with the temp alignment dir
              }
            }
          }
          if (fs.existsSync(path.join(projectPath, '.git')))
            await fs.copySync(path.join(projectPath, '.git'), path.join(importPath, '.git'));
          resolve(importPath);
        } else {
          reject({
            message: 'projects.not_found',
            data: {
              projectName,
              projectPath
            }
          });
        }
      }
    });
  };
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
    if(index >= 0){
      toFileJson = fs.readJsonSync(path.join(toDir, toFiles[index]));
    }
    Object.keys(fromFileJson).forEach(function(verseNum) {
      if(! toFileJson[verseNum] || (fromFileJson[verseNum].bottomWords && fromFileJson[verseNum].bottomWords.length > 0))
        toFileJson[verseNum] = fromFileJson[verseNum];
    });
    fs.writeJsonSync(path.join(toDir, file), toFileJson);
  });
};

export const handleProjectReimport = (callback) => {
  return async (dispatch, getState) => {
    return new Promise(async (resolve) => {
      const {
        selectedProjectFilename
      } = getState().localImportReducer;
      const projectPath = path.join(PROJECTS_PATH, selectedProjectFilename);
      await dispatch(preserveExistingProjectChecks(selectedProjectFilename));
      await dispatch(createVerseEditsForAllChangedVerses());
      await dispatch(createInvalidatedsForAllCheckData());
      await fs.removeSync(projectPath);
      await dispatch(callback());
      resolve();
    });
  };
};

/**
 * Displays a confirmation dialog before users access the internet.
 * @param {string} message - the message in the alert box
 * @param {func} onConfirm - callback when the user allows reimport
 * @param {func} onCancel - callback when the user denies reimport
 * @return {Function} - returns a thunk for redux
 */
export const confirmReimportDialog = (message, onConfirm, onCancel) => {
  return ((dispatch, getState) => {
    const translate = getTranslate(getState());
    const confirmText = translate('buttons.overwrite_project');
    const cancelText = translate('buttons.cancel_button');
    dispatch(AlertModalActions.openOptionDialog(message,
      (result) => {
        if (result !== cancelText) {
          dispatch(AlertModalActions.closeAlertDialog());
          onConfirm();
        } else {
          dispatch(AlertModalActions.closeAlertDialog());
          onCancel();
        }
      }, confirmText, cancelText)
    );
  });
};

export const createVerseEditsForAllChangedVerses = () => {
  return ((dispatch, getState) => {
    let state = getState();
    const projectName = state.localImportReducer.selectedProjectFilename;
    const bookId = state.projectDetailsReducer.manifest.project.id;
    const projectPath = path.join(PROJECTS_PATH, projectName);
    const importPath = path.join(IMPORTS_PATH, projectName);
    const projectBiblePath = path.join(projectPath, bookId);
    const importBiblePath = path.join(importPath, bookId);
    if( ! fs.pathExistsSync(projectBiblePath) || ! fs.pathExistsSync(importBiblePath))
      return;
    let chapterFiles = fs.readdirSync(projectBiblePath);
    chapterFiles = chapterFiles.filter(filename => path.extname(filename) == '.json' && parseInt(path.basename(filename)));
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
            const userName = getUsername(state);
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
              gatewayLanguageQuote: 'Chapter '+chapter,
              contextId: {
                reference: {
                  bookId: bookId,
                  chapter,
                  verse
                },
                tool: 'wordAlignment',
                groupId: 'chapter_'+chapter
              },
            };
            const newFilename = modifiedTimestamp + '.json';
            const verseEditsPath = path.join(importPath, '.apps', 'translationCore', 'checkData', 'verseEdits', bookId, chapter.toString(), verse.toString());
            fs.outputJSONSync(path.join(verseEditsPath, newFilename.replace(/[:"]/g, '_')), verseEdit);
          }
        });
      } catch (e) {
        console.log(e);
      }
    });
  });
};

export const createInvalidatedsForAllCheckData = () => {
  return ((dispatch, getState) => {
    let state = getState();
    const projectName = state.localImportReducer.selectedProjectFilename;
    const projectPath = path.join(IMPORTS_PATH, projectName);
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
