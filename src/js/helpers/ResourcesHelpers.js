/* eslint-disable no-undef */
/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import AdmZip from 'adm-zip';
import isEqual from 'deep-equal';
import _ from 'lodash';
import {
  apiHelpers,
  getOtherTnsOLVersions,
  resourcesHelpers,
} from 'tc-source-content-updater';
// actions
import { addObjectPropertyToManifest, loadCurrentCheckCategories } from '../actions/ProjectDetailsActions';
import {
  getToolGatewayLanguage,
  getBibles,
  getProjectSaveLocation,
  getProjectBookId,
} from '../selectors';
import * as Bible from '../common/BooksOfTheBible';
import {
  APP_VERSION,
  DEFAULT_GATEWAY_LANGUAGE,
  DEFAULT_OWNER,
  ORIGINAL_LANGUAGE,
  SOURCE_CONTENT_UPDATER_MANIFEST,
  STATIC_RESOURCES_PATH,
  TARGET_LANGUAGE,
  TARGET_BIBLE,
  TC_VERSION,
  TRANSLATION_WORDS,
  TRANSLATION_NOTES,
  TRANSLATION_HELPS,
  TRANSLATION_ACADEMY,
  USER_RESOURCES_PATH,
  toolCardCategories,
} from '../common/constants';
// helpers
import * as BibleHelpers from './bibleHelpers';
import { getValidGatewayBiblesForTool } from './gatewayLanguageHelpers';
import * as SettingsHelpers from './SettingsHelpers';
import ProjectAPI from './ProjectAPI';
import ResourceAPI from './ResourceAPI';
import {
  generateChapterGroupData,
  generateChapterGroupIndex,
} from './groupDataHelpers';
import { generateTimestamp } from './TimestampGenerator';
import { getContextIdPathFromIndex } from './contextIdHelpers';
// constants

export const QUOTE_MARK = '\u2019';

/**
 * append owner to key
 * @param key
 * @param owner
 * @return {string}
 */
export function addOwner(key, owner) {
  const result = `${key}${apiHelpers.OWNER_SEPARATOR}${owner}`;
  return result;
}

/**
 * array of checks for groupId
 * @param {Array} resourceData
 * @param {object} matchRef
 * @return {number}
 */
function getReferenceCount(resourceData, matchRef) {
  let count = 0;

  for (let resource of resourceData) {
    if (isEqual(resource.contextId.reference, matchRef)) {
      count++;
    }
  }
  return count;
}

/**
 * compares quotes, with fallback to old handling of quote marks
 * @param projectCheckQuote
 * @param resourceQuote
 * @return {*|boolean}
 */
export function areQuotesEqual(projectCheckQuote, resourceQuote) {
  let same = isEqual(projectCheckQuote, resourceQuote);

  if (!same) { // if not exactly the same, check for old quote handling in project quote
    // a quick sanity check, the old quote would be longer if the quote mark is split out
    if (Array.isArray(projectCheckQuote) && Array.isArray(resourceQuote) && projectCheckQuote.length > resourceQuote.length) {
      let index = projectCheckQuote.findIndex(item => (item.word === QUOTE_MARK)); // look for quote mark
      const quoteMarkFound = index > 1;

      if (quoteMarkFound) { // if quote mark split out, migrate to new format
        const newQuote = _.cloneDeep(projectCheckQuote);
        let done = false;

        while (!done) {
          if (index > 1) {
            // move quote mark to previous word
            const previousItem = newQuote[index - 1];
            previousItem.word += QUOTE_MARK;
            newQuote.splice(index, 1);
            index = newQuote.findIndex(item => (item.word === QUOTE_MARK));
          } else {
            done = true;
          }
        }

        same = isEqual(newQuote, resourceQuote);
      }
    }
  }
  return same;
}

/**
 * update old resource data
 * @param {String} resourcesPath - base path to find resource index
 * @param {String} bookId
 * @param {Object} data - resource data to update
 * @return {boolean} true if resource data was modified
 */
export function updateCheckingResourceData(resourcesPath, bookId, data) {
  let dataModified = false;
  const resourcePath = path.join(resourcesPath, bookId, data.contextId.groupId + '.json');

  if (fs.existsSync(resourcePath)) {
    const resourceData = fs.readJsonSync(resourcePath);

    if (resourceData) {
      let matchFound = false;

      for (let resource of resourceData) {
        if (data.contextId.groupId === resource.contextId.groupId &&
              isEqual(data.contextId.reference, resource.contextId.reference) &&
              data.contextId.occurrence === resource.contextId.occurrence) {
          if (!areQuotesEqual(data.contextId.quote, resource.contextId.quote)) { // quotes are  not the same
            if (data.contextId.checkId) {
              if (data.contextId.checkId === resource.contextId.checkId) {
                matchFound = true; // found match
              }
            } else { // there is not a check ID in this check, so we try empirical methods
              // if only one check for this verse, then we update presuming that this is just an original language change.
              // If more than one check in this groupID for this verse, we skip since it would be too easy to change the quote in the wrong check
              const count = getReferenceCount(resourceData, resource.contextId.reference);
              matchFound = (count === 1);
            }

            if (matchFound) {
              data.contextId.quote = resource.contextId.quote; // update quote
              data.contextId.quoteString = resource.contextId.quoteString; // update quoteString

              if (!data.contextId.checkId && resource.contextId.checkId) {
                data.contextId.checkId = resource.contextId.checkId; // add check ID
              }
              dataModified = true;
            }
          } else { // quotes match
            if (data.contextId.checkId) {
              if (data.contextId.checkId === resource.contextId.checkId) {
                matchFound = true;
              }
            } else { // no check id in current check, and quotes are similar
              matchFound = true;

              // see if there is a checkId to be added
              if (resource.contextId.checkId) {
                data.contextId.checkId = resource.contextId.checkId; // save checkId
                dataModified = true;
              }
            }

            if (matchFound && !isEqual(data.contextId.quote, resource.contextId.quote)) {
              // if quotes not exactly the same, update
              data.contextId.quote = resource.contextId.quote;
              data.contextId.quoteString = resource.contextId.quoteString;
              dataModified = true;
            }
          }

          if (matchFound) {
            break;
          }
        }
      }

      if (!matchFound) {
        console.warn('updateCheckingResourceData() - resource not found for migration: ' + JSON.stringify(data));
      }
    }
  }
  return dataModified;
}

