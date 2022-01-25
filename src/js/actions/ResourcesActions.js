/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
import fs from 'fs-extra';
import path from 'path-extra';
import _ from 'lodash';
import env from 'tc-electron-env';
import { resourcesHelpers } from 'tc-source-content-updater';
import SimpleCache from '../helpers/SimpleCache';
import {
  getBibles,
  getCurrentToolName,
  getProjectBookId,
  getTranslate,
} from '../selectors';
// actions
// helpers
import * as ResourcesHelpers from '../helpers/ResourcesHelpers';
import * as SettingsHelpers from '../helpers/SettingsHelpers';
import * as BibleHelpers from '../helpers/bibleHelpers';
import * as Bible from '../common/BooksOfTheBible';
import {
  DEFAULT_OWNER,
  ORIGINAL_LANGUAGE,
  TARGET_BIBLE,
  TARGET_LANGUAGE,
} from '../common/constants';
import * as SettingsActions from './SettingsActions';
import consts from './ActionTypes';
import { OWNER_SEPARATOR } from 'tc-source-content-updater/lib/helpers/apiHelpers';

// constants
const USER_RESOURCES_PATH = path.join(env.home(), 'translationCore/resources');
const bookCache = new SimpleCache();

/**
 * Adds a bible to the resources reducer.
 * @param {String} languageId - language id: en, hi, el-x-koine, he.
 * @param {String} bibleId - name/label for bible: ult, udt, ust, ugnt.
 * @param {object} bibleData - data being saved in the bible property.
 * @param {string} owner
 */
