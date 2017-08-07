/* eslint-disable no-console */
import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as TargetLanguageActions from './TargetLanguageActions';
// helpers
import * as ResourcesHelpers from '../helpers/ResourcesHelpers';
// constant declaraton
const USER_RESOURCES_PATH = path.join(path.homedir(), 'translationCore/resources');

/**
 * @description adds a bible to the resoiurces reducer' bibles property.
 * @param {string} bibleName - name/label for bible.
 * @param {object} bibleData - data being saved in the bible property.
 */
export const addNewBible = (bibleName, bibleData) => {
  return {
    type: consts.ADD_NEW_BIBLE_TO_RESOURCES,
    bibleName,
    bibleData
  };
};

/**
 * @description loads a bibles chapter based on contextId
 * @param {object} contextId - object with all data for current check.
 */
export const loadBiblesChapter = (contextId) => {
  return ((dispatch) => {
    try {
      let bookId = contextId.reference.bookId; // bible book abbreviation.
      let chapter = contextId.reference.chapter;

      let languagesIds = ['en', 'grc', 'he']; // english, greek, hebrew.
      languagesIds.forEach((languageId) => {
        let biblesFolders = fs.readdirSync(path.join(USER_RESOURCES_PATH, languageId, 'bibles')).filter(folder => { // filter out .DS_Store
        return folder !== '.DS_Store'
        })
        biblesFolders.forEach((bibleID) => {
          let bibleFolderPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles', bibleID); // ex. user/NAME/translationCore/resources/en/bibles/ulb
          let versionNumber = fs.readdirSync(bibleFolderPath).filter(folder => { // filter out .DS_Store
            return folder !== '.DS_Store'
          }) // ex. v9
          let bibleVersionPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles', bibleID, versionNumber[0]);
          let fileName = chapter + '.json';
          if(fs.existsSync(path.join(bibleVersionPath, bookId, fileName))) {
            let bibleChapterData = fs.readJsonSync(path.join(bibleVersionPath, bookId, fileName));
            let bibleData = {};
            bibleData[chapter] = bibleChapterData;
            // get bibles manifest file
            let bibleManifest = ResourcesHelpers.getBibleManifest(bibleVersionPath, bibleID);
            // save manifest dat in bibleData object to then be saved in reducer.
            bibleData["manifest"] = bibleManifest;
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
    } catch(err) {
      console.warn(err);
    }
  });
}

export const loadResourceArticle = (resourceType, articleId) => {
  return ((dispatch) => {
    let languageId = 'en';
    let resourceVersion = resourceType === 'translationWords' ? 'v6' : 'v0';
    // generate path from resourceType and articleId
    let resourceFilename = articleId + '.md';
    let articlesPath = resourceType === 'translationWords' ? path.join('kt', 'articles', resourceFilename) : path.join('content', resourceFilename);
    let resourcePath = path.join(USER_RESOURCES_PATH, languageId, 'translationHelps', resourceType, resourceVersion, articlesPath);
    let articleData
    if (fs.existsSync(resourcePath)) {
      articleData = fs.readFileSync(resourcePath, 'utf8'); // get file from fs
    } else {
      // if article isnt found in the kt folder (key terms) then try to find it in the other folder.
      resourcePath = path.join(USER_RESOURCES_PATH, languageId, 'translationHelps', resourceType, resourceVersion, 'other', 'articles', resourceFilename);
      articleData = fs.readFileSync(resourcePath, 'utf8'); // get file from fs
    }
    // populate reducer with markdown data
    dispatch({
      type: consts.ADD_TRANSLATIONHELPS_ARTICLE,
      resourceType,
      articleId,
      articleData
    });
  });
}
/**
 * @description gets the resources from the static folder located in the tC codebase.
 */
export const getResourcesFromStaticPackage = (force) => {
  ResourcesHelpers.getBibleFromStaticPackage(force);
  ResourcesHelpers.getTHelpsFromStaticPackage(force);
}
