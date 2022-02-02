import fs from 'fs-extra';
import path from 'path-extra';

// helpers
import { DEFAULT_OWNER } from '../common/constants';
import * as USFMHelpers from './usfmHelpers';
import { getBibleIndex } from './ResourcesHelpers';
import * as UsfmFileConversionHelpers from './FileConversionHelpers/UsfmFileConversionHelpers';
import { saveTargetBible } from './Import/importHelpers';
import { processChapter } from './Import/tStudioHelpers';


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
  const bibleIndex = getBibleIndex('en', 'ult', null, DEFAULT_OWNER);

  if (!bibleIndex[manifest.project.id]) {
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

/**
 * Check if the given project path has a target bible already created
 * i.e. en_tit/tit
 * @param {string} projectPath - Path of the project
 * @param {object} manifest - manifest for the project
 * @return {boolean} - Whether or not the target bible path exists
 */
export function targetBibleExists(projectPath, manifest) {
  return fs.existsSync(path.join(projectPath, manifest.project.id));
}
