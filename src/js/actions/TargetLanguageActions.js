import fs from 'fs-extra';
import path from 'path-extra';

// actions
import * as ResourcesActions from './ResourcesActions';
// helpers
import * as USFMHelpers from '../helpers/usfmHelpers';
import { getBibleIndex } from '../helpers/ResourcesHelpers';
import * as UsfmFileConversionHelpers from '../helpers/FileConversionHelpers/UsfmFileConversionHelpers';
import {saveTargetBible} from "../helpers/Import/importHelpers";
import {processChapter} from "../helpers/Import/tStudioHelpers";

/**
 * @description Loads a target language bible chapter from file system.
 * @param {String} chapterNumber - chapter number to be loaded to resources reducer.
 */
export function loadTargetLanguageChapter(chapterNumber) {
  return ((dispatch, getState) => {
      const {projectDetailsReducer} = getState();
      const bookAbbreviation = projectDetailsReducer.manifest.project.id;
      const projectPath = projectDetailsReducer.projectSaveLocation;
      const targetBiblePath = path.join(projectPath, bookAbbreviation);
      const resourceId = "targetLanguage";
      const bibleId = 'targetBible';
      let targetLanguageChapter;
      const fileName = chapterNumber + '.json';
      if (fs.existsSync(path.join(targetBiblePath, fileName))) {
        targetLanguageChapter = fs.readJsonSync(path.join(targetBiblePath, fileName));
      } else {
         console.log("Target Bible was not found in the project root folder");
         return;
      }
      let bibleData = {};
      bibleData[chapterNumber] = targetLanguageChapter;
      if (fs.existsSync(path.join(targetBiblePath, "manifest.json"))) {
      bibleData['manifest'] = fs.readJsonSync(path.join(targetBiblePath, "manifest.json"));
      dispatch(ResourcesActions.addNewBible(resourceId, bibleId, bibleData));
    }
  });
}

/**
 * Processes USFM file to create tC project
 * @param usfmFilePath
 * @param projectPath
 * @param manifest
 */
export function generateTargetBibleFromUSFMPath(usfmFilePath, projectPath, manifest) {
  try {
    let usfmFile;
    let parsedUSFM;
    const filename = path.basename(usfmFilePath);
    usfmFilePath = fs.existsSync(usfmFilePath) ? usfmFilePath : path.join(projectPath, filename);
    if (fs.existsSync(usfmFilePath)) {
      usfmFile = fs.readFileSync(usfmFilePath).toString();
      parsedUSFM = USFMHelpers.getParsedUSFM(usfmFile);
    } else {
      console.warn('USFM not found');
      return;
    }
    const { chapters } = parsedUSFM;
    let targetBible = {};
    Object.keys(chapters).forEach((chapterNumber)=>{
      const chapterObject = chapters[chapterNumber];
      targetBible[chapterNumber] = {};
      Object.keys(chapterObject).forEach((verseNumber)=>{
        const verseData = chapterObject[verseNumber];
        targetBible[chapterNumber][verseNumber] = UsfmFileConversionHelpers.getUsfmForVerseContent(verseData);
      });
    });
    saveTargetBible(projectPath, manifest, targetBible);
  } catch (error) {
    console.warn('USFM not found');
    console.log(error);
  }
}

/**
 * Processes tStudio project files to create tC project
 * @param projectPath
 * @param manifest
 */
export function generateTargetBibleFromTstudioProjectPath(projectPath, manifest) {
  let bookData = {};
  // get the bibleIndex to get the list of expected chapters
  const bibleIndex = getBibleIndex('en', 'ult');
  if(!bibleIndex[manifest.project.id]) {
    console.warn(`Invalid book key ${manifest.project.id}. Expected a book of the Bible.`);
    return;
  }
  let header = '';
  const chapters = Object.keys(bibleIndex[manifest.project.id]);
  chapters.unshift( 'front', '0' ); // check for front matter folders
  chapters.forEach(chapter => {
    header = processChapter(chapter, projectPath, header, bookData);
  });
  saveTargetBible(projectPath, manifest, bookData, header);
}