/**
 * update the resources for this file
 * @param {String} filePath - path of file to update
 * @param {String} toolName
 * @param {String} resourcesPath - path to find resources
 * @param {String} bookId
 * @param {Boolean} isContext - if true, then data is expected to be a contextId, otherwise it contains a contextId
 */
function updateResourcesForFile(filePath, toolName, resourcesPath, bookId, isContext = false) {
  try {
    let data = fs.readJsonSync(filePath);

    if (isContext) {
      data = { contextId: data };
    }

    if (data.contextId) {
      if (data.contextId.groupId && (data.contextId.tool === toolName)) {
        let dataModified = updateCheckingResourceData(resourcesPath, bookId, data);

        if (dataModified) {
          if (isContext) {
            data = data.contextId;
          }
          fs.outputJsonSync(filePath, data, { spaces: 2 });
        }
      }
    }
  } catch (e) {
    console.error('updateResourcesForFile() - migration error for: ' + filePath, e);
  }
}

/**
 * iterate through checking data to make sure it is up to date
 * @param {String} projectDir - path to project
 * @param {String} toolName
 */
export function migrateOldCheckingResourceData(projectDir, toolName) {
  const checksPath = path.join(projectDir, '.apps/translationCore/checkData');

  if (fs.existsSync(checksPath)) {
    const resourcesPath = path.join(projectDir, '.apps/translationCore/index', toolName);
    const checks = getFoldersInResourceFolder(checksPath);

    if (checks) {
      for (let check of checks) {
        console.log(`migrateOldCheckingResourceData() - migrating ${check} to new format`);
        const checkPath = path.join(checksPath, check);
        const books = getFoldersInResourceFolder(checkPath);

        for (let book of books) {
          const bookPath = path.join(checkPath, book);
          const chapters = getFoldersInResourceFolder(bookPath);

          for (let chapter of chapters) {
            const chapterPath = path.join(bookPath, chapter);
            const verses = getFoldersInResourceFolder(chapterPath);

            for (let verse of verses) {
              const versePath = path.join(chapterPath, verse);
              const files = getFilesInResourcePath(versePath, '.json');

              for (let file of files) {
                const filePath = path.join(versePath, file);
                updateResourcesForFile(filePath, toolName, resourcesPath, book);
              }
            }
          }

          const contextIdPath = path.join(resourcesPath, book, 'currentContextId/contextId.json'); // migrate current contextId

          if (fs.existsSync(contextIdPath)) {
            updateResourcesForFile(contextIdPath, toolName, resourcesPath, book, true);
          }
        }
      }
    }
    console.log('migrateOldCheckingResourceData() - migration done');
  }
}

/**
 * Copies all of a tool's group data from the global resources into a project.
 * This is boiler plate to keep a separation of concerns between the global resources and projects.
 * NOTE: this is designed to work on any gateway language, however it should only be with original languages for tW.
 * @param {string} gatewayLanguage - the gateway language code
 * @param {string} toolName - the name of the tool for which helps will be copied
 * @param {string} projectDir - path to the project directory
 * @param {function} dispatch - dispatch function
 * @param {boolean} glChange - defaults to false, set to true if the GL has changed
 * @param {string} glOwner
 */
export function copyGroupDataToProject(gatewayLanguage, toolName, projectDir, dispatch, glChange = false, glOwner = DEFAULT_OWNER) {
  const project = new ProjectAPI(projectDir);
  const resources = ResourceAPI.default();
  const helpDir = resources.getLatestTranslationHelp(gatewayLanguage, toolName, glOwner);

  if (helpDir) {
    project.resetCategoryGroupIds(toolName);
    const groupDataUpdated = glChange || project.hasNewGroupsData(toolName);
    const isTN = toolName === TRANSLATION_NOTES;

    if (groupDataUpdated) {
      project.resetLoadedCategories(toolName);

      if (isTN) {
        const tHelpsManifest = fs.readJsonSync(path.join(helpDir, 'manifest.json'));
        const { relation } = tHelpsManifest.dublin_core || {};
        dispatch(addObjectPropertyToManifest('tsv_relation', relation));
      }
    }

    const categories = getAvailableCategories(gatewayLanguage, toolName, projectDir, {}, glOwner);
    // In some older projects the category was saved in the .categories file instead of the subcategories.
    project.setCurrentCategories(toolName, categories);

    const groupsDataLoaded = project.getLoadedCategories(toolName);
    const categoryKeys = Object.keys(categories);

    for (let i = 0, l = categoryKeys.length; i < l; i++) {
      const category = categoryKeys[i];
      const resourceCategoryDir = path.join(helpDir, category, 'groups', project.getBookId());
      const altResourceCategoryDir = path.join(helpDir, 'groups', project.getBookId());
      let groupsDir = resourceCategoryDir;

      if (!fs.pathExistsSync(resourceCategoryDir)) {
        groupsDir = altResourceCategoryDir;
      }

      for (let j = 0, l2 = categories[category].length; j < l2; j++) {
        const subCategory = categories[category][j];
        const dataPath = path.join(groupsDir, subCategory + '.json');
        project.importCategoryGroupData(toolName, dataPath, groupsDataLoaded);
      }
      // TRICKY: gives the tool an index of which groups belong to which category
      project.setCategoryGroupIds(toolName, category, categories[category]);

      // loading complete
      for (let k = 0, l3 = categories[category].length; k < l3; k++) {
        const subCategory = categories[category][k];
        project.setCategoryLoaded(toolName, subCategory);
      }
    }
    project.removeStaleCategoriesFromCurrent(toolName);

    if (isTN) {
      const categoriesPath = project.getCategoriesPath(toolName);

      if (fs.existsSync(categoriesPath)) {
        // update languageId in categories
        const categories = fs.readJsonSync(categoriesPath);

        if (categories) {
          categories.languageId = gatewayLanguage;
          fs.outputJsonSync(categoriesPath, categories);
        }
      }
    }

    if (groupDataUpdated) {
      migrateOldCheckingResourceData(projectDir, toolName);
    }
  } else {
    // generate chapter-based group data
    const groupsDataDirectory = project.getCategoriesDir(toolName);
    const bookDataDir = project.getBookDataDir();
    const data = generateChapterGroupData(project.getBookId(), toolName, bookDataDir);

    data.forEach(groupData => {
      const groupId = groupData[0].contextId.groupId;
      const fileName = groupId + '.json';
      ensureFileContentsJson(groupsDataDirectory, fileName, groupData);
    });
  }
}