export function addNewBible(languageId, bibleId, bibleData, owner) {
  return ((dispatch) => {
    if (BibleHelpers.isOriginalLanguage(languageId)) {
      languageId = ORIGINAL_LANGUAGE;
    }
    dispatch({
      type: consts.ADD_NEW_BIBLE_TO_RESOURCES,
      languageId: languageId,
      bibleId: bibleId,
      bibleData,
      owner,
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
      let versionNumbers = fs.readdirSync(bibleFolderPath).filter(folder => // filter out .DS_Store
        folder !== '.DS_Store',
      ); // ex. v9
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
                  } else {
                    newVerse.push({
                      'type': 'text',
                      'text': word,
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
        bibleData['manifest'] = ResourcesHelpers.getBibleManifest(bibleVersionPath, bibleID);
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
            } else {
              newVerse.push({
                'type': 'text',
                'text': word,
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
 * Returns the versioned folder within the directory with the highest value.
 * e.g. `v10` is greater than `v9`
 * @param {Array} versions - list of versions found
 * @param {string} ownerStr - optional owner, if not given defaults to Door43-Catalog
 * @returns {string|null} the latest version found
 */
export const getLatestVersion = (versions, ownerStr) => resourcesHelpers.getLatestVersionFromList(versions, ownerStr);

/**
 * Loads a bible book resource.
 * @param bibleId
 * @param bookId
 * @param languageId
 * @param version
 * @param {string} owner
 * @return {object}
 */
export const loadBookResource = (bibleId, bookId, languageId, version = null, owner = DEFAULT_OWNER) => {
  try {
    const bibleFolderPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles', bibleId); // ex. user/NAME/translationCore/resources/en/bibles/ult

    if (fs.existsSync(bibleFolderPath)) {
      const versionNumbers = fs.readdirSync(bibleFolderPath).filter(folder => folder !== '.DS_Store'); // ex. v9
      const versionNumber = version || getLatestVersion(versionNumbers, owner);
      const bibleVersionPath = path.join(bibleFolderPath, versionNumber);
      const bookPath = path.join(bibleVersionPath, bookId);
      const cacheKey = 'book:' + bookPath;

      if (fs.existsSync(bookPath)) {
        let bibleData = bookCache.get(cacheKey);

        if (!bibleData) {
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
          bibleData['manifest'] = ResourcesHelpers.getBibleManifest(bibleVersionPath, bibleId);

          // cache it
          bookCache.set(cacheKey, bibleData);
        }

        console.log(`loadBookResource() - Loaded ${bibleId}, ${bookId}, ${languageId}, ${versionNumber}`);
        return bibleData;
      } else {
        console.warn(`loadBookResource() - Bible path not found: ${bookPath}`);
      }
    } else {
      console.log('loadBookResource() - Directory not found, ' + bibleFolderPath);
    }
  } catch (error) {
    console.error(`loadBookResource() - Failed to load book. Bible: ${bibleId} Book: ${bookId} Language: ${languageId}`, error);
  }
  return null;
};

/**
 * load a book of the bible into resources
 * @param bibleId
 * @param bookId
 * @param languageId
 * @param version
 * @param {string} owner
 * @return {Function}
 */
export const loadBibleBook = (bibleId, bookId, languageId, version = null, owner = DEFAULT_OWNER) => (dispatch) => {
  const bibleData = loadBookResource(bibleId, bookId, languageId, version, owner);

  if (bibleData) {
    dispatch(addNewBible(languageId, bibleId, bibleData, owner));
  }
};

/**
 * Load all found books for a given language Id.
 * @param languageId
 * @param {string} owner
 * @return {Function}
 */
export const loadBiblesByLanguageId = (languageId, owner = DEFAULT_OWNER) => (dispatch, getState) => {
  const bibleFolderPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles'); // ex. user/NAME/translationCore/resources/en/bibles/
  const bookId = getProjectBookId(getState());
  const bibles = getBibles(getState());
  // check if the bible for language and owner is already included in the bibles object.
  const match = `${languageId}${OWNER_SEPARATOR}${owner}`;
  const isIncluded = Object.keys(bibles).includes(match);

  if (fs.existsSync(bibleFolderPath) && bookId) {
    const bibleIds = fs.readdirSync(bibleFolderPath).filter(file => file !== '.DS_Store');

    bibleIds.forEach(bibleId => {
      if (!isIncluded || !bibles[match][bibleId]) { //TRICKY: just because we have a bible in the language loaded does not mean we have all the bibles loaded
        dispatch(loadBibleBook(bibleId, bookId, languageId, owner));
      }
    });
  }
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
  const { bibleId: origLangBibleId } = BibleHelpers.getOrigLangforBook(bookId);
  const newCurrentPaneSettings = SettingsHelpers.getCurrentPaneSetting(getState());
  let changed = false;

  if (Array.isArray(newCurrentPaneSettings)) {
    const otherTestamentBible = BibleHelpers.isNewTestament(bookId) ? Bible.OT_ORIG_LANG_BIBLE : Bible.NT_ORIG_LANG_BIBLE;

    for (let setting of newCurrentPaneSettings) {
      let languageId = setting.languageId;

      if (languageId === ORIGINAL_LANGUAGE) {
        if (setting.bibleId !== origLangBibleId) { // if need to check if bibles are valid in case previous selected project was in the other testament
          // TRICKY: we only want to change the bibleId in the case that UGNT is in settings when we selected an OT book, or when UHB
          //          is in settings and we selected a NT book.  There may be other original language books loaded and we don't
          //          want to mess with them.
          if (setting.bibleId === otherTestamentBible) { // if the original language bible is from the opposite testament, we need to fix
            changed = true;
            setting.bibleId = origLangBibleId; // set original bible ID for current testament
          }
        }
      }
    }

    if (changed) {
      dispatch(SettingsActions.setToolSettings('ScripturePane', 'currentPaneSettings', newCurrentPaneSettings));
    }
  }
};

/**
 * Make sure required bible books for current tool are loaded into resources.
 * @param {object} contextId - context id.
 */
export const makeSureBiblesLoadedForTool = (contextId) => (dispatch, getState) => {
  console.log('makeSureBiblesLoadedForTool(): contextId', contextId);
  const state = getState();
  const toolName = getCurrentToolName(state);
  const { bibles } = state.resourcesReducer;
  const bookId = contextId && contextId.reference.bookId || getProjectBookId(state);

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
        const chapterNumber = path.basename(file, '.json');

        if (!isNaN(chapterNumber)) {
          // load chapter
          bookData[chapterNumber] = fs.readJsonSync(
            path.join(bookPath, file));
        }
      }

      const projectManifestPath = path.join(projectPath, 'manifest.json');

      if (fs.existsSync(projectManifestPath)) { // read user selections from manifest if present
        const manifest = fs.readJsonSync(projectManifestPath);

        if (manifest) {
          const translate = getTranslate(getState());

          // copy data for tools
          bookData.manifest = {
            language_id: manifest.target_language.id,
            language_name: manifest.target_language.name || manifest.target_language.id,
            direction: manifest.target_language.direction,
            resource_id: TARGET_LANGUAGE,
            description: translate('tools.target_language'),
          };
        } else {
          bookData.manifest = {};
        }
      }

      dispatch(addNewBible(TARGET_LANGUAGE, TARGET_BIBLE, bookData, null));
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
export const loadBookTranslations = (bookId, toolName = null) => (dispatch, getState) => {
  if (toolName === null) {
    toolName = getCurrentToolName(getState());
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
export const loadSourceBookTranslations = (bookId, toolName) => (dispatch, getState) => {
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
 * @param {Boolean} async - if true then do an async file read which does not block UI updates
 */
export const loadResourceArticle = (resourceType, articleId, languageId, category = '', async = false) => ((dispatch) => {
  if (async) {
    ResourcesHelpers.loadArticleDataAsync(resourceType, articleId, languageId, category).then((articleData) => {
      // populate reducer with markdown data
      dispatch({
        type: consts.ADD_TRANSLATIONHELPS_ARTICLE,
        resourceType,
        articleId,
        languageId,
        articleData,
      });
    });
  } else {
    const articleData = ResourcesHelpers.loadArticleData(resourceType, articleId, languageId, category);

    // populate reducer with markdown data
    dispatch({
      type: consts.ADD_TRANSLATIONHELPS_ARTICLE,
      resourceType,
      articleId,
      languageId,
      articleData,
    });
  }
});

/**
 * Get the lexicon entry and add it to the reducer
 * @param {string} lexiconId - the id of the lexicon to populate
 * @param {number} entryId - the number of the entry
 */
export const loadLexiconEntry = (lexiconId, entryId) => ((dispatch) => {
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
      entryData,
    });
  } catch (error) {
    console.error(error);
  }
});

/**
 * Updates the verse text in the target language bible resource.
 * This will not write any changes to the disk.
 * @param {number} chapter
 * @param {number} verse
 * @param {string} text
 */
export const updateTargetVerse = (chapter, verse, editedText) => ({
  type: consts.UPDATE_TARGET_VERSE,
  editedText,
  chapter,
  verse,
});
