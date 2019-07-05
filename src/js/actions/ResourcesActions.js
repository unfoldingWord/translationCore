/* eslint-disable no-console */
import consts from "./ActionTypes";
import fs from "fs-extra";
import path from "path-extra";
import ospath from "ospath";
import _ from "lodash";
import SimpleCache from "../helpers/SimpleCache";
import {getBibles, getContext, getProjectBookId, getSelectedToolName} from "../selectors";
// actions
import * as SettingsActions from "./SettingsActions";
// helpers
import * as ResourcesHelpers from "../helpers/ResourcesHelpers";
import * as SettingsHelpers from "../helpers/SettingsHelpers";
import {DEFAULT_GATEWAY_LANGUAGE} from "../helpers/gatewayLanguageHelpers";
import * as BibleHelpers from "../helpers/bibleHelpers";
import ResourceAPI from "../helpers/ResourceAPI";
import * as Bible from '../common/BooksOfTheBible';
import {
  ORIGINAL_LANGUAGE,
  TARGET_BIBLE,
  TARGET_LANGUAGE,
  TRANSLATION_WORDS,
  TRANSLATION_ACADEMY,
  TRANSLATION_HELPS
} from '../common/constants';

// constants
const USER_RESOURCES_PATH = path.join(ospath.home(), 'translationCore/resources');
const bookCache = new SimpleCache();

/**
 * Adds a bible to the resources reducer.
 * @param {String} languageId - language id: en, hi, el-x-koine, he.
 * @param {String} bibleId - name/label for bible: ult, udt, ust, ugnt.
 * @param {object} bibleData - data being saved in the bible property.
 */
export function addNewBible(languageId, bibleId, bibleData) {
  return ((dispatch) => {
    if (BibleHelpers.isOriginalLanguage(languageId)) {
      languageId = ORIGINAL_LANGUAGE;
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
    let bibleFolderPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles', bibleID); // ex. user/NAME/translationCore/resources/en/bibles/ult
    if (fs.existsSync(bibleFolderPath)) {
      let versionNumbers = fs.readdirSync(bibleFolderPath).filter(folder => { // filter out .DS_Store
        return folder !== '.DS_Store';
      }); // ex. v9
      const versionNumber = versionNumbers[versionNumbers.length - 1];
      let bibleVersionPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles', bibleID, versionNumber);
      let fileName = chapter + '.json';

      if (fs.existsSync(path.join(bibleVersionPath, bookId, fileName))) {
        bibleData = {};
        let bibleChapterData = fs.readJsonSync(path.join(bibleVersionPath, bookId, fileName));

        for (let i = 0, len = Object.keys(bibleChapterData).length; i < len; i++) {
          const verse = Object.keys(bibleChapterData)[i];

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
              bibleChapterData[i] = newVerse;
            }
          }
        }

        bibleData[chapter] = bibleChapterData;
        // get bibles manifest file
        bibleData["manifest"] = ResourcesHelpers.getBibleManifest(bibleVersionPath, bibleID);
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
 * Migrates the verses in a chapter to verse objects
 * @param chapterData
 * @return {*} a copy of the chapter data with verses formatted as objects.
 */
const migrateChapterToVerseObjects = chapterData => {
  const data = _.cloneDeep(chapterData);
  for (let verseNum of Object.keys(data)) {
    const verse = data[verseNum];
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
        data[verseNum] = newVerse;
      }
    }
  }
  return data;
};

/**
 * Loads an entire bible resource.
 * @param bibleId
 * @param bookId
 * @param languageId
 * @param version
 * @return {object}
 */
export const loadBookResource = (bibleId, bookId, languageId, version = null) => {
  try {
    const bibleFolderPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles', bibleId); // ex. user/NAME/translationCore/resources/en/bibles/ult
    if (fs.existsSync(bibleFolderPath)) {
      const versionNumbers = fs.readdirSync(bibleFolderPath).filter(folder => {
        return folder !== '.DS_Store';
      }); // ex. v9
      const versionNumber = version || versionNumbers[versionNumbers.length - 1];
      const bibleVersionPath = path.join(bibleFolderPath, versionNumber);
      const bookPath = path.join(bibleVersionPath, bookId);
      const cacheKey = 'book:' + bookPath;

      if(fs.existsSync(bookPath)) {
        let bibleData = bookCache.get(cacheKey);
        if(!bibleData) {
          // load bible
          bibleData = {};
          const files = fs.readdirSync(bookPath);

          for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];
            const chapterNumber = path.basename(file, '.json');
            if (!isNaN(chapterNumber)) {
              // load chapter
              const chapterData = fs.readJsonSync(path.join(bookPath, file));
              bibleData[chapterNumber] = migrateChapterToVerseObjects(chapterData);
            }
          }
          bibleData["manifest"] = ResourcesHelpers.getBibleManifest(bibleVersionPath, bibleId);

          // cache it
          bookCache.set(cacheKey, bibleData);
        }

        return bibleData;
      } else {
        console.warn(`Bible path not found: ${bookPath}`);
      }
    } else {
      console.log('Directory not found, ' + bibleFolderPath);
    }
    return null;
  } catch (error) {
    console.error(`Failed to load book. Bible: ${bibleId} Book: ${bookId} Language: ${languageId}`, error);
  }
};