/**
 * make sure file contents have the latest data
 * @param {String} folder
 * @param {String} filename
 * @param {object} data
 */
export function ensureFileContentsJson(folder, filename, data) {
  const filePath = path.join(folder, filename);

  try {
    fs.ensureDirSync(folder);
    let valid = fs.existsSync(filePath);

    if (valid) {
      try {
        const fileData = fs.readJsonSync(filePath);
        valid = isEqual(data, fileData);
      } catch (e) {
        console.error(`ensureFileContentsJson() - error reading ${filePath}`, e);
        valid = false;
      }
    }

    if (!valid) {
      fs.outputJsonSync(filePath, data, { spaces: 2 });
    }
  } catch (e) {
    console.error(`ensureFileContentsJson() - error updating ${filePath}`, e);
  }
}

/**
 * get available categories
 * @param {String} gatewayLanguage
 * @param {String} toolName
 * @param {String} projectDir
 * @param {object} options = { withCategoryName: true } will return an
 * array of objects instead, which include the category id & name.
 * @param {string} owner
 */
export function getAvailableCategories(gatewayLanguage = 'en', toolName, projectDir, options = {}, owner = DEFAULT_OWNER) {
  const categoriesObj = {};
  const project = new ProjectAPI(projectDir);
  const resources = ResourceAPI.default();

  if (toolName === TRANSLATION_WORDS){
    if (owner === apiHelpers.DOOR43_CATALOG) { // for tW we use OrigLang if owner is D43 Catalog
      const manifest = project.getManifest();
      const bookId = manifest && manifest.project && manifest.project.id;
      const { languageId } = BibleHelpers.getOrigLangforBook(bookId);
      gatewayLanguage = languageId;
    }
  }

  const helpDir = resources.getLatestTranslationHelp(gatewayLanguage, toolName, owner);
  // list help categories

  if (helpDir) {
    const categories = fs.readdirSync(helpDir).filter(file => fs.lstatSync(path.join(helpDir, file)).isDirectory());

    if (categories.length === 0) {
      throw new Error(`Missing translationHelp categories for ${toolName}`);
    }

    for (let category of categories) {
      if (Object.keys(toolCardCategories).includes(category)) {
        const subCategories = [];
        // TRICKY: some helps do not have groups nested under categories
        const resourceCategoryDir = path.join(helpDir, category, 'groups', project.getBookId());
        const altResourceCategoryDir = path.join(helpDir, 'groups', project.getBookId());
        let groupsDir = resourceCategoryDir;

        if (!fs.pathExistsSync(resourceCategoryDir)) {
          groupsDir = altResourceCategoryDir;
        }

        let groupIndex;
        const groupIndexPath = path.join(helpDir, category, 'index.json');

        if (options.withCategoryName && fs.existsSync(groupIndexPath)) {
          groupIndex = fs.readJsonSync(groupIndexPath);
        }

        // copy not loaded category group data into project
        if (fs.pathExistsSync(groupsDir)) {
          const files = fs.readdirSync(groupsDir);

          for (const f of files) {
            if (path.extname(f).toLowerCase() === '.json') {
              const id = path.basename(f.toLowerCase(), '.json');
              let subCategory = id;

              // Use an object that includes id & name instead of just a string
              if (options.withCategoryName) {
                subCategory = { id };

                if (groupIndex) {
                  subCategory = groupIndex.find(group => group.id === id);
                }
              }

              subCategories.push(subCategory);
            }
          }
        }
        categoriesObj[category] = subCategories;
      }
    }
  }

  return categoriesObj;
}


/**
 * Configures the project have selected the default categories.
 * If category selections already exist this method will be a no-op.
 * @param {string} gatewayLanguage - the gateway language code
 * @param {string} toolName - the name of the tool for which selections will be made
 * @param {string} projectDir - path to the project directory
 */
export function setDefaultProjectCategories(gatewayLanguage, toolName, projectDir) {
  const project = new ProjectAPI(projectDir);
  const resources = ResourceAPI.default();
  const helpDir = resources.getLatestTranslationHelp(gatewayLanguage, toolName);
  let categories = [];

  if (helpDir && project.getSelectedCategories(toolName).length === 0) {
    let parentCategories = fs.readdirSync(helpDir).filter(file => fs.lstatSync(path.join(helpDir, file)).isDirectory());

    for (let i = 0, l = parentCategories.length; i < l; i++) {
      const categoryId = parentCategories[i];
      categories = categories.concat(project.getCategoryGroupIds(toolName, categoryId));
    }

    if (categories.length > 0) {
      project.setSelectedCategories(toolName, categories);
    }
  }
}

/**
 * make sure that the group index data and contextId are up to date on GL change.  Currently only tN depends on GL
 * @param {string} toolName
 * @param {string} selectedGL
 * @param {string} owner
 */
export function updateGroupIndexForGl(toolName, selectedGL, owner = 'unfoldingWord') {
  return ((dispatch, getState) => {
    console.log(`updateGroupIndexForGl(${toolName}, ${selectedGL})`);
    const state = getState();
    const projectDir = getProjectSaveLocation(state);

    try {
      const projectApi = new ProjectAPI(projectDir);
      const categoriesPath = projectApi.getCategoriesPath(toolName);

      if (fs.existsSync(categoriesPath)) {
        const categories = fs.readJsonSync(categoriesPath);

        if (categories && categories.languageId === selectedGL) {
          console.log('updateGroupIndexForGl() - language unchanged, skipping');
          return; // we don't need to do anything since language hasn't changed
        }
      }
      console.log('updateGroupIndexForGl() - calling copyGroupDataToProject() to get latest from tN helps');
      copyGroupDataToProject(selectedGL, toolName, projectDir, dispatch, true, owner); // copy group data for GL
      let groupId = null;
      let contextId = null;
      const bookId = getProjectBookId(state);

      if (bookId) {
        const loadPath = getContextIdPathFromIndex(projectDir, toolName, bookId);

        if (fs.existsSync(loadPath)) {
          contextId = fs.readJsonSync(loadPath);
          groupId = contextId && contextId.groupId;
        }
      }
      console.log('updateGroupIndexForGl() - updating saved contextId() for new GL');

      if (contextId && groupId) {
        // need to update occurrenceNote in current contextId from checks
        const groupData = projectApi.getGroupData(toolName, groupId);

        for (let check of groupData) {
          // find check that matches current contextId
          if (isEqual(contextId.reference, check.contextId.reference) &&
            contextId.occurrence === check.contextId.occurrence) {
            // if we found match, then update occurrenceNote in current contextId for tool
            contextId.occurrenceNote = check.contextId.occurrenceNote;
            const loadPath = getContextIdPathFromIndex(projectDir, toolName, bookId);
            fs.outputJsonSync(loadPath, contextId);
            break;
          }
        }
      }
      console.log('updateGroupIndexForGl() - calling loadCurrentCheckCategories()');
      dispatch(loadCurrentCheckCategories(toolName, projectDir, selectedGL));
    } catch (e) {
      console.error(`updateGroupIndexForGl(${toolName} - error updating current context`, e);
    }
  });
}

