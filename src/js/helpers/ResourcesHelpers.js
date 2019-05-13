/* eslint-disable no-console */
import fs from "fs-extra";
import path from "path-extra";
import ospath from "ospath";
import AdmZip from "adm-zip";
// helpers
import * as BibleHelpers from "./bibleHelpers";
import { getValidGatewayBiblesForTool } from "./gatewayLanguageHelpers";
import * as SettingsHelpers from "./SettingsHelpers";
import {
  getContext,
  getToolGatewayLanguage
} from "../selectors";
import _ from "lodash";
import ProjectAPI from "./ProjectAPI";
import ResourceAPI from "./ResourceAPI";
import {
  generateChapterGroupData,
  generateChapterGroupIndex
} from "./groupDataHelpers";
import {APP_VERSION} from "../containers/home/HomeContainer";
import {generateTimestamp} from "./TimestampGenerator";
// constants
export const USER_RESOURCES_PATH = path.join(ospath.home(), "translationCore",
  "resources");
export const STATIC_RESOURCES_PATH = path.join(__dirname,
  "../../../tcResources");
export const TC_VERSION = "tc_version";

/**
 * Copies all of a tool's group data from the global resources into a project.
 * This is boiler plate to keep a separation of concerns between the global resources and projects.
 * NOTE: this is designed to work on any gateway language, however it should only be with original languages.
 * @param {string} gatewayLanguage - the gateway language code
 * @param {string} toolName - the name of the tool for which helps will be copied
 * @param {string} projectDir - path to the project directory
 */
export function copyGroupDataToProject(gatewayLanguage, toolName, projectDir) {
  const project = new ProjectAPI(projectDir);
  const resources = ResourceAPI.default();
  if (toolName === "translationNotes")
    gatewayLanguage = "en";
  const helpDir = resources.getLatestTranslationHelp(gatewayLanguage, toolName);
  if (helpDir) {
    project.resetCategoryGroupIds(toolName);
    if (project.hasNewGroupsData(toolName)) {
      project.resetLoadedCategories(toolName);
    }
    const categories = getAvailableCategories(gatewayLanguage, toolName, projectDir);
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
        project.importCategoryGroupData(toolName, dataPath);
      }
      // TRICKY: gives the tool an index of which groups belong to which category
      project.setCategoryGroupIds(toolName, category, categories[category]);
      // loading complete
      if (toolName === "translationWords") {
        // for tW we don't select by subcategories
        project.setCategoryLoaded(toolName, category);
      } else {
        for (let k = 0, l3 = categories[category].length; k < l3; k++) {
          const subCategory = categories[category][k];
          project.setCategoryLoaded(toolName, subCategory);
        }
      }
    }
    project.removeStaleCategoriesFromCurrent(toolName, categories);
  } else {
    // generate chapter-based group data
    const groupsDataDirectory = project.getCategoriesDir(toolName);
    const data = generateChapterGroupData(project.getBookId(), toolName);
    data.forEach(groupData => {
      const groupId = groupData[0].contextId.groupId;
      const dataPath = path.join(groupsDataDirectory, groupId + ".json");
      if (!fs.existsSync(dataPath)) {
        fs.outputJsonSync(dataPath, groupData, {
          spaces: 2,
          replace: null
        });
      }
    });
  }
}

/**
 * get available categories
 * @param {String} gatewayLanguage
 * @param {String} toolName
 * @param {String} projectDir
 */