/**
 * load a book of the bible into resources
 * @param bibleId
 * @param bookId
 * @param languageId
 * @param version
 * @return {Function}
 */
export const loadBibleBook = (bibleId, bookId, languageId, version = null) => (dispatch) => {
  const bibleData = loadBookResource(bibleId, bookId, languageId, version);
  if (bibleData) {
    dispatch(addNewBible(languageId, bibleId, bibleData));
  }
};

/**
 * Load all found books for a given language Id.
 * @param languageId
 * @return {Function}
 */
export const loadBiblesByLanguageId = (languageId) => {
  return (dispatch, getState) => {
    const bibleFolderPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles'); // ex. user/NAME/translationCore/resources/en/bibles/
    const bookId = getProjectBookId(getState());
    const bibles = getBibles(getState());
    // check if the languae id is already included in the bibles object.
    const isIncluded = Object.keys(bibles).includes(languageId);

    if (!isIncluded && fs.existsSync(bibleFolderPath) && bookId) {
      const bibleIds = fs.readdirSync(bibleFolderPath).filter(file => file !== ".DS_Store");
      bibleIds.forEach(bibleId => {
        dispatch(loadBibleBook(bibleId, bookId, languageId));
      });
    }
  };
};

/**
 * remove bible from resources
 * @param {Array} resources
 * @param {String} bibleId
 * @param {String} languageId
 */
function removeBibleFromList(resources, bibleId, languageId) {
  let pos = resources.findIndex(paneSetting =>
    ((paneSetting.bibleId === bibleId) && (paneSetting.languageId === languageId)));
  if (pos >= 0) {
    resources.splice(pos, 1); // remove entry already loaded
  }
}

/**
 * make sure we have selected the correct OL bible for testament that book is in.
 * @param {String} bookId
 * @return {Array} array of resource in scripture panel
 */
export const updateOrigLangPaneSettings = (bookId) => (dispatch, getState) => {
  const {bibleId} = BibleHelpers.getOrigLangforBook(bookId);
  const newCurrentPaneSettings = SettingsHelpers.getCurrentPaneSetting(getState());
  let changed = false;
  if (Array.isArray(newCurrentPaneSettings)) {
    const otherTestamentBible = BibleHelpers.isNewTestament(bookId) ? Bible.OT_ORIG_LANG_BIBLE : Bible.NT_ORIG_LANG_BIBLE;
    for (let setting of newCurrentPaneSettings) {
      let languageId = setting.languageId;
      if (languageId === ORIGINAL_LANGUAGE) {
        if (setting.bibleId !== bibleId) { // if need to check if bibles are valid in case previous selected project was in the other testament
          // TRICKY: we only want to change the bibleId in the case that UGNT is in SP when we selected an OT book, or when UBH
          //          is in SP and we selected a NT book.  There may be other original language books loaded and we don't
          //          want to mess with them.
          if (setting.bibleId === otherTestamentBible) { // if the original bible is from the opposite testament, we need to fix
            changed = true;
            setting.bibleId = bibleId; // set original bible ID for current testament
          }
        }
      }
    }
    if (changed) {
      dispatch(SettingsActions.setToolSettings("ScripturePane", "currentPaneSettings", newCurrentPaneSettings));
    }
  }
};

/**
 * make sure required bible books for current tool are loaded into resources
 */
export const makeSureBiblesLoadedForTool = () => (dispatch, getState) => {
  const toolName = getSelectedToolName(getState());
  const state = getState();
  const { bibles } = state.resourcesReducer;
  const contextId = getContext(state);
  const bookId = contextId && contextId.reference.bookId;
  dispatch(updateOrigLangPaneSettings(bookId));
  const resources = ResourcesHelpers.getResourcesNeededByTool(state, bookId, toolName);
  // remove bibles from resources list that are already loaded into resources reducer
  if (bookId && bibles && Array.isArray(resources)) {
    for (let languageId of Object.keys(bibles)) {
      if (bibles[languageId]) {
        for (let bibleId of Object.keys(bibles[languageId])) {
          const lang = (languageId === ORIGINAL_LANGUAGE) ?
            BibleHelpers.isOldTestament(bookId) ? Bible.OT_ORIG_LANG : Bible.NT_ORIG_LANG : languageId;
          removeBibleFromList(resources, bibleId, lang);
        }
      }
    }
  }
  // load resources not in resources reducer
  if (Array.isArray(resources)) {
    removeBibleFromList(resources, TARGET_BIBLE, TARGET_LANGUAGE);
    resources.forEach(paneSetting => dispatch(loadBibleBook(paneSetting.bibleId, bookId, paneSetting.languageId)));
  }
};

/**
 * Loads the target language book
 * @returns {Function}
 */