/**
 * Loads all of a tool's group data from the project.
 * @param {string} toolName - the name of the tool who's helps will be loaded
 * @param {string} projectDir - the absolute path to the project
 * @returns {*}
 */
export function loadProjectGroupData(toolName, projectDir) {
  const project = new ProjectAPI(projectDir);
  return project.getGroupsData(toolName);
}

/**
 * Loads the groups index from the global resources.
 * This is used primarily for generating the groups menu.
 * This is boiler plate to keep a separation of concerns between the global resources and projects.
 * TODO: the groups index should be copied into the project as part of {@link copyGroupDataToProject} and loaded from the project instead of the global resources.
 * @param {string} gatewayLanguage - the gateway language code
 * @param {string} toolName - the name of the tool who's index will be loaded
 * @param {string} projectDir - path to the project directory
 * @param {function} translate - the locale function. TODO: refactor index loading so locale is not required
 * @return {*}
 */
export function loadProjectGroupIndex(
  gatewayLanguage, toolName, projectDir, translate) {
  const project = new ProjectAPI(projectDir);
  const resources = ResourceAPI.default();
  const helpDir = resources.getLatestTranslationHelp(gatewayLanguage, toolName);

  if (helpDir) {
    // load indices
    const indices = [];
    const categories = project.getSelectedCategories(toolName, true);

    for (const categoryName in categories) {
      const categoryIndex = path.join(helpDir, categoryName, 'index.json');

      if (fs.lstatSync(categoryIndex).isFile()) {
        try {
          const selectedSubcategories = categories[categoryName];
          // For categories with subcategories need to filter out not selected items.
          const categoryIndices = fs.readJsonSync(categoryIndex)
            .filter(item => selectedSubcategories.includes(item.id));
          indices.push.apply(indices, categoryIndices);
        } catch (e) {
          console.error(`Failed to read group index from ${categoryIndex}`, e);
        }
      } else {
        console.warn(`Unexpected tool category selection in ${projectDir}. "${categoryIndex}" could not be found.`);
      }
    }
    return indices;
  } else {
    // generate indices
    return generateChapterGroupIndex(translate);
  }

  // TODO: the export needs to have the groups index so we need to run this when selecting a tool _and_ when exporting.
}

/**
 * makes sure the source-content-updater-manifest.json has latest time and tCore version
 * @param dateStr - optional date string to use, if not given with use current
 */
export const updateSourceContentUpdaterManifest = (dateStr = null) => {
  const manifest = {
    modified: generateTimestamp(dateStr),
    [TC_VERSION]: APP_VERSION,
  };
  const destinationPath = path.join(USER_RESOURCES_PATH,
    SOURCE_CONTENT_UPDATER_MANIFEST);
  fs.ensureDirSync(USER_RESOURCES_PATH);
  fs.outputJsonSync(destinationPath, manifest, { spaces: 2 });
};

/**
 * copies the source-content-updater-manifest.json from tc to the users folder
 */
export const copySourceContentUpdaterManifest = () => {
  const sourceContentUpdaterManifestPath = path.join(STATIC_RESOURCES_PATH,
    SOURCE_CONTENT_UPDATER_MANIFEST);

  if (fs.existsSync(sourceContentUpdaterManifestPath)) {
    const bundledManifest = fs.readJSONSync(sourceContentUpdaterManifestPath);
    bundledManifest[TC_VERSION] = APP_VERSION; // add app version to resource
    const destinationPath = path.join(USER_RESOURCES_PATH,
      SOURCE_CONTENT_UPDATER_MANIFEST);
    fs.ensureDirSync(USER_RESOURCES_PATH);
    fs.outputJsonSync(destinationPath, bundledManifest, { spaces: 2 });
  }
};

/**
 * checks if bundled resources are newer than installed resources
 * @return {boolean} - true if bundled resources are newer
 */
export const areResourcesNewer = () => {
  const userSourceContentUpdaterManifestPath = path.join(USER_RESOURCES_PATH,
    SOURCE_CONTENT_UPDATER_MANIFEST);

  if (!fs.existsSync(userSourceContentUpdaterManifestPath)) {
    console.log(
      `%c areResourcesNewer() - no source content manifest: ${userSourceContentUpdaterManifestPath}`,
      'color: #00539C',
    );
    return true;
  }

  const sourceContentUpdaterManifestPath = path.join(STATIC_RESOURCES_PATH,
    SOURCE_CONTENT_UPDATER_MANIFEST);

  if (!fs.existsSync(sourceContentUpdaterManifestPath)) {
    console.error('sourceContentUpdaterManifest does not exist');
    return false;
  }

  const bundledManifest = fs.readJSONSync(sourceContentUpdaterManifestPath);
  const bundledModified = bundledManifest && bundledManifest.modified;
  const userManifest = fs.readJSONSync(userSourceContentUpdaterManifestPath);
  const userModified = userManifest && userManifest.modified;

  const tCoreVersion = userManifest && userManifest[TC_VERSION];

  if (tCoreVersion !== APP_VERSION) { // TRICKY: for safety we refresh on any difference of version dates in case resources not compatible with newer or older version of tCore
    console.log(
      `%c areResourcesNewer() - tCore version changed from ${tCoreVersion} to ${APP_VERSION}, updating all`,
      'color: #00539C',
    );
    return true;
  }

  const newer = bundledModified > userModified;

  console.log(
    `%c areResourcesNewer() - resource modified time from ${userModified} to ${bundledModified}` + (newer ? ', newer - updating all' : ''),
    'color: #00539C',
  );
  return newer;
};

/**
 * unzip versioned resources in resourceDestinationPath
 * @param {String} resourceDestinationPath
 * @param {Boolean} isBible - true if resource is bible
 */
