import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
import usfmjs from 'usfm-js';
// helpers
import * as USFMHelpers from '../helpers/usfmHelpers';
import { getBibleIndex } from '../helpers/ResourcesHelpers';
// constant declarations
const IMPORTED_SOURCE_PATH = '.apps/translationCore/importedSource';

/**
 * @description loads a target langugae bible chapter from file system.
 * @param {string} chapterNumber - chapter number to be loaded to resources reducer.
 */
export function loadTargetLanguageChapter(chapterNumber) {
  return ((dispatch, getState) => {
    try {
      const {projectDetailsReducer} = getState();
      const bookAbbreviation = projectDetailsReducer.manifest.project.id;
      const projectPath = projectDetailsReducer.projectSaveLocation;
      const targetBiblePath = path.join(projectPath, bookAbbreviation);
      const bibleName = "targetLanguage";
      let targetLanguageChapter;
      const fileName = chapterNumber + '.json';
      if (fs.existsSync(path.join(targetBiblePath, fileName))) {
        targetLanguageChapter = fs.readJsonSync(path.join(targetBiblePath, fileName));
      } else {
        console.log("Target Bible was not found in the project root folder");
      }
      let bibleData = {};
      bibleData[chapterNumber] = targetLanguageChapter;
      bibleData['manifest'] = fs.readJsonSync(path.join(targetBiblePath, "manifest.json"));
      dispatch({
        type: consts.ADD_NEW_BIBLE_TO_RESOURCES,
        bibleName,
        bibleData
      });
    } catch (err) {
      console.warn(err);
    }
  });
}

export function generateTargetBibleFromUSFMPath(usfmFilePath, projectPath, manifest) {
  const {parsedUSFM} = USFMHelpers.getProjectDetailsFromUSFM(usfmFilePath);
  const {chapters} = parsedUSFM;
  let targetBible = {};
  Object.keys(chapters).forEach((chapterNumber)=>{
    const chapterObject = chapters[chapterNumber];
    targetBible[chapterNumber] = {};
    Object.keys(chapterObject).forEach((verseNumber)=>{
      const verseArray = chapterObject[verseNumber];
      targetBible[chapterNumber][verseNumber] = verseArray.join(' ');
    });
   });
  saveTargetBible(projectPath, manifest, targetBible);
}

/**
 * @description generates a target language bible and saves it in the filesystem devided into chapters, assumes tS project
 * @param {string} projectPath - path where the project is located in the filesystem.
 * @param {object} USFMTargetLanguage - parsed JSON object of usfm target language for project
 */
export function saveTargetBible(projectPath, manifest, bookData) {
  let bookAbbreviation = manifest.project.id;
  const targetBiblePath = path.join(projectPath, bookAbbreviation);
  // now that bookData is populated or passed in, let's save it to the fs as chapter level json files
  for (var chapter in bookData) {
    if (!parseInt(chapter)) continue; // only import integer based data, there are other files
    let fileName = chapter + '.json';
    const targetBiblePath = path.join(projectPath, bookAbbreviation);
    fs.outputJsonSync(path.join(targetBiblePath, fileName), bookData[chapter]);
  }
  // generating and saving manifest file for target language bible.
  generateTartgetLanguageManifest(manifest, targetBiblePath);
  // Move bible source files from project's root folder to '.apps/translationCore/importedSource'
  archiveSourceFiles(projectPath, bookAbbreviation);
}

export function generateTargetBibleFromProjectPath(projectPath, manifest) {
  let bookData = {};
  // get the bibleIndex to get the list of expected chapters
  const bibleIndex = getBibleIndex('en', 'ulb', 'v11');
  const chapters = Object.keys(bibleIndex[manifest.project.id]);
  chapters.forEach(chapterNumber => {
    let chapterData = {}; // empty chapter to populate
    // 0 padding for single digit chapters
    const chapterNumberString = (chapterNumber < 10) ? '0' + chapterNumber.toString() : chapterNumber.toString();
    const chapterPath = path.join(projectPath, chapterNumberString);
    // the chapter may not be populated and there is a key called 'chapters' in the index
    const chapterPathExists = fs.existsSync(chapterPath);
    if (chapterPathExists) {
      const files = fs.readdirSync(chapterPath); // get the chunk files in the chapter path
      files.forEach(file => {
        let chunkFileNumber = file.match(/(\d+).txt/) || [""];
        if (chunkFileNumber[1]) { // only import chunk/verse files (digit based)
          const chunkPath = path.join(chapterPath, file);
          const text = fs.readFileSync(chunkPath);
          const currentChunk = usfmjs.toJSON(text.toString(), { chunk: true });

          if (currentChunk && currentChunk.chapters[chapterNumber]) {
            Object.keys(currentChunk.chapters[chapterNumber]).forEach((key) => {
              chapterData[key] = currentChunk.chapters[chapterNumber][key][0];
              bookData[parseInt(chapterNumber)] = chapterData;
            });
          } else if (currentChunk && currentChunk.verses) {
            Object.keys(currentChunk.verses).forEach((key) => {
              chapterData[key] = currentChunk.verses[key][0];
              bookData[parseInt(chapterNumber)] = chapterData;
            });
          }
        }
      });
    }
  });
  saveTargetBible(projectPath, manifest, bookData);
}

/**
 * @description helper function to generate a manifest file for a target language bible.
 * @param {object} projectManifest - projects manifest file.
 * @param {string} targetBiblePath - path where the target language bible is saved in the file system.
 */
function generateTartgetLanguageManifest(projectManifest, targetBiblePath) {
  let bibleManifest = {};
  bibleManifest.language_id = projectManifest.target_language.id;
  bibleManifest.language_name = projectManifest.target_language.name;
  bibleManifest.direction = projectManifest.target_language.direction;
  bibleManifest.subject = "Bible";
  bibleManifest.resource_id = "targetLanguage";
  bibleManifest.resource_title = "";
  bibleManifest.description = "Target Language";
  // savings target language bible manifest file in project target language bible path.
  let fileName = "manifest.json";
  fs.outputJsonSync(path.join(targetBiblePath, fileName), bibleManifest);
}

/**
 * @description helper function that Moves bible source files from project's root folder to '.apps/translationCore/importedSource'.
 * @param {string} projectPath - project save location / path.
 * @param {string} bookAbbreviation - the directory name of the book so we don't move it
 */
function archiveSourceFiles(projectPath, bookAbbreviation) {
  // get all of the directories/files in the projectPath
  fs.readdirSync(projectPath)
    .forEach(file => {
      // check for conditions in which we need to archive
      const isDirectory = fs.lstatSync(path.join(projectPath, file)).isDirectory();
      const isBookAbbreviation = file === bookAbbreviation;
      const isDotFile = !!file.match(/^\./);
      const isUSFM = !!file.toLowerCase().match('.usfm') || !!file.toLowerCase().match('.sfm');
      // build the condition to move
      const shouldMove = isUSFM || (isDirectory && !isBookAbbreviation && !isDotFile);
      if (shouldMove) {
        const directory = file;
        const sourcePath = path.join(projectPath, directory);
        // try to move the directories and log the errors
        try {
          let targetPath = path.join(projectPath, IMPORTED_SOURCE_PATH, directory);
          if (!fs.existsSync(targetPath))
            fs.moveSync(sourcePath, targetPath);
        } catch (err) {
          console.log(err);
        }
      }
    });
}