export function loadTargetLanguageBook() {
  return (dispatch, getState) => {
    const { projectDetailsReducer } = getState();
    const bookId = projectDetailsReducer.manifest.project.id;
    const projectPath = projectDetailsReducer.projectSaveLocation;
    const bookPath = path.join(projectPath, bookId);
    if (fs.existsSync(bookPath)) {
      const bookData = {};
      const files = fs.readdirSync(bookPath);

      for (let i = 0, len = files.length; i < len; i++) {
        const file = files[i];
        const chapterNumber = path.basename(file, ".json");
        if (!isNaN(chapterNumber)) {
          // load chapter
          bookData[chapterNumber] = fs.readJsonSync(
            path.join(bookPath, file));

        } else if (file === "manifest.json") {
          // load manifest
          bookData["manifest"] = fs.readJsonSync(
            path.join(bookPath, file));
        }
      }

      const projectManifestPath = path.join(projectPath, "manifest.json");
      if (fs.existsSync(projectManifestPath)) { // read user selections from manifest if present
        const manifest = fs.readJsonSync(projectManifestPath);
        if (manifest.target_language && manifest.target_language.id) {
          if (!bookData.manifest) {
            bookData.manifest = {};
          }
          bookData.manifest.language_id = manifest.target_language.id;
          bookData.manifest.language_name = manifest.target_language.name || manifest.target_language.id;
        }
      }

      dispatch(addNewBible(TARGET_LANGUAGE, TARGET_BIBLE, bookData));
    } else {
      console.warn(`Target book was not found at ${bookPath}`);
    }
  };
}

/**
 * Loads book data for each of the languages.
 * @param {string} bookId - the id of the book to load
 * @param {string} [toolName] - the tool name for which books will be loaded. If null the currently selected tool name is used.
 * @returns {Function}
 */
export const loadBookTranslations = (bookId, toolName=null) => async (dispatch, getState) => {
  if(toolName === null) {
    toolName = getSelectedToolName(getState());
  }

  // translations of the source book
  dispatch(loadSourceBookTranslations(bookId, toolName));

  // target book
  dispatch(loadTargetLanguageBook());
};

/**
 * Loads the translations of the source book required by the tool.
 * @param {string} bookId - the id of the source book to load
 * @param {string} toolName - the name of the tool for which the translations will be loaded.
 * @returns {Function}
 */
export const loadSourceBookTranslations = (bookId, toolName) => async (dispatch, getState) => {
  dispatch(updateOrigLangPaneSettings(bookId));

  const resources = ResourcesHelpers.getResourcesNeededByTool(getState(), bookId, toolName);
  const bibles = getBibles(getState());
  // Filter out bible resources that are already in the resources reducer
  const filteredResources = resources.filter(resource => {
    const isOriginalLanguage = BibleHelpers.isOriginalLanguageBible(resource.languageId, resource.bibleId);
    const languageId = isOriginalLanguage ? ORIGINAL_LANGUAGE : resource.languageId; // TRICKY: the original language can have many bibles, but only one we can use as reference
    const biblesForLanguage = bibles[languageId];
    return !(biblesForLanguage && biblesForLanguage[resource.bibleId]);
  });

  for (let i = 0, len = filteredResources.length; i < len; i++) {
    const resource = filteredResources[i];
    dispatch(loadBibleBook(resource.bibleId, bookId, resource.languageId));
  }
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
 * @param {String} resourceType - e.g. translationWords, translationNotes
 * @param {String} articleId
 * @param {String} languageId - languageId will be first checked, and then we'll try the default GL
 * @param {String} category - the articles category, e.g. other, kt, translate. If blank we'll try to guess it.
 * @returns {String} - the path to the file, null if doesn't exist
 * Note: resourceType is coming from a tool name
 */
export const findArticleFilePath = (resourceType, articleId, languageId, category='') => {
  const languageDirs = [];
  if (languageId) {
    languageDirs.push(languageId);
  }
  if (languageId !== DEFAULT_GATEWAY_LANGUAGE) {
    languageDirs.push(DEFAULT_GATEWAY_LANGUAGE);
  }
  let categories = [];
  if (! category ){
    if (resourceType === TRANSLATION_WORDS) {
      categories = ['kt', 'names', 'other'];
    } else if (resourceType === TRANSLATION_WORDS || resourceType === TRANSLATION_ACADEMY) {
      categories = ['translate', 'checking', 'process', 'intro'];
      resourceType = TRANSLATION_ACADEMY;
    } else {
      categories = ['content'];
    }
  } else {
    categories.push(category);
  }
  const articleFile = articleId + '.md';
  for(let i = 0, len = languageDirs.length; i < len; ++i) {
    let languageDir = languageDirs[i];
    let typePath = path.join(USER_RESOURCES_PATH, languageDir, TRANSLATION_HELPS, resourceType);
    let versionPath = ResourceAPI.getLatestVersion(typePath) || typePath;
    for(let j = 0, jLen = categories.length; j < jLen; ++j) {
      let categoryDir = categories[j];
      if (resourceType === TRANSLATION_WORDS) {
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
    try {
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
    } catch (error) {
      console.error(error);
    }
  });
};