export const extractZippedResourceContent = (resourceDestinationPath, isBible) => {
  const versions = ResourceAPI.listVersions(resourceDestinationPath);

  for (const version of versions) {
    const versionPath = path.join(resourceDestinationPath, version);
    const filename = isBible ? 'books.zip' : 'contents.zip';
    const contentZipPath = path.join(versionPath, filename);

    if (fs.existsSync(contentZipPath)) {
      console.log(`extractZippedResourceContent: unzipping ${contentZipPath}`);
      const zip = new AdmZip(contentZipPath);
      zip.extractAllTo(versionPath, /*overwrite*/true);

      if (fs.existsSync(contentZipPath)) {
        fs.removeSync(contentZipPath);
      }
    }
  }
};

/**
 * @description Helper function to get a bibles manifest file from the bible resources folder.
 * @param {string} bibleVersionPath - path to a bibles version folder.
 * @param {string} bibleID - bible name. ex. bhp, uhb, udt, ult.
 */
export function getBibleManifest(bibleVersionPath, bibleID) {
  let fileName = 'manifest.json';
  let bibleManifestPath = path.join(bibleVersionPath, fileName);
  let manifest;

  if (fs.existsSync(bibleManifestPath)) {
    manifest = fs.readJsonSync(bibleManifestPath);
  } else {
    console.error(
      `Could not find manifest for ${bibleID} at ${bibleManifestPath}`);
  }
  return manifest;
}

/**
 * @description Helper function to get a bibles index from the bible resources folder.
 * @param {string} languageId
 * @param {string} bibleId - bible name. ex. bhp, uhb, udt, ult.
 * @param {string} bibleVersion - optional release version, if null then get latest
 * @param {string} owner
 */
export function getBibleIndex(languageId, bibleId, bibleVersion, owner) {
  const STATIC_RESOURCES_BIBLES_PATH = path.join(STATIC_RESOURCES_PATH, languageId, 'bibles');
  const fileName = 'index.json';
  let bibleIndexPath;

  if (bibleVersion) {
    bibleIndexPath = path.join(STATIC_RESOURCES_BIBLES_PATH, bibleId,
      bibleVersion, fileName);
  } else {
    const versionPath = ResourceAPI.getLatestVersion(
      path.join(STATIC_RESOURCES_BIBLES_PATH, bibleId), owner);

    if (versionPath) {
      bibleIndexPath = path.join(versionPath, fileName);
    } else {
      console.error(`versionPath is undefined`);
    }
  }

  let index;

  if (fs.existsSync(bibleIndexPath)) {
    index = fs.readJsonSync(bibleIndexPath);
  } else {
    console.error('Could not find index for ' + bibleId + ' ' + bibleVersion);
  }
  return index;
}

/**
 * Returns an array of versions found in the path that start with [vV]\d
 * @param {String} resourcePath - base path to search for versions
 * @return {Array} - array of versions, e.g. ['v1', 'v10', 'v1.1']
 */
export function getVersionsInPath(resourcePath) {
  return resourcesHelpers.getVersionsInPath(resourcePath);
}

/**
 * Returns a sorted an array of versions so that numeric parts are properly ordered (e.g. v10a < v100)
 * @param {Array} versions - array of versions unsorted: ['v05.5.2', 'v5.5.1', 'V6.21.0', 'v4.22.0', 'v6.1.0', 'v6.1a.0', 'v5.1.0', 'V4.5.0']
 * @return {Array} - array of versions sorted:  ["V4.5.0", "v4.22.0", "v5.1.0", "v5.5.1", "v05.5.2", "v6.1.0", "v6.1a.0", "V6.21.0"]
 */
export function sortVersions(versions) {
  // Don't sort if null, empty or not an array
  if (!versions || !Array.isArray(versions)) {
    return versions;
  }

  // Only sort of all items are strings
  for (let i = 0, len = versions.length; i < len; ++i) {
    if (typeof versions[i] !== 'string') {
      return versions;
    }
  }
  versions.sort(
    (a, b) => String(a).localeCompare(b, undefined, { numeric: true }));
  return versions;
}

export function getLanguageIdsFromResourceFolder(bookId) {
  try {
    let languageIds = getFilesInResourcePath(USER_RESOURCES_PATH);

    // if its an old testament project remove greek from languageIds.
    if (BibleHelpers.isOldTestament(bookId)) {
      languageIds = languageIds.filter(languageId => languageId !== Bible.NT_ORIG_LANG);
    } else { // else if its a new testament project remove hebrew from languageIds.
      languageIds = languageIds.filter(languageId => languageId !== Bible.OT_ORIG_LANG);
    }
    languageIds = languageIds.filter(languageID => {
      let valid = (fs.lstatSync(path.join(USER_RESOURCES_PATH, languageID)).isDirectory());
      return valid;
    });
    return languageIds;
  } catch (error) {
    console.error(error);
  }
}

/**
 * add language ID to languageIds if not present
 * @param {Array} languageIds
 * @param {String} languageID
 */
export function addLanguage(languageIds, languageID) {
  if (!languageIds.includes(languageID)) { // make sure we have OL
    languageIds.push(languageID);
  }
}

/**
 * add resource to resources if not present
 * @param {Array} resources
 * @param {String} languageId
 * @param {String} bibleId
 */
export function addResource(resources, languageId, bibleId) {
  if (!languageId) {
    throw new Error('Error when adding resource. languageId is not valid.');
  }

  const pos = resources.findIndex(resource =>
    ((resource.languageId === languageId) && (resource.bibleId === bibleId)),
  );

  if (pos < 0) { // if we don't have resource
    resources.push({ bibleId, languageId });
  }
}

/**
 * populates resourceList with resources that can be used in scripture pane
 * @param {Array} resourceList - array to be populated with resources
 * @return {Function}
 * //TODO: This is not an action. Please clean up to take in the state as an argument.
 */
