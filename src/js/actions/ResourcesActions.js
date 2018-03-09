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
import { DEFAULT_GATEWAY_LANGUAGE } from '../helpers/LanguageHelpers';
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
 * @param {String} category = The category of this tW or tA, e.g. kt, other, translate. Can be blank
 */
export const loadResourceArticle = (resourceType, articleId, languageId, category='') => {
  return ((dispatch) => {
    const articleData = loadArticleData(resourceType, articleId, languageId, category);
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
 * Get the content of an article from disk
 * @param {String} resourceType 
 * @param {String} articleId 
 * @param {String} languageId 
 * @param {String} category - Category of the article, e.g. kt, other, translate, etc. Can be blank.
 * @returns {String} - the content of the article
 */
export const loadArticleData = (resourceType, articleId, languageId, category='') => {
  let articleData = '# Article Not Found: '+articleId+' #\n\nCould not find article for '+articleId;
  const articleFilePath = findArticleFilePath(resourceType, articleId, languageId, category);
  if (articleFilePath) {
    articleData = fs.readFileSync(articleFilePath, 'utf8'); // get file from fs
  }
  return articleData;
};

/**
 * Finds the article file within a resoure type's path, looking at both the given language and default language in all possible category dirs
 * @param {String} resourceType - e.g. translationWords, translationAcademy
 * @param {String} articleId
 * @param {String} languageId - languageId will be first checked, and then we'll try the default GL
 * @param {String} category - the articles category, e.g. other, kt, translate. If blank we'll try to guess it.
 * @returns {String} - the path to the file, null if doesn't exist
 */
export const findArticleFilePath = (resourceType, articleId, languageId, category='') => {
  const languageDirs = [];
  if (languageId) {
    languageDirs.push(languageId);
  }
  if (languageId != DEFAULT_GATEWAY_LANGUAGE) {
    languageDirs.push(DEFAULT_GATEWAY_LANGUAGE);
  }
  let categories = [];
  if (! category ){
    if (resourceType === 'translationWords') {
      categories = ['kt', 'names', 'other'];
    } else if (resourceType == 'translationAcademy') {
      categories = ['translate', 'checking', 'process', 'intro'];
    } else {
      categories = ['content'];
    }
  } else {
    categories.push(category);
  }
  const articleFile = articleId + '.md';
  for(let i = 0; i < languageDirs.length; ++i) {
    let languageDir = languageDirs[i];
    let typePath = path.join(USER_RESOURCES_PATH, languageDir, 'translationHelps', resourceType);
    let versionPath = ResourcesHelpers.getLatestVersionInPath(typePath) || typePath;
    for(let j = 0; j < categories.length; ++j) {
      let categoryDir = categories[j];
      if (resourceType === 'translationWords') {
        categoryDir = path.join(categoryDir, 'articles');
      }
      let articleFilePath = path.join(versionPath, categoryDir, articleFile);
      if (fs.existsSync(articleFilePath)) {
        return articleFilePath;
      }
    }
  }
  return null;
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
