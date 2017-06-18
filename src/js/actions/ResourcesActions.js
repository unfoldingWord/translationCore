import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as TargetLanguageActions from './TargetLanguageActions'
// constant declaraton
const RESOURCES_DATA_DIR = path.join('.apps', 'translationCore', 'resources');
const BIBLE_RESOURCES_PATH = path.join(path.homedir(), 'translationCore/resources/bibles');
const STATIC_RESOURCES_BIBLES_PATH = './static/resources/bibles';

export const addNewBible = (bibleName, bibleData) => {
  return {
    type: consts.ADD_NEW_BIBLE_TO_RESOURCES,
    bibleName,
    bibleData
  };
};

export const addNewResource = (resourceName, resourceData, namespace) => {
  return ((dispatch, getState) => {
    dispatch({
      type: consts.ADD_NEW_RESOURCE,
      resourceName,
      resourceData,
      namespace
    });
  });
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

// TODO  
export function getBibleFromStaticPackage(bibleId) {
  return ((dispatch, getState) => {
    let bibleIdNames = fs.readdirSync(STATIC_RESOURCES_BIBLES_PATH);
    
    fs.copySync(STATIC_RESOURCES_BIBLES_PATH, BIBLE_RESOURCES_PATH + '/new');
  });
}

/**
 * @description loads bibles from the filesystem and saves them in the resources reducer.
 */
export function loadBiblesFromFS() {
  return ((dispatch, getState) => {
    const projectSaveLocation = getState().projectDetailsReducer.projectSaveLocation;
    const biblesDirectory = path.join(projectSaveLocation, RESOURCES_DATA_DIR, 'bibles');

    if (fs.existsSync(biblesDirectory)) {
      let biblesObjects = fs.readdirSync(biblesDirectory);

      biblesObjects = biblesObjects.filter(file => { // filter the filenames to only use .json
        return path.extname(file) === '.json';
      });

      for (let bibleName in biblesObjects) {
        if (biblesObjects.hasOwnProperty(bibleName)) {
          let currentBibleName = biblesObjects[bibleName].replace('.json', '');
          let bibleData = fs.readJsonSync(path.join(biblesDirectory, biblesObjects[bibleName]));
          if (bibleData) {
            dispatch(addNewBible(currentBibleName, bibleData));
          } else {
            console.warn("Couldn't load " + currentBibleName + "bible");
          }
        }
      }
    } else {
      console.warn(biblesDirectory + " directory: doesnt exist");
    }
  });
}