export function getAvailableScripturePaneSelections(resourceList) {
  return ((dispatch, getState) => {
    try {
      resourceList.splice(0, resourceList.length); // remove any pre-existing elements
      const state = getState();
      const { resourcesReducer: { bibles } } = state;
      const bookId = getProjectBookId(state);
      const languagesIds = getLanguageIdsFromResourceFolder(bookId);

      // add target Bible if in resource reducer
      if (bibles && bibles[TARGET_LANGUAGE] && bibles[TARGET_LANGUAGE][TARGET_BIBLE]) {
        const resource = {
          bookId,
          bibleId: TARGET_BIBLE,
          languageId: TARGET_LANGUAGE,
          manifest: bibles[TARGET_LANGUAGE][TARGET_BIBLE].manifest,
        };
        resourceList.push(resource);
      }

      // load source bibles
      languagesIds.forEach((languageId) => {
        const biblesPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles');

        if (fs.existsSync(biblesPath)) {
          const biblesFolders = fs.readdirSync(biblesPath)
            .filter(folder => folder !== '.DS_Store');

          biblesFolders.forEach(bibleId => {
            const bibleIdPath = path.join(biblesPath, bibleId);
            const bibleLatestVersion = ResourceAPI.getLatestVersion(bibleIdPath);

            if (bibleLatestVersion) {
              const pathToBibleManifestFile = path.join(bibleLatestVersion,
                'manifest.json');

              try {
                const manifestExists = fs.existsSync(pathToBibleManifestFile);
                const bookExists = fs.existsSync(
                  path.join(bibleLatestVersion, bookId, '1.json'));

                if (manifestExists && bookExists) {
                  let languageId_ = languageId;

                  if (BibleHelpers.isOriginalLanguage(languageId)) {
                    languageId_ = ORIGINAL_LANGUAGE;
                  }

                  const manifest = fs.readJsonSync(pathToBibleManifestFile);

                  if (Object.keys(manifest).length) {
                    const resource = {
                      bookId,
                      bibleId,
                      languageId: languageId_,
                      manifest,
                    };
                    resourceList.push(resource);
                  }
                }
              } catch (e) {
                console.warn('Invalid bible: ' + bibleLatestVersion, e);
              }
            }
          });
        } else {
          console.warn('Directory not found, ' + biblesPath);
        }
      });
    } catch (err) {
      console.warn(err);
    }
  });
}

/**
 * gets the resources used in the scripture pane configuration, adds selected GL and adds the OL.  We default to English
 *      for GL.
 * @param {Object} state
 * @param {String} bookId
 * @param {string} toolName - the name of the tool for which resources will be found.
 * @return {Array} array of resource in scripture panel
 */
export function getResourcesNeededByTool(state, bookId, toolName) {
  const resources = [];
  const { languageId: olLanguageID, bibleId: olBibleId } = BibleHelpers.getOrigLangforBook(bookId);
  const currentPaneSettings = _.cloneDeep(SettingsHelpers.getCurrentPaneSetting(state));

  // TODO: hardcoded fixed for 1.1.0, the En ULT is used by the expanded scripture pane & if
  // not found throws an error. Should be addressed later by 4858.
  addResource(resources, 'en', 'ult');

  if (Array.isArray(currentPaneSettings)) {
    for (let setting of currentPaneSettings) {
      let languageId = setting.languageId;

      switch (languageId) {
      case TARGET_LANGUAGE:
        break;

      case ORIGINAL_LANGUAGE:
        addResource(resources, olLanguageID, setting.bibleId);
        break; // skip invalid language codes

      default:
        addResource(resources, languageId, setting.bibleId);
        break;
      }
    }
  } else {
    console.warn('No Scripture Pane Configuration');
  }
  addResource(resources, olLanguageID, olBibleId); // make sure loaded even if not in pane settings
  const gatewayLangId = getToolGatewayLanguage(state, toolName);
  const biblesLoaded = getBibles(state);
  const validBibles = getValidGatewayBiblesForTool(
    toolName,
    gatewayLangId,
    bookId,
    biblesLoaded,
  );

  if (Array.isArray(validBibles)) {
    for (let bible of validBibles) {
      addResource(resources, gatewayLangId, bible);
    }
  }
  return resources;
}

export function getGLQuote(languageId, groupId, toolName) {
  try {
    const GLQuotePathWithoutVersion = path.join(USER_RESOURCES_PATH, languageId, TRANSLATION_HELPS, toolName);
    const versionDirectory = ResourceAPI.getLatestVersion(GLQuotePathWithoutVersion);
    const GLQuotePathIndex = path.join(versionDirectory, 'kt', 'index.json');
    const resourceIndexArray = fs.readJSONSync(GLQuotePathIndex);
    return resourceIndexArray.find(({ id }) => id === groupId).name;
  } catch (e) {
    return null;
  }
}

/**
 * get unfiltered list of resource language ids
 * @param {Boolean} user - if true look in user resources, else check static resources
 * @return {Array} - list of language IDs
 */
export function getAllLanguageIdsFromResourceFolder(user) {
  return getFoldersInResourceFolder(
    user ? USER_RESOURCES_PATH : STATIC_RESOURCES_PATH);
}

/**
 * get list of folders in resource path
 * @param {String} resourcePath - path
 * @return {Array} - list of folders
 */
export function getFoldersInResourceFolder(resourcePath) {
  try {
    const folders = fs.readdirSync(resourcePath).filter(folder =>
      fs.lstatSync(path.join(resourcePath, folder)).isDirectory()); // filter out anything not a folder
    return folders;
  } catch (error) {
    console.error(error);
  }
}

/**
 * get list of files in resource path
 * @param {String} resourcePath - path
 * @param {String|null} [ext=null] - optional extension to match
 * @return {Array}
 */
export function getFilesInResourcePath(resourcePath, ext=null) {
  if (fs.lstatSync(resourcePath).isDirectory()) {
    let files = fs.readdirSync(resourcePath).filter(file => {
      if (ext) {
        return path.extname(file) === ext;
      }
      return file !== '.DS_Store';
    }); // filter out .DS_Store
    return files;
  }
  return [];
}

/**
 * gets the sub folders of folder if it exists and filters out hidden and temp folder names
 * @param {String} folderPath
 * @return {*}
 */
function getFilteredSubFolders(folderPath) {
  const excludedItems = ['imports_processed', 'imports', '.DS_Store'];

  if (fs.existsSync(folderPath)) {
    return fs.readdirSync(folderPath)
      .filter(item => !excludedItems.includes(item))
      .filter(file => fs.lstatSync(path.join(folderPath, file)).isDirectory());
  }
  return [];
}

/**
 * copies missing subfolders from source to destination
 * @param {String} source
 * @param {String} destination
 * @param {String} languageId
 */
