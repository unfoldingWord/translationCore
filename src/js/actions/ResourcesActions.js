/* eslint-disable no-console */
import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// actions
import * as TargetLanguageActions from './TargetLanguageActions';
import * as WordAlignmentLoadActions from './WordAlignmentLoadActions';
// helpers
import * as ResourcesHelpers from '../helpers/ResourcesHelpers';
// constants
const USER_RESOURCES_PATH = path.join(ospath.home(), 'translationCore/resources');

/**
 * Adds a bible to the resources reducer.
 * @param {String} languageId - language id: en, hi, grc, he.
 * @param {String} bibleId - name/label for bible: ulb, udb, ugnt.
 * @param {object} bibleData - data being saved in the bible property.
 */
export function addNewBible(languageId, bibleId, bibleData) {
  return ((dispatch) => {
    if (languageId.toLowerCase() === 'grc' || languageId.toLowerCase() === 'he') {
      languageId = 'originalLanguage';
    }
    dispatch({
      type: consts.ADD_NEW_BIBLE_TO_RESOURCES,
      languageId: languageId,
      bibleId: bibleId,
      bibleData
    });
  });
}

/**
 * get chapter from specific resource
 * @param {String} bibleID
 * @param {String} bookId
 * @param {String} languageId
 * @param {String} chapter
 * @return {Object} contains chapter data
 */
export const loadChapterResource = function (bibleID, bookId, languageId, chapter) {
  try {
    let bibleData;
    let bibleFolderPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles', bibleID); // ex. user/NAME/translationCore/resources/en/bibles/ulb
    if (fs.existsSync(bibleFolderPath)) {
      let versionNumbers = fs.readdirSync(bibleFolderPath).filter(folder => { // filter out .DS_Store
        return folder !== '.DS_Store';
      }); // ex. v9
      const versionNumber = versionNumbers[versionNumbers.length - 1];
      let bibleVersionPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles', bibleID, versionNumber);
      // get bibles manifest file
      let bibleManifest = ResourcesHelpers.getBibleManifest(bibleVersionPath, bibleID);
      // save manifest data in bibleData object
      bibleData = {};
      bibleData["manifest"] = bibleManifest;
      let fileName = chapter + '.json';
      if (fs.existsSync(path.join(bibleVersionPath, bookId, fileName))) {
        let bibleChapterData = fs.readJsonSync(path.join(bibleVersionPath, bookId, fileName));

        for (let verseNum of Object.keys(bibleChapterData)) {
          const verse = bibleChapterData[verseNum];
          if (typeof verse !== 'string') {
            if (!verse.verseObjects) { // using old format so convert
              let newVerse = [];
              for (let word of verse) {
                if (word) {
                  if (typeof word !== 'string') {
                    newVerse.push(word);
                  }
                  else {
                    newVerse.push({
                      "type": "text",
                      "text": word
                    });
                  }
                }
              }
              bibleChapterData[verseNum] = newVerse;
            }
          }
        }

        bibleData[chapter] = bibleChapterData;
        // get bibles manifest file
        const bibleManifest = ResourcesHelpers.getBibleManifest(bibleVersionPath, bibleID);
        // save manifest data in bibleData object
        bibleData["manifest"] = bibleManifest;
      } else {
        console.log('No such file or directory was found, ' + path.join(bibleVersionPath, bookId, fileName));
      }
    } else {
      console.log('Directory not found, ' + bibleFolderPath);
    }
    return bibleData;
  } catch (error) {
    console.error(error);
  }
};

/**
 * @description loads a bibles chapter based on contextId
 * @param {object} contextId - object with all data for current check.
 */
export const loadBiblesChapter = (contextId) => {
  return ((dispatch, getState) => {
    try {
      let bookId = contextId.reference.bookId; // bible book abbreviation.
      let chapter = contextId.reference.chapter;
      const { currentToolName } = getState().toolsReducer;
      const languagesIds = ResourcesHelpers.getLanguageIdsFromResourceFolder(bookId);

      languagesIds.forEach((languageId) => {
        const biblesPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles');
        if(fs.existsSync(biblesPath)) {
          let biblesFolders = fs.readdirSync(biblesPath)
            .filter(folder => folder !== '.DS_Store'); // filter out .DS_Store
          biblesFolders.forEach((bibleId) => { // bibleId = ulb, udb, ugnt.
            const bibleData = loadChapterResource(bibleId, bookId, languageId, chapter);
            if (bibleData) {
              dispatch(addNewBible(languageId, bibleId, bibleData));
            }
          });
        } else {
          console.log('Directory not found, ' + biblesPath);
          return;
        }
      });
      // Then load target language bible
      dispatch(TargetLanguageActions.loadTargetLanguageChapter(chapter));
      if (currentToolName === 'wordAlignment') {
        dispatch(WordAlignmentLoadActions.loadAlignmentData());
      }
    } catch(err) {
      console.warn(err);
    }
  });
};
/**
 * @description - Get the lexicon entry and add it to the reducer
 * @param {String} resourceType - the type of resource to populate
 * @param {String} articleId - the id of the article to load into the reducer
 * @param {String} languageId = the id of the resource language
 */
export const loadResourceArticle = (resourceType, articleId, languageId) => {
  return ((dispatch) => {
    const typePath = path.join(USER_RESOURCES_PATH, languageId, 'translationHelps', resourceType);
    const versionPath = ResourcesHelpers.getLatestVersionInPath(typePath) || typePath;
    // generate path from resourceType and articleId
    let resourceFilename = articleId + '.md';
    let articlesPath = resourceType === 'translationWords' ? path.join('kt', 'articles', resourceFilename) : path.join('content', resourceFilename);
    let resourcePath = path.join(versionPath, articlesPath);
    let articleData;
    if (fs.existsSync(resourcePath)) {
      articleData = fs.readFileSync(resourcePath, 'utf8'); // get file from fs
    } else {
      // if article isnt found in the kt folder (key terms) then try to find it in the other folder.
      resourcePath = path.join(versionPath, 'other', 'articles', resourceFilename);
      articleData = fs.readFileSync(resourcePath, 'utf8'); // get file from fs
    }
    // populate reducer with markdown data
    dispatch({
      type: consts.ADD_TRANSLATIONHELPS_ARTICLE,
      resourceType,
      articleId,
      languageId,
      articleData
    });
  });
};
/**
 * @description - Get the lexicon entry and add it to the reducer
 * @param {String} lexiconId - the id of the lexicon to populate
 * @param {Number} entryId - the number of the entry
 */
export const loadLexiconEntry = (lexiconId, entryId) => {
  return ((dispatch) => {
    let languageId = 'en';
    let resourceVersion = 'v0';
    // generate path from resourceType and articleId
    let lexiconPath = path.join(USER_RESOURCES_PATH, languageId, 'lexicons', lexiconId, resourceVersion, 'content');
    let entryPath = path.join(lexiconPath, entryId + '.json');
    let entryData;
    if (fs.existsSync(entryPath)) {
      entryData = fs.readJsonSync(entryPath, 'utf8'); // get file from fs
    }
    // populate reducer with markdown data
    dispatch({
      type: consts.ADD_LEXICON_ENTRY,
      lexiconId,
      entryId,
      entryData
    });
  });
};
/**
 * @description gets the resources from the static folder located in the tC codebase.
 */
export const getResourcesFromStaticPackage = (force) => {
  ResourcesHelpers.getBibleFromStaticPackage(force);
  ResourcesHelpers.getTHelpsFromStaticPackage(force);
  ResourcesHelpers.getLexiconsFromStaticPackage(force);
};
