import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as TargetLanguageActions from './TargetLanguageActions';
import * as AlertModalActions from './AlertModalActions';
// helpers
import * as ResourcesHelpers from '../helpers/ResourcesHelpers';
// constant declaraton
const RESOURCES_DATA_DIR = path.join('.apps', 'translationCore', 'resources');
const BIBLE_RESOURCES_PATH = path.join(path.homedir(), 'translationCore/resources/bibles');

export const addNewBible = (bibleName, bibleData) => {
  return {
    type: consts.ADD_NEW_BIBLE_TO_RESOURCES,
    bibleName,
    bibleData
  };
};

export function loadBiblesChapter(contextId) {
  return ((dispatch, getState) => {
      let bookId = contextId.reference.bookId; // bible book abbreviation.
      let chapter = contextId.reference.chapter;
      let biblesFolders = fs.readdirSync(BIBLE_RESOURCES_PATH).filter(folder => { // filter out .DS_Store
        return folder !== '.DS_Store'
      })
      biblesFolders.forEach((bibleID, index) => {
        let bibleFolderPath = path.join(BIBLE_RESOURCES_PATH, bibleID); // ex. user/NAME/translationCore/resources/bibles/ulb-en
        let versionNumber = fs.readdirSync(bibleFolderPath).filter(folder => { // filter out .DS_Store
          return folder !== '.DS_Store'
        }) // ex. v9
        let bibleVersionPath = path.join(BIBLE_RESOURCES_PATH, bibleID, versionNumber[0]);
        let fileName = chapter + '.json';
        if(fs.existsSync(path.join(bibleVersionPath, bookId, fileName))) {
          let bibleChapterData = fs.readJsonSync(path.join(bibleVersionPath, bookId, fileName));
          let bibleData = {};
          bibleData[chapter] = bibleChapterData;
          dispatch({
            type: consts.ADD_NEW_BIBLE_TO_RESOURCES,
            bibleName: bibleID,
            bibleData
          })
        } else {
          console.log('No such file or directory was found, ' + path.join(bibleVersionPath, bookId, fileName))
        }
      });
      // then load target language bible
      dispatch(TargetLanguageActions.loadTargetLanguageChapter(chapter));
  });
}

export function getResourcesFromStaticPackage() {
  return ((dispatch, getState) => {
    ResourcesHelpers.getBibleFromStaticPackage();
    ResourcesHelpers.getTHelpsFromStaticPackage();
  });
}