function copyMissingSubfolders(source, destination, languageId) {
  const sourceSubFolders = getFilteredSubFolders(source);
  const destinationSubFolders = getFilteredSubFolders(destination);

  sourceSubFolders.forEach((lexicon) => {
    let lexiconMissing = !destinationSubFolders.includes(lexicon);

    if (!lexiconMissing) { // if we have lexicon, make sure we have the latest version installed
      const latestVersion = ResourceAPI.getLatestVersion(path.join(source, lexicon), DEFAULT_OWNER);

      if (latestVersion) {
        const destinationVersionPath = path.join(destination, lexicon, path.basename(latestVersion));
        lexiconMissing = !fs.existsSync(destinationVersionPath);
      }
    }

    if (lexiconMissing) {
      const sourcePath = path.join(source, lexicon);
      const destinationPath = path.join(destination, lexicon);
      fs.copySync(sourcePath, destinationPath);
      console.log(
        `%c Copied ${languageId} lexicon from static lexicons to user resources path.`,
        'color: #0D355A',
      );
    }
  });
}

/**
 * check for lexicons packaged with tc executable.
 */
const checkForNewLexicons = (languageId) => {
  const tcResourcesLexiconPath = path.join(STATIC_RESOURCES_PATH, languageId, 'lexicons');

  if (fs.existsSync(tcResourcesLexiconPath)) {
    const userResourcesLexiconPath = path.join(USER_RESOURCES_PATH, languageId, 'lexicons');
    copyMissingSubfolders(tcResourcesLexiconPath, userResourcesLexiconPath, languageId);
  }
};

/**
 * this removes old translation helps folders since they may not be compatible with new tCore version.
 */
// TODO: Maybe in future we can add a compatibility check so we don't have to remove all, but for now this will be safe
export function removeOldThelps() {
  const removedResources = {};
  const tcResourcesLanguages = getFilteredSubFolders(USER_RESOURCES_PATH);

  for (let languageId of tcResourcesLanguages) {
    if (languageId) {
      const helpsFolder = path.join(USER_RESOURCES_PATH, languageId, TRANSLATION_HELPS);

      if (fs.existsSync(helpsFolder)) {
        console.log(
          `%c    removeOldThelps() - removing: ${helpsFolder}`,
          'color: #00aced',
        );

        const removedFolders = getFilteredSubFolders(helpsFolder);
        removedResources[languageId] = { removedFolders, helpsFolder };
        fs.removeSync(helpsFolder);
      }
    }
  }
  return removedResources;
}

/**
 * move bibles from old grc resource folder
 */
export function moveResourcesFromOldGrcFolder() {
  const oldGreekResourcesPath = path.join(USER_RESOURCES_PATH, 'grc');

  try {
    if (fs.existsSync(oldGreekResourcesPath)) {
      const oldGrcBiblesPath = path.join(USER_RESOURCES_PATH, 'grc/bibles');
      const newGrcBiblesPath = path.join(USER_RESOURCES_PATH, Bible.NT_ORIG_LANG, 'bibles');
      const oldOrigLangBibles = getFilteredSubFolders(oldGrcBiblesPath);

      for (const bible of oldOrigLangBibles) {
        const oldBiblePath = path.join(oldGrcBiblesPath, bible);

        if (bible !== Bible.NT_ORIG_LANG_BIBLE) {
          const latestVersionOld = ResourceAPI.getLatestVersion(oldBiblePath);

          if (latestVersionOld) {
            let newerResource = true;
            const newGrcBiblePath = path.join(newGrcBiblesPath, bible);
            const latestVersionNew = ResourceAPI.getLatestVersion(newGrcBiblePath);

            if (latestVersionNew) {
              newerResource = ResourceAPI.compareVersions(path.basename(latestVersionOld), path.basename(latestVersionNew)) > 0;
            }

            if (newerResource) {
              if (fs.existsSync(newGrcBiblePath)) {
                console.log('moveResourcesFromOldGrcFolder() - removing old bible at ' + newGrcBiblePath);
                fs.removeSync(newGrcBiblePath);
              }

              const newVersionPath = path.join(newGrcBiblePath, path.basename(latestVersionOld));
              console.log('moveResourcesFromOldGrcFolder() - moving over bible to ' + newVersionPath);
              fs.moveSync(path.join(latestVersionOld), newVersionPath);
            }
          }
        } else { // if original language bible, copy over any missing versions from old path to new
          const versions = getFilteredSubFolders(oldBiblePath);

          for (const version of versions) {
            const newVersionPath = path.join(newGrcBiblesPath, bible, version);

            if (!fs.existsSync(newVersionPath)) {
              console.log('moveResourcesFromOldGrcFolder() - copying over bible to ' + newVersionPath);
              fs.moveSync(path.join(oldBiblePath, version), newVersionPath);
            }
          }
        }
      }
      fs.removeSync(oldGreekResourcesPath);
    }
  } catch (e) {
    console.error('moveResourcesFromOldGrcFolder() - Error occurred migrating old bible resources from ' +
      oldGreekResourcesPath, e);
  }
}

/**
 * find out which Original Language Bible versions are needed by installed tNs.  Only keep the needed versions.
 *    The other versions are deleted.
 * @param languageId
 * @param resourceId
 * @param resourcePath
 * @return {boolean} - returns true if all old resources can be deleted
 */
export function preserveNeededOrigLangVersions(languageId, resourceId, resourcePath) {
  let deleteOldResources = true; // by default we do not keep old versions of resources

  if (BibleHelpers.isOriginalLanguageBible(languageId, resourceId)) {
    const requiredVersions = getOtherTnsOLVersions(USER_RESOURCES_PATH, resourceId).sort((a, b) =>
      -ResourceAPI.compareVersions(a, b), // do inverted sort
    );
    console.log('preserveNeededOrigLangVersions: requiredVersions', requiredVersions);

    // see if we need to keep old versions of original language
    if (requiredVersions && requiredVersions.length) {
      deleteOldResources = false;
      const highestRequired = requiredVersions[0];
      const versions = ResourceAPI.listVersions(resourcePath);
      console.log('preserveNeededOrigLangVersions: versions', versions);

      for (let version of versions) {
        if (!requiredVersions.includes(version)) {
          const newerResource = ResourceAPI.compareVersions(version, highestRequired) > 0;

          if (!newerResource) { // don't delete if newer version
            const oldPath = path.join(resourcePath, version);
            console.log('preserveNeededOrigLangVersions: removing old version', oldPath);
            fs.removeSync(oldPath);
          }
        }
      }
    }
  }
  return deleteOldResources;
}

/**
 * restores missing resources by language and bible and lexicon
 */