export function getAvailableCategories(gatewayLanguage = 'en', toolName, projectDir) {
  const categoriesObj = {};
  const project = new ProjectAPI(projectDir);
  const resources = ResourceAPI.default();
  if (toolName === 'translationWords'){
    const manifest = project.getManifest();
    const bookId = manifest && manifest.project && manifest.project.id;
    const {languageId} = BibleHelpers.getOLforBook(bookId);
    gatewayLanguage = languageId;
  }
  const helpDir = resources.getLatestTranslationHelp(gatewayLanguage, toolName);
  // list help categories

  if (helpDir) {
    const categories = fs.readdirSync(helpDir).filter(file => {
      return fs.lstatSync(path.join(helpDir, file)).isDirectory();
    });

    if (categories.length === 0) {
      throw new Error(`Missing translationHelp categories for ${toolName}`);
    }
    for (let category of categories) {
      const subCategories = [];
      // TRICKY: some helps do not have groups nested under categories
      const resourceCategoryDir = path.join(helpDir, category, 'groups', project.getBookId());
      const altResourceCategoryDir = path.join(helpDir, 'groups', project.getBookId());
      let groupsDir = resourceCategoryDir;
      if (!fs.pathExistsSync(resourceCategoryDir)) {
        groupsDir = altResourceCategoryDir;
      }
      // copy un-loaded category group data into project
      if (fs.pathExistsSync(groupsDir)) {
        const files = fs.readdirSync(groupsDir);
        for (const f of files) {
          if (path.extname(f).toLowerCase() === ".json") {
            subCategories.push(path.basename(f.toLowerCase(), ".json"));
          }
        }
      }
      categoriesObj[category] = subCategories;
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
    if (toolName === "translationWords") { // for tW we select by parent categories
      const parentCategories = getAvailableCategories(gatewayLanguage, toolName, projectDir);
      project.setSelectedCategories(toolName, Object.keys(parentCategories));
    } else {
      let parentCategories = fs.readdirSync(helpDir).filter(file => {
        return fs.lstatSync(path.join(helpDir, file)).isDirectory();
      });
      for (let i = 0, l = parentCategories.length; i < l; i++) {
        const subCategory = parentCategories[i];
        categories = categories.concat(project.getCategoryGroupIds(toolName, subCategory));
      }
      if (categories.length > 0) {
        project.setSelectedCategories(toolName, categories);
      }
    }
  }
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
      const categoryIndex = path.join(helpDir, categoryName, "index.json");
      if (fs.lstatSync(categoryIndex).isFile()) {
        try {
          indices.push.apply(indices, fs.readJsonSync(categoryIndex));
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
 * @description gets the resources from the static folder located in the tC codebase.
 */
export const getResourcesFromStaticPackage = (force) => {
  copySourceContentUpdaterManifest();
  getBibleFromStaticPackage(force);
  getTHelpsFromStaticPackage(force);
  getLexiconsFromStaticPackage(force);
};

/**
 * makes sure the source-content-updater-manifest.json has latest time and tCore version
 * @param dateStr - optional date string to use, if not given with use current
 */
export const updateSourceContentUpdaterManifest = (dateStr = null) => {
    const manifest = {
      modified: generateTimestamp(dateStr),
      [TC_VERSION]: APP_VERSION
    };
    const destinationPath = path.join(USER_RESOURCES_PATH,
      "source-content-updater-manifest.json");
    fs.ensureDirSync(USER_RESOURCES_PATH);
    fs.outputJsonSync(destinationPath, manifest);
};

/**
 * copies the source-content-updater-manifest.json from tc to the users folder
 */
export const copySourceContentUpdaterManifest = () => {
  const sourceContentUpdaterManifestPath = path.join(STATIC_RESOURCES_PATH,
    "source-content-updater-manifest.json");
  if (fs.existsSync(sourceContentUpdaterManifestPath)) {
    const bundledManifest = fs.readJSONSync(sourceContentUpdaterManifestPath);
    bundledManifest[TC_VERSION] = APP_VERSION; // add app version to resource
    const destinationPath = path.join(USER_RESOURCES_PATH,
      "source-content-updater-manifest.json");
    fs.ensureDirSync(USER_RESOURCES_PATH);
    fs.outputJsonSync(destinationPath, bundledManifest);
  }
};

/**
 * checks if bundled resources are newer than installed resources
 * @return {boolean} - true if bundled resources are newer
 */
export const areResourcesNewer = () => {
  const userSourceContentUpdaterManifestPath = path.join(USER_RESOURCES_PATH,
    "source-content-updater-manifest.json");
  if (!fs.existsSync(userSourceContentUpdaterManifestPath)) {
    return true;
  }

  const sourceContentUpdaterManifestPath = path.join(STATIC_RESOURCES_PATH,
    "source-content-updater-manifest.json");
  if (!fs.existsSync(sourceContentUpdaterManifestPath)) {
    console.error("sourceContentUpdaterManifest does not exist");
    return false;
  }
  const bundledManifest = fs.readJSONSync(sourceContentUpdaterManifestPath);
  const bundledModified = bundledManifest && bundledManifest.modified;
  const userManifest = fs.readJSONSync(userSourceContentUpdaterManifestPath);
  const userModified = userManifest && userManifest.modified;

  const tCoreVersion = userManifest && userManifest[TC_VERSION];
  if (tCoreVersion !== APP_VERSION) { // TRICKY: for safety we refresh on any difference of version dates in case resources not compatible with newer or older version of tCore
    return true;
  }

  const newer = bundledModified > userModified;
  return newer;
};

/**
 * Moves all bibles from the static folder to the user's translationCore folder.
 */
export function getBibleFromStaticPackage(force = false) {
  try {
    const languagesIds = getAllLanguageIdsFromResourceFolder(false);
    languagesIds.forEach((languageId) => {
      const STATIC_RESOURCES_BIBLES_PATH = path.join(STATIC_RESOURCES_PATH,
        languageId, "bibles");
      if (fs.existsSync(STATIC_RESOURCES_BIBLES_PATH)) {
        const BIBLE_RESOURCES_PATH = path.join(USER_RESOURCES_PATH, languageId,
          "bibles");
        const bibleIds = fs.readdirSync(STATIC_RESOURCES_BIBLES_PATH).
          filter(folder => folder !== ".DS_Store");
        bibleIds.forEach((bibleId) => {
          let bibleSourcePath = path.join(STATIC_RESOURCES_BIBLES_PATH,
            bibleId);
          let bibleDestinationPath = path.join(BIBLE_RESOURCES_PATH, bibleId);
          if (!fs.existsSync(bibleDestinationPath) || force) {
            fs.copySync(bibleSourcePath, bibleDestinationPath);
          }
          extractZippedBooks(bibleDestinationPath);
        });
      }
    });
  } catch (error) {
    console.error(error);
  }
}

export const extractZippedBooks = (bibleDestinationPath) => {
  const versionPath = ResourceAPI.getLatestVersion(bibleDestinationPath);
  const booksZipPath = path.join(versionPath, "books.zip");
  const zip = new AdmZip(booksZipPath);
  zip.extractAllTo(versionPath, /*overwrite*/true);
  fs.removeSync(booksZipPath);
};

/**
 * @description moves all translationHelps from the static folder to the resources folder in the translationCore folder.
 */
export function getTHelpsFromStaticPackage(force = false) {
  getAllLanguageIdsFromResourceFolder(false).forEach(languageId => {
    try {
      const staticTranslationHelpsPath = path.join(STATIC_RESOURCES_PATH,
        languageId, "translationHelps");
      if (fs.existsSync(staticTranslationHelpsPath)) {
        const userTranslationHelpsPath = path.join(USER_RESOURCES_PATH,
          languageId, "translationHelps");
        const tHelpsNames = fs.readdirSync(staticTranslationHelpsPath);
        tHelpsNames.forEach((tHelpName) => {
          let tHelpSourcePath = path.join(staticTranslationHelpsPath,
            tHelpName);
          let tHelpDestinationPath = path.join(userTranslationHelpsPath,
            tHelpName);
          if (!fs.existsSync(tHelpDestinationPath) || force) {
            fs.copySync(tHelpSourcePath, tHelpDestinationPath);
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  });
}

/**
 * @description moves all translationHelps from the static folder to the resources folder in the translationCore folder.
 */
export function getLexiconsFromStaticPackage(force = false) {
  try {
    const languageId = "en";
    const staticPath = path.join(STATIC_RESOURCES_PATH, languageId, "lexicons");
    const userPath = path.join(USER_RESOURCES_PATH, languageId, "lexicons");
    const folders = fs.readdirSync(staticPath);
    folders.forEach((folder) => {
      let sourcePath = path.join(staticPath, folder);
      let destinationPath = path.join(userPath, folder);
      if (!fs.existsSync(destinationPath) || force) {
        fs.copySync(sourcePath, destinationPath);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * @description Helper function to get a bibles manifest file from the bible resources folder.
 * @param {string} bibleVersionPath - path to a bibles version folder.
 * @param {string} bibleID - bible name. ex. bhp, uhb, udt, ult.
 */
export function getBibleManifest(bibleVersionPath, bibleID) {
  let fileName = "manifest.json";
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
 */
export function getBibleIndex(languageId, bibleId, bibleVersion) {
  const STATIC_RESOURCES_BIBLES_PATH = path.join(__dirname,
    "../../../tcResources", languageId, "bibles");
  const fileName = "index.json";
  let bibleIndexPath;
  if (bibleVersion) {
    bibleIndexPath = path.join(STATIC_RESOURCES_BIBLES_PATH, bibleId,
      bibleVersion, fileName);
  } else {
    const versionPath = ResourceAPI.getLatestVersion(
      path.join(STATIC_RESOURCES_BIBLES_PATH, bibleId));
    if (versionPath) {
      bibleIndexPath = path.join(versionPath, fileName);
    }
  }
  let index;

  if (fs.existsSync(bibleIndexPath)) {
    index = fs.readJsonSync(bibleIndexPath);
  } else {
    console.error("Could not find index for " + bibleId + " " + bibleVersion);
  }
  return index;
}

/**
 * Returns an array of versions found in the path that start with [vV]\d
 * @param {String} resourcePath - base path to search for versions
 * @return {Array} - array of versions, e.g. ['v1', 'v10', 'v1.1']
 */
export function getVersionsInPath(resourcePath) {
  if (!resourcePath || !fs.pathExistsSync(resourcePath)) {
    return null;
  }
  const isVersionDirectory = name => {
    const fullPath = path.join(resourcePath, name);
    return fs.lstatSync(fullPath).isDirectory() && name.match(/^v\d/i);
  };
  return fs.readdirSync(resourcePath).filter(isVersionDirectory);
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
    if (typeof versions[i] !== "string") {
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
      languageIds = languageIds.filter(languageId => languageId !== "grc");
    } else { // else if its a new testament project remove hebrew from languageIds.
      languageIds = languageIds.filter(languageId => languageId !== "hbo");
    }
    languageIds = languageIds.filter(languageID => {
      let valid = (fs.lstatSync(path.join(USER_RESOURCES_PATH, languageID)).
        isDirectory());
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
    throw new Error("Error when adding resource. languageId is not valid.");
  }
  const pos = resources.findIndex(resource =>
    ((resource.languageId === languageId) && (resource.bibleId === bibleId))
  );
  if (pos < 0) { // if we don't have resource
    resources.push({ bibleId, languageId });
  }
}

/**
 * populates resourceList with resources that can be used in scripture pane
 * @param {Array} resourceList - array to be populated with resources
 * @return {Function}
 */
export function getAvailableScripturePaneSelections(resourceList) {
  return ((dispatch, getState) => {
    try {
      resourceList.splice(0, resourceList.length); // remove any pre-existing elements
      const contextId = getContext(getState());
      const {resourcesReducer: {bibles}} = getState();
      const bookId = contextId && contextId.reference.bookId;
      const languagesIds = getLanguageIdsFromResourceFolder(bookId);

      // add target Bible if in resource reducer
      if (bibles && bibles["targetLanguage"] && bibles["targetLanguage"]["targetBible"]) {
        const resource = {
          bookId,
          bibleId: "targetBible",
          languageId: "targetLanguage",
          manifest: bibles["targetLanguage"]["targetBible"].manifest
        };
        resourceList.push(resource);
      }

      // load source bibles
      languagesIds.forEach((languageId) => {
        const biblesPath = path.join(USER_RESOURCES_PATH, languageId, "bibles");
        if (fs.existsSync(biblesPath)) {
          const biblesFolders = fs.readdirSync(biblesPath).
            filter(folder => folder !== ".DS_Store");
          biblesFolders.forEach(bibleId => {
            const bibleIdPath = path.join(biblesPath, bibleId);
            const bibleLatestVersion = ResourceAPI.getLatestVersion(bibleIdPath);
            if (bibleLatestVersion) {
              const pathToBibleManifestFile = path.join(bibleLatestVersion,
                "manifest.json");
              try {
                const manifestExists = fs.existsSync(pathToBibleManifestFile);
                const bookExists = fs.existsSync(
                  path.join(bibleLatestVersion, bookId, "1.json"));
                if (manifestExists && bookExists) {
                  let languageId_ = languageId;
                  if ((languageId.toLowerCase() === 'grc') || (languageId.toLowerCase() === 'hbo')) {
                    languageId_ = 'originalLanguage';
                  }
                  const manifest = fs.readJsonSync(pathToBibleManifestFile);
                  if (Object.keys(manifest).length) {
                    const resource = {
                      bookId,
                      bibleId,
                      languageId: languageId_,
                      manifest
                    };
                    resourceList.push(resource);
                  }
                }
              } catch (e) {
                console.warn("Invalid bible: " + bibleLatestVersion, e);
              }
            }
          });
        } else {
          console.log("Directory not found, " + biblesPath);
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
  const olLanguageID = BibleHelpers.isOldTestament(bookId) ? "hbo" : "grc";
  const olBibleId = BibleHelpers.isOldTestament(bookId) ? "uhb" : "ugnt";
  const currentPaneSettings = _.cloneDeep(
    SettingsHelpers.getCurrentPaneSetting(state));

  // TODO: hardcoded fixed for 1.1.0, the En ULT is used by the expanded scripture pane & if
  // not found throws an error. Should be addressed later by 4858.
  addResource(resources, 'en', 'ult');

  if (Array.isArray(currentPaneSettings)) {
    for (let setting of currentPaneSettings) {
      let languageId = setting.languageId;
      switch (languageId) {
        case "targetLanguage":
          break;

        case "originalLanguage":
          addResource(resources, olLanguageID, setting.bibleId);
          break; // skip invalid language codes

        default:
          addResource(resources, languageId, setting.bibleId);
          break;
      }
    }
  } else {
    console.log("No Scripture Pane Configuration");
  }
  addResource(resources, olLanguageID, olBibleId); // make sure loaded even if not in pane settings
  const gatewayLangId = getToolGatewayLanguage(state, toolName);
  const validBibles = getValidGatewayBiblesForTool(toolName, gatewayLangId,
    bookId);
  if (Array.isArray(validBibles)) {
    for (let bible of validBibles) {
      addResource(resources, gatewayLangId, bible);
    }
  }
  return resources;
}

export function getGLQuote(languageId, groupId, toolName) {
  try {
    const GLQuotePathWithoutVersion = path.join(STATIC_RESOURCES_PATH,
      languageId, "translationHelps", toolName);
    const versionDirectory = ResourceAPI.getLatestVersion(GLQuotePathWithoutVersion);
    const GLQuotePathIndex = path.join(versionDirectory, "kt", "index.json");
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
    let folders = fs.readdirSync(resourcePath).
      filter(
        folder => fs.lstatSync(path.join(resourcePath, folder)).isDirectory()); // filter out anything not a folder
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
      return file !== ".DS_Store";
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
  const excludedItems = ["imports_processed", "imports", ".DS_Store"];
  if (fs.existsSync(folderPath)) {
    return fs.readdirSync(folderPath).
      filter(item => !excludedItems.includes(item)).
      filter(file => fs.lstatSync(path.join(folderPath, file)).isDirectory());
  }
  return [];
}

/**
 * copies missing subfolders from source to destination
 * @param {String} source
 * @param {String} destination
 */
function copyMissingSubfolders(source, destination) {
  const sourceSubFolders = getFilteredSubFolders(source);
  const destinationSubFolders = getFilteredSubFolders(destination);
  sourceSubFolders.forEach((lexicon) => {
    let lexiconMissing = !destinationSubFolders.includes(lexicon);
    if (!lexiconMissing) { // if we have lexicon, make sure we have the latest version installed
      const latestVersion = ResourceAPI.getLatestVersion(path.join(source, lexicon));
      if (latestVersion) {
        const destinationVersionPath = path.join(destination, lexicon, path.basename(latestVersion));
        lexiconMissing = !fs.existsSync(destinationVersionPath);
      }
    }
    if (lexiconMissing) {
      const sourcePath = path.join(source, lexicon);
      const destinationPath = path.join(destination, lexicon);
      fs.copySync(sourcePath, destinationPath);
    }
  });
}

/**
 * restores missing resources by language and bible and lexicon
 */
export function getMissingResources() {
  const tcResourcesFiles = getFilteredSubFolders(STATIC_RESOURCES_PATH);
  const userResources = getFilteredSubFolders(USER_RESOURCES_PATH);
  tcResourcesFiles.forEach((languageId) => {
    // if a resource package with tC executable file is missing in the user resource directory
    if (!userResources.includes(languageId)) {
      const STATIC_RESOURCES = path.join(STATIC_RESOURCES_PATH, languageId);
      const destinationPath = path.join(USER_RESOURCES_PATH, languageId);
      fs.copySync(STATIC_RESOURCES, destinationPath);
      const BIBLE_RESOURCES_PATH = path.join(destinationPath, "bibles");
      const bibleIds = fs.readdirSync(BIBLE_RESOURCES_PATH).
        filter(folder => folder !== ".DS_Store");
      bibleIds.forEach(bibleId => {
        let bibleDestinationPath = path.join(BIBLE_RESOURCES_PATH, bibleId);
        extractZippedBooks(bibleDestinationPath);
      });
    }
    // TODO: this is temporary - eventually this will be packaged in catalog
    // check for lexicons packaged with tc executable
    const tcResourcesLexiconPath = path.join(STATIC_RESOURCES_PATH, languageId,
      "lexicons");
    if (fs.existsSync(tcResourcesLexiconPath)) {
      const userResourcesLexiconPath = path.join(USER_RESOURCES_PATH,
        languageId, "lexicons");
      copyMissingSubfolders(tcResourcesLexiconPath, userResourcesLexiconPath);
    }
  });
}