export function getMissingResources() {
  const tcResourcesLanguages = getFilteredSubFolders(STATIC_RESOURCES_PATH);

  for ( const languageId of tcResourcesLanguages) {
    console.log(`%c Checking for missing ${languageId} resources`, 'color: #00539C');
    const staticLanguageResource = path.join(STATIC_RESOURCES_PATH, languageId);
    const userLanguageResource = path.join(USER_RESOURCES_PATH, languageId);
    const resourceTypes = getFilteredSubFolders(staticLanguageResource);

    for ( const resourceType of resourceTypes) {// resourceType: bibles, lexicons or translationHelps
      const resourceTypePath = path.join(staticLanguageResource, resourceType);
      const resourceIds = getFilteredSubFolders(resourceTypePath);

      for ( const resourceId of resourceIds) {// resourceId: udb, ult, ugl, translationWords, translationNotes
        const userResourcePath = path.join(userLanguageResource, resourceType, resourceId);
        const staticResourcePath = path.join(staticLanguageResource, resourceType, resourceId);

        if (resourceType === 'lexicons') {
          // check for lexicons packaged with tc executable.
          checkForNewLexicons(languageId);
          extractZippedResourceContent(userResourcePath, resourceType === 'bibles');
        } else if (!fs.existsSync(userResourcePath)) {// if resource isn't found in user resources folder.
          copyAndExtractResource(staticResourcePath, userResourcePath, languageId, resourceId, resourceType);
        } else { // compare resources manifest modified time
          const staticResourceVersionPath = ResourceAPI.getLatestVersion(staticResourcePath);
          const version = path.basename(staticResourceVersionPath);
          const userResourceVersionPath = path.join(userResourcePath, version);
          const userResourceExists = fs.existsSync(userResourceVersionPath);
          let isOldResource = false;
          const filename = 'manifest.json';
          const staticResourceManifestPath = path.join(staticResourceVersionPath, filename);

          if (userResourceExists) {
            const userResourceManifestPath = path.join(userResourceVersionPath, filename);

            if (fs.existsSync(userResourceManifestPath) && fs.existsSync(staticResourceManifestPath)) {
              const { catalog_modified_time: userModifiedTime } = fs.readJsonSync(userResourceManifestPath) || {};
              const { catalog_modified_time: staticModifiedTime } = fs.readJsonSync(staticResourceManifestPath) || {};
              isOldResource = !userModifiedTime || (userModifiedTime < staticModifiedTime);

              if (isOldResource) {
                console.log('getMissingResources() - userModifiedTime: ' + userModifiedTime);
                console.log('getMissingResources() - staticModifiedTime: ' + staticModifiedTime);
              }
            } else if (!fs.existsSync(userResourceManifestPath)) {
              if (fs.existsSync(staticResourceManifestPath)) {
                console.log('getMissingResources() - missing user manifest: ' + userResourceManifestPath);
                console.log('getMissingResources() - but found static manifest: ' + staticResourceManifestPath);
                isOldResource = true;
              } else { // if no manifest.json, fall back to checking versions
                const userVersion = path.basename(userResourceVersionPath);
                const staticVersion = path.basename(staticResourceVersionPath);
                isOldResource = ResourceAPI.compareVersions(userVersion, staticVersion) < 0;

                if (isOldResource) {
                  console.log('getMissingResources() - userVersion: ' + userVersion);
                  console.log('getMissingResources() - staticVersion: ' + staticVersion);
                }
              }
            }
          } else { // resource folder was empty
            isOldResource = true;
          }

          const deleteOldResources = preserveNeededOrigLangVersions(languageId, resourceId, userResourcePath);

          if (isOldResource) {
            console.log(`getMissingResources() - checking ${languageId} ${resourceId} - old resource found`);

            if (deleteOldResources) {
              console.log('getMissingResources() - deleting old resources folder: ' + userResourcePath);
              fs.removeSync(userResourcePath);
            }
            console.log('getMissingResources() - unzipping static resources');
            copyAndExtractResource(staticResourcePath, userResourcePath, languageId, resourceId, resourceType);
          } else { // if folder empty, then copy over current resource
            const versions = ResourceAPI.listVersions(userResourcePath);
            const emptyResourceFolder = !versions.length;
            let installResource = emptyResourceFolder;

            if (!emptyResourceFolder) { // make sure bundled version is installed
              const staticResourceVersionPath = ResourceAPI.getLatestVersion(staticResourcePath);
              const bundledVersion = path.basename(staticResourceVersionPath);
              const destinationPath = path.join(userResourcePath, bundledVersion);
              installResource = !fs.existsSync(destinationPath);
            }

            if (installResource) {
              console.log('getMissingResources() - unzipping missing static resources');
              copyAndExtractResource(staticResourcePath, userResourcePath, languageId, resourceId, resourceType);
            }
          }
        }
      }
    }
  }
}

function copyAndExtractResource(staticResourcePath, userResourcePath, languageId, resourceId, resourceType) {
  fs.copySync(staticResourcePath, userResourcePath);
  console.log(
    `%c    Copied ${languageId}-${resourceId} from static ${resourceType} to user resources path.`,
    'color: #00aced',
  );
  // extract zipped contents
  extractZippedResourceContent(userResourcePath, resourceType === 'bibles');
}

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
 * Get the content of an article from disk
 * @param {String} resourceType
 * @param {String} articleId
 * @param {String} languageId
 * @param {String} category - Category of the article, e.g. kt, other, translate, etc. Can be blank.
 * @returns {String} - the content of the article
 */
export const loadArticleDataAsync = async (resourceType, articleId, languageId, category='') => {
  let articleData = '# Article Not Found: '+articleId+' #\n\nCould not find article for '+articleId;
  const articleFilePath = findArticleFilePath(resourceType, articleId, languageId, category);

  if (articleFilePath) {
    articleData = await fs.readFile(articleFilePath, 'utf8'); // get file from fs
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
    } else if (resourceType === TRANSLATION_NOTES || resourceType === TRANSLATION_ACADEMY) {
      categories = ['translate', 'checking', 'process', 'intro'];
      resourceType = TRANSLATION_ACADEMY;
    } else {
      categories = ['content'];
    }
  } else {
    categories.push(category);
  }

  const articleFile = articleId + '.md';

  for (let i = 0, len = languageDirs.length; i < len; ++i) {
    let languageDir = languageDirs[i];
    let typePath = path.join(USER_RESOURCES_PATH, languageDir, TRANSLATION_HELPS, resourceType);
    let versionPath = ResourceAPI.getLatestVersion(typePath) || typePath;

    for (let j = 0, jLen = categories.length; j < jLen; ++j) {
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
