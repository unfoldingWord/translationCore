/* eslint-disable no-return-await */
import path from 'path-extra';
import fs from 'fs-extra';
import isEqual from 'deep-equal';
// actions
import { loadCheckData } from '../actions/CheckDataLoadActions';
import {
  USER_RESOURCES_PATH,
  PROJECT_DOT_APPS_PATH,
  PROJECT_CHECKDATA_DIRECTORY,
  SOURCE_CONTENT_UPDATER_MANIFEST,
  TRANSLATION_WORDS,
} from '../common/constants';
import { generateTimestamp } from './TimestampGenerator';
import { getOrigLangforBook } from './bibleHelpers';

/**
 * Provides an interface with which tools can interact with a project.
 */
export default class ProjectAPI {
  /**
   * Creates a new project api
   * @param {string} projectDir - the absolute path to the project directory
   */
  constructor(projectDir) {
    this._projectPath = projectDir;
    this._dataPath = path.join(projectDir, PROJECT_DOT_APPS_PATH);
    this._manifest = null;

    this.writeDataFile = this.writeDataFile.bind(this);
    this.writeDataFileSync = this.writeDataFileSync.bind(this);
    this.readDataDir = this.readDataDir.bind(this);
    this.readDataDirSync = this.readDataDirSync.bind(this);
    this.readFile = this.readFile.bind(this);
    this.readDataFile = this.readDataFile.bind(this);
    this.readFileSync = this.readFileSync.bind(this);
    this.readDataFileSync = this.readDataFileSync.bind(this);
    this.dataPathExists = this.dataPathExists.bind(this);
    this.pathExistsSync = this.pathExistsSync.bind(this);
    this.dataPathExistsSync = this.dataPathExistsSync.bind(this);
    this.deleteDataFile = this.deleteDataFile.bind(this);
    this.deleteDataFileSync = this.deleteDataFileSync.bind(this);
    this.getCategoriesDir = this.getCategoriesDir.bind(this);
    this.importCategoryGroupData = this.importCategoryGroupData.bind(this);
    this.getManifest = this.getManifest.bind(this);
    this.getBookId = this.getBookId.bind(this);
    this.isCategoryLoaded = this.isCategoryLoaded.bind(this);
    this.setCategoryLoaded = this.setCategoryLoaded.bind(this);
    this.getGroupsData = this.getGroupsData.bind(this);
    this.getBookDataDir = this.getBookDataDir.bind(this);
    this.getGroupData = this.getGroupData.bind(this);
    this.setCategoryGroupIds = this.setCategoryGroupIds.bind(this);
    this.getAllCategoryMapping = this.getAllCategoryMapping.bind(this);
    this.getParentCategory = this.getParentCategory.bind(this);
    this.getLoadedCategories = this.getLoadedCategories.bind(this);
    this.getCategoriesPath = this.getCategoriesPath.bind(this);
  }

  /**
   * Returns the path to the project directory
   * @returns {string}
   */
  get path() {
    return this._projectPath;
  }

  /**
   * Returns the path to the project data directory
   * @returns {*}
   */
  get dataPath() {
    return this._dataPath;
  }

  /**
   * Returns the path to the categories index directory.
   * This is the same as the groups data directory.
   * @param {string} toolName - the name of the tool that the categories belong to
   * @returns {*}
   */
  getCategoriesDir(toolName) {
    // TODO: the book id is redundant to have in the project directory.
    const bookId = this.getBookId();
    return path.join(this._dataPath, 'index', toolName, bookId);
  }

  /**
   * Returns the path to the book data directory.
   * @return {string}
   */
  getBookDataDir() {
    // TODO: the book id is redundant to have in the project directory.
    const bookId = this.getBookId();
    return path.join(this._projectPath, bookId);
  }

  /**
   * Returns a dictionary of all the group data loaded for a given tool.
   * This will silently fail if the groups data does not exist.
   * @param {string} toolName - the name of the tool who's group data will be returned
   * @returns {*}
   */
  getGroupsData(toolName) {
    const data = {};
    const dir = this.getCategoriesDir(toolName);

    if (fs.pathExistsSync(dir) && fs.lstatSync(dir).isDirectory()) {
      const files = fs.readdirSync(dir)
        .filter(item => path.extname(item) === '.json');

      for (let i = 0, len = files.length; i < len; i++) {
        const dataPath = path.join(dir, files[i]);
        const groupName = path.basename(dataPath, '.json');

        try {
          let groupData = fs.readJsonSync(dataPath);

          // check & fix corrupted selections value for each group data item.
          groupData = groupData.map(groupDataItem => {
            if (groupDataItem.selections === true) {// if selections is true then find selections array.
              const {
                bookId, chapter, verse,
              } = groupDataItem.contextId.reference;
              const loadPath = path.join(
                this._projectPath,
                PROJECT_CHECKDATA_DIRECTORY,
                'selections',
                bookId,
                chapter.toString(),
                verse.toString(),
              );

              const checkData = loadCheckData(loadPath, groupDataItem.contextId);
              groupDataItem.selections = (checkData && checkData.selections) || false;
              return groupDataItem;
            }
            return groupDataItem;
          });

          data[groupName] = groupData;
        } catch (e) {
          console.error(`Failed to load group data from ${dataPath}`);
          console.error(e);
        }
      }
    }

    return data;
  }

  /**
   * Returns a single group data item
   * @throws an I/O error if there is a problem reading the file.
   * @param {string} toolName - the tool name. This is synonymous with translationHelp name
   * @param {string} groupId - the group id
   * @returns {object[]} - the group data object
   */
  getGroupData(toolName, groupId) {
    const dataPath = path.join(this.getCategoriesDir(toolName), `${groupId}.json`);
    return fs.readJsonSync(dataPath);
  }

  /**
   * returns true if the contextId's are for the same check instance
   * @param {Object} existingContextId
   * @param {Object} newContextId
   * @return {boolean}
   */
  isMatchingCheckInstance(existingContextId, newContextId) {
    return (isEqual(existingContextId.reference, newContextId.reference) &&
      (existingContextId.occurrence === newContextId.occurrence) &&
      (existingContextId.checkId === newContextId.checkId) &&
      (
        (existingContextId.quoteString && newContextId.quoteString ? (existingContextId.quoteString === newContextId.quoteString) : // compare quoteString if present
          isEqual(existingContextId.quote, newContextId.quote)) // else compare quote array
      )
    );
  }

  /**
   * copies contextId from source file to destination file which preserves exiting data (like selections, comments...)
   * @param {string} srceFile
   * @param {string} destFile
   * @return {boolean} returns true if file copied
   */
  updateCategoryGroupData(srceFile, destFile) {
    let copied = false;

    try {
      const newData = fs.readJsonSync(srceFile);
      const currentData = fs.readJsonSync(destFile) || [];
      const currentDataLen = currentData.length;

      for (let i = 0, l = newData.length; i < l; i++) {
        const newObject = newData[i];
        let index = -1;

        // find matching entry in old data
        if ((i >= currentDataLen) || !this.isMatchingCheckInstance(currentData[i].contextId, newObject.contextId)) {
          for (let j = 0; j < currentDataLen; j++) { // since lists are not identical, do search for match
            if (this.isMatchingCheckInstance(currentData[j].contextId, newObject.contextId)) {
              index = j;
              break;
            }
          }
        } else {
          index = i;
        }

        if (index >= 0) { // found match, preserve old selections, etc.
          const oldData = currentData[index];
          oldData.contextId = newObject.contextId; // use latest contextId
          newData[i] = oldData;
        }
      }
      fs.outputJsonSync(destFile, newData); // save new check data
      copied = true;
    } catch (e) {
      console.error('updateCategoryGroupData() - could not preserve data from: ' + destFile, e);
      copied = false;
    }
    return copied;
  }

  /**
   * Imports a group data file into the project.
   * Group data that already exists will not be overwritten.
   * @param {string} toolName - the name of the tool that the categories belong to
   * @param {string} dataPath - the path to the group data file
   * @param {Array} groupsDataLoaded - groups that are already loaded
   * @returns {boolean} true if the group data was imported. false if already imported.
   */
  importCategoryGroupData(toolName, dataPath, groupsDataLoaded) {
    const destDir = this.getCategoriesDir(toolName);
    const groupName = path.basename(dataPath);
    const destFile = path.join(destDir, groupName);
    const subCategory = path.parse(dataPath).name;

    if (!groupsDataLoaded.includes(subCategory)) {
      let copied = false;

      if (fs.existsSync(destFile)) {
        copied = this.updateCategoryGroupData(dataPath, destFile);
      }

      if (!copied) {
        fs.copySync(dataPath, destFile);
      }
      return true;
    }
    return false;
  }

  /**
   * Loads the project manifest from the disk.
   * Subsequent calls are cached.
   * @throws an error if the manifest does not exist.
   * @returns {JSON} the manifest json object
   */
  getManifest() {
    if (this._manifest === null) {
      const data = this.readFileSync('manifest.json');
      this._manifest = JSON.parse(data);
    }
    return this._manifest;
  }

  /**
   * Returns the project's book id
   * @throws an error if the book id does not exist.
   * @returns {string}
   */
  getBookId() {
    const manifest = this.getManifest();
    return manifest.project.id;
  }

  /**
   * Returns the name of the book.
   * If available the name will be localized.
   * @returns {string}
   */
  getBookName() {
    const manifest = this.getManifest();

    if (manifest.target_language && manifest.target_language.book && manifest.target_language.book.name) {
      return manifest.target_language.book.name;
    } else {
      return manifest.project.name;
    }
  }

  /**
   * Returns the resource id of the project.
   * For example: 'ust' or 'udt'
   * @returns {string}
   */
  getResourceId() {
    const manifest = this.getManifest();
    return manifest.resource.id;
  }

  /**
   * Returns the target language of the project
   * @returns {string}
   */
  getLanguageId() {
    const manifest = this.getManifest();
    return manifest.target_language.id;
  }

  /**
   * Returns the id of the original language
   * @returns {string}
   */
  getOriginalLanguageId() {
    const bookId = this.getBookId();
    return getOrigLangforBook(bookId).languageId;
  }

  /**
   * Checks if a tool (a.k.a. translationHelps) category has been copied into the project.
   * @param {string} toolName - the tool name. This is synonymous with translationHelp name
   * @param {string} category - the category id
   * @returns {boolean}
   */
  isCategoryLoaded(toolName, category) {
    const categoriesPath = this.getCategoriesPath(toolName);

    if (fs.pathExistsSync(categoriesPath)) {
      try {
        const data = fs.readJsonSync(categoriesPath);
        return data.loaded.indexOf(category) >= 0;
      } catch (e) {
        console.warn(
          `Failed to parse tool categories index at ${categoriesPath}.`, e);
      }
    }

    // rebuild missing/corrupt category index
    fs.outputJsonSync(categoriesPath, {
      current: [],
      loaded: [],
    }, { spaces: 2 });

    return false;
  }
  /**
   * Method to check if project groups data is out of date in relation
   * to the last source content update
   * @param {string} toolName - the tool name. This is synonymous with translationHelp name
   * @returns {Boolean} returns true if group data needs to be updated
   */
  hasNewGroupsData(toolName) {
    const categoriesPath = this.getCategoriesPath(toolName);

    if (fs.pathExistsSync(categoriesPath)) {
      try {
        let rawData = fs.readJsonSync(categoriesPath);
        const lastTimeDataUpdated = rawData.timestamp;

        if (!lastTimeDataUpdated) {
          return true;
        }

        const sourceContentManifestPath = path.join(USER_RESOURCES_PATH, SOURCE_CONTENT_UPDATER_MANIFEST);
        const { modified: lastTimeDataDownloaded } = fs.readJsonSync(sourceContentManifestPath);
        return new Date(lastTimeDataDownloaded).getTime() !== new Date(lastTimeDataUpdated).getTime();
      } catch (e) {
        console.warn(
          `Failed to parse tool categories index at ${categoriesPath}.`, e);
      }
    }
    return true;
  }

  /**
   * Resets the `loaded` array of groups data
   * Useful for forcing a reinitialization of groups data from resources into project
   * @param {string} toolName - The tool name. This is synonymous with translationHelp name
   */
  resetLoadedCategories(toolName) {
    const categoriesPath = this.getCategoriesPath(toolName);

    if (fs.pathExistsSync(categoriesPath)) {
      try {
        let rawData = fs.readJsonSync(categoriesPath);
        rawData.loaded = [];
        fs.outputJsonSync(categoriesPath, rawData, { spaces: 2 });
      } catch (e) {
        console.warn(
          `Failed to parse tool categories index at ${categoriesPath}.`, e);
      }
    }
  }

  /**
   * Removes categories from the currently selected that are not in the loaded array
   * @param {string} toolName - The tool name. This is synonymous with translationHelp name
   */
  removeStaleCategoriesFromCurrent(toolName) {
    const groupsPath = this.getCategoriesDir(toolName);
    const categoriesPath = this.getCategoriesPath(toolName);

    if (fs.pathExistsSync(categoriesPath)) {
      try {
        let rawData = fs.readJsonSync(categoriesPath);

        rawData.current.forEach((category, index) => {
          if (!rawData.loaded.includes(category)) {
            //There is something that is selected that is not loaded
            //Or there is something that is selected that is not in the current resources folder
            rawData.current.splice(index, 1);
          }
        });
        fs.outputJsonSync(categoriesPath, rawData, { spaces: 2 });
        const contextIdPath = path.join(groupsPath, 'currentContextId', 'contextId.json');

        if (fs.existsSync(contextIdPath)) {
          try {
            const currentContextId = fs.readJSONSync(contextIdPath);
            const currentContextIdGroup = currentContextId.groupId;

            if (!rawData.loaded.includes(currentContextIdGroup)) {
              fs.removeSync(contextIdPath);
            }
          } catch (e) {
            console.error('Could not reset current context id');
            console.error(e);
          }
        }

        const currentGroupsData = fs.readdirSync(groupsPath).filter((name) => name.includes('.json'));

        currentGroupsData.forEach((category) => {
          if (!rawData.loaded.includes(path.parse(category).name)) {
            //removing groups data files that are not in loaded
            fs.removeSync(path.join(groupsPath, category));
          }
        });
      } catch (e) {
        console.warn(
          `Failed to parse tool categories index at ${categoriesPath}.`, e);
      }
    }
  }

  /**
   * Marks a category as having been loaded into the project.
   * @param {string} toolName - The tool name. This is synonymous with translationHelp name
   * @param {string} subCategory - the subcategory that has been copied into the project
   * @param {boolean} [loaded=true] - indicates if the category is loaded
   * @returns {boolean}
   */
  setCategoryLoaded(toolName, subCategory, loaded = true) {
    const categoriesPath = this.getCategoriesPath(toolName);
    let data = {
      current: [],
      loaded: loaded ? [subCategory] : [],
    };

    if (fs.pathExistsSync(categoriesPath)) {
      try {
        let rawData = fs.readJsonSync(categoriesPath);

        // TRICKY: assert data structure before overwriting default to not propagate errors.
        if (loaded) {
          if (!rawData.loaded.includes(subCategory)) {
            rawData.loaded.push(subCategory);
          }
        } else {
          //Removing the loaded subCategory from list
          rawData.loaded = rawData.loaded.filter(c => c !== subCategory);
        }
        data = rawData;
      } catch (e) {
        console.warn(
          `Failed to parse tool categories index at ${categoriesPath}.`, e);
      }
    }

    const sourceContentManifestPath = path.join(USER_RESOURCES_PATH, SOURCE_CONTENT_UPDATER_MANIFEST);
    const { modified: lastTimeDataDownloaded } = fs.readJsonSync(sourceContentManifestPath);
    data.timestamp = lastTimeDataDownloaded;
    fs.outputJsonSync(categoriesPath, data, { spaces: 2 });
  }

  /**
   * get the path for the .categories
   * @param toolName
   * @return {*}
   */
  getCategoriesPath(toolName) {
    const categoriesPath = path.join(this.getCategoriesDir(toolName), '.categories');
    return categoriesPath;
  }

  /**
   * Modifies the current field of the .categories file in project index path.
   * @param {string} toolName - The tool name. This is synonymous with translationHelp name.
   * @param {object} availableCategories - List of categories and subcategories.
   */
  setCurrentCategories(toolName, availableCategories) {
    const categoriesPath = this.getCategoriesPath(toolName);

    try {
      if (fs.existsSync(categoriesPath)) {
        const rawData = fs.readJsonSync(categoriesPath);
        const categoryKeys = Object.keys(availableCategories);
        // In some older projects the category was saved in the .categories file instead of the subcategories.
        let newCurrent = rawData.current.map(currentItem => {
          if (categoryKeys.includes(currentItem)) {
            return availableCategories[currentItem];
          } else {
            return currentItem;
          }
        });
        // flatten the array
        newCurrent = [].concat.apply([], newCurrent);
        // Remove duplicate items
        newCurrent = newCurrent.filter((item, index) => newCurrent.indexOf(item) === index);
        const data = { ...rawData, current: newCurrent };
        const sourceContentManifestPath = path.join(USER_RESOURCES_PATH, SOURCE_CONTENT_UPDATER_MANIFEST);
        const { modified: lastTimeDataDownloaded } = fs.readJsonSync(sourceContentManifestPath);
        data.timestamp = lastTimeDataDownloaded;
        // save new .categories file in project index path
        fs.outputJsonSync(categoriesPath, data, { spaces: 2 });
      }
    } catch (e) {
      console.error(`Failed to set current categories at ${categoriesPath}.`);
      console.error(e);
    }
  }

  /**
   * Removes category index from project, and creates empty directory
   * Useful for getting rid of stale data after a resource update
   * @param {string} toolName - The tool name. This is synonymous with translationHelp name
   */
  resetCategoryGroupIds(toolName) {
    const indexPath = path.join(this.getCategoriesDir(toolName),
      '.categoryIndex');
    fs.removeSync(indexPath);
    fs.ensureDirSync(indexPath);
  }

  /**
   * Records an index of which groups belong to which category.
   * @param {string} toolName - The tool name. This is synonymous with translationHelp name
   * @param {string} category - the name of the category to which the groups belong
   * @param {string[]} groups - an array of group ids
   */
  setCategoryGroupIds(toolName, category, groups) {
    const indexPath = path.join(this.getCategoriesDir(toolName),
      '.categoryIndex', `${category}.json`);
    fs.outputJsonSync(indexPath, groups, { spaces: 2 });
  }

  /**
   * Returns an array of groups ids for the given category
   * @param {string} toolName - The tool name. This is synonymous with translationHelp name
   * @param {string} categoryId - the id of the category
   * @returns {string[]} - an array of group ids that belong to the category
   */
  getCategoryGroupIds(toolName, categoryId) {
    const indexPath = path.join(this.getCategoriesDir(toolName),
      '.categoryIndex', `${categoryId}.json`);

    if (fs.pathExistsSync(indexPath)) {
      try {
        return fs.readJsonSync(indexPath);
      } catch (e) {
        console.error(`Failed to read the category index at ${indexPath}`, e);
      }
    }
    return [];
  }

  /**
   * Returns a tool's parent category of a given subcategory (groupId) for reverse lookup
   * @param toolName
   * @param groupId
   * @returns {string}
   */
  getParentCategory(toolName, groupId) {
    const parentCategoryMapping = this.getAllCategoryMapping(toolName);

    for (let parentCategoryName in parentCategoryMapping) {
      if (parentCategoryMapping[parentCategoryName].includes(groupId)) {
        return parentCategoryName;
      }
    }
  }

  /**
   * Gets the category mapping for a tool in the project's .categoryIndex's directory
   * @param {string} toolName
   * @returns {object}
   */
  getAllCategoryMapping(toolName) {
    const parentCategoriesObject = {};
    const indexPath = path.join(this.getCategoriesDir(toolName), '.categoryIndex');

    if (fs.pathExistsSync(indexPath)) {
      try {
        const parentCategories = fs.readdirSync(indexPath).map((fileName) => path.parse(fileName).name);

        parentCategories.forEach((category) => {
          const subCategoryPath = path.join(this.getCategoriesDir(toolName), '.categoryIndex', `${category}.json`);
          parentCategoriesObject[category] = fs.readJsonSync(subCategoryPath);
        });
      } catch (e) {
        console.error(`Failed to read the category index at ${indexPath}`, e);
      }
    }
    return parentCategoriesObject;
  }

  /**
   * Returns an array of categories that have been selected for the given tool.
   * @param {string} toolName - The tool name. This is synonymous with translationHelp name
   * @param {boolean} withParent
   * @return {string[]} an array of category names
   */
  getSelectedCategories(toolName, withParent = false) {
    const categoriesPath = this.getCategoriesPath(toolName);

    if (fs.pathExistsSync(categoriesPath)) {
      try {
        const data = fs.readJsonSync(categoriesPath);

        if (withParent) {
          let objectWithParentCategories = {};
          const subCategories = data.current;
          const parentCategoryMapping = this.getAllCategoryMapping(toolName);

          subCategories.forEach((subcategory) => {
            Object.keys(parentCategoryMapping).forEach((categoryName) => {
              if (parentCategoryMapping[categoryName].includes(subcategory)) {
                // Subcategory name is contained in this parent
                if (!objectWithParentCategories[categoryName]) {
                  objectWithParentCategories[categoryName] = [];
                }
                objectWithParentCategories[categoryName].push(subcategory);
              }
            });
          });
          return objectWithParentCategories;
        } else {
          // fix for toolcard bug produced in 1.1.4 where only one subcategory was saved for tw
          if (data.current.length === 1 && toolName === TRANSLATION_WORDS) {
            return [];
          }
          return data.current;
        }
      } catch (e) {
        console.warn(
          `Failed to parse tool categories index at ${categoriesPath}.`, e);
      }
    }

    return [];
  }

  /**
 * Returns an array of categories that have been loaded for the given tool.
 * @param toolName - The tool name. This is synonymous with translationHelp name
 * @return {string[]} an array of category names
 */
  getLoadedCategories(toolName) {
    const categoriesPath = this.getCategoriesPath(toolName);

    if (fs.pathExistsSync(categoriesPath)) {
      try {
        const data = fs.readJsonSync(categoriesPath);
        return data.loaded;
      } catch (e) {
        console.warn(
          `Failed to parse tool categories index at ${categoriesPath}.`, e);
      }
    }

    return [];
  }

  /**
   * Sets the categories that have been selected for the the given tool.
   * Category selection controls which sets of help data will be loaded
   * when the tool is opened.
   * @param {string} toolName - The tool name. This is synonymous with translationHelp name
   * @param {string[]} [categories=[]] - an array of category names
   */
  setSelectedCategories(toolName, categories = []) {
    const categoriesPath = this.getCategoriesPath(toolName);
    let data = {
      current: categories,
      loaded: [],
      timestamp: generateTimestamp(),
    };

    if (fs.pathExistsSync(categoriesPath)) {
      try {
        const rawData = fs.readJsonSync(categoriesPath);
        // TRICKY: assert data structure before overwriting default to not propagate errors.
        rawData.current = categories;
        data = rawData;
      } catch (e) {
        console.warn(
          `Failed to parse tool categories index at ${categoriesPath}.`, e);
      }
    }
    fs.outputJsonSync(categoriesPath, data, { spaces: 2 });
  }

  /**
   * Handles writing data to the project's data directory.
   *
   * @param {string} filePath - the relative path to be written
   * @param {string} data - the data to write
   * @return {Promise}
   */
  async writeDataFile(filePath, data) {
    const writePath = path.join(this._dataPath, filePath);
    return await fs.outputFile(writePath, data); // TODO: shouldn't have 'await' here since this is supposed to be async write?
  }

  /**
   * Handles synchronously writing data to the project's data directory.
   * @param {string} filePath - the relative path to be written
   * @param {string} data - the data to write
   */
  writeDataFileSync(filePath, data) {
    const writePath = path.join(this._dataPath, filePath);
    fs.outputFileSync(writePath, data);
  }

  /**
   * Reads the contents of the project's data directory.
   * @param {string} dir - the relative path to read
   * @return {Promise<string[]>}
   */
  async readDataDir(dir) {
    const dirPath = path.join(this._dataPath, dir);
    return await fs.readdir(dirPath);
  }

  /**
   * Handles synchronously reading a directory in the project's data directory.
   * @param {string} dir - the relative path to read
   * @return {string[]}
   */
  readDataDirSync(dir) {
    const dirPath = path.join(this._dataPath, dir);
    return fs.readdirSync(dirPath);
  }

  /**
   * Handles reading data from the project's root directory
   *
   * @param {string} filePath - the relative path to read
   * @return {Promise<string>}
   */
  async readFile(filePath) {
    const readPath = path.join(this._projectPath, filePath);
    const data = await fs.readFile(readPath);
    return data.toString();
  }

  /**
   * Handles reading data from the project's data directory
   *
   * @param {string} filePath - the relative path to read
   * @return {Promise<string>}
   */
  async readDataFile(filePath) {
    const readPath = path.join(this._dataPath, filePath);
    const data = await fs.readFile(readPath);
    return data.toString();
  }

  /**
   * Handles reading data from the project's root directory.
   * You probably shouldn't use this in most situations.
   * @throws an exception if the path does not exist.
   * @param {string} filePath - the relative file path
   * @returns {string}
   * @private
   */
  readFileSync(filePath) {
    const readPath = path.join(this._projectPath, filePath);
    const data = fs.readFileSync(readPath);
    return data.toString();
  }

  /**
   * Handles synchronously reading data from the project's data directory.
   * @throws an exception if the path does not exist.
   * @param {string} filePath - the relative path to read
   * @return {string}
   */
  readDataFileSync(filePath) {
    const readPath = path.join(this._dataPath, filePath);
    const data = fs.readFileSync(readPath);
    return data.toString();
  }

  /**
   * Checks if the path exists in the project's data directory
   * @param {string} filePath - the relative path who's existence will be checked
   * @return {Promise<boolean>}
   */
  async dataPathExists(filePath) {
    const readPath = path.join(this._dataPath, filePath);
    return await fs.pathExists(readPath);
  }

  /**
   * Checks if the path exists in the project's root directory
   * @param filePath
   * @returns {Promise<boolean>|*}
   * @private
   */
  pathExistsSync(filePath) {
    const readPath = path.join(this._projectPath, filePath);
    return fs.pathExistsSync(readPath);
  }

  /**
   * Synchronously checks if a path exists in the project's data directory
   * @param {string} filePath - the relative path who's existence will be checked
   * @return {boolean}
   */
  dataPathExistsSync(filePath) {
    const readPath = path.join(this._dataPath, filePath);
    return fs.pathExistsSync(readPath);
  }

  /**
   * Handles deleting global project data files
   *
   * @param {string} filePath - the relative path to delete
   * @return {Promise}
   */
  async deleteDataFile(filePath) {
    const fullPath = path.join(this._dataPath, filePath);
    return await fs.remove(fullPath);
  }

  /**
   * Handles deleting global project data files synchronously
   *
   * @param {string} filePath - the relative path to delete
   */
  deleteDataFileSync(filePath) {
    const fullPath = path.join(this._dataPath, filePath);
    fs.removeSync(fullPath);
  }

  /**
   * Reads the current context Id from the current project's filesystem.
   * @param {string} toolName - tool name.
   */
  readCurrentContextIdSync(toolName) {
    try {
      if (!toolName) {
        return null;
      }

      const groupsPath = this.getCategoriesDir(toolName);
      const contextIdPath = path.join(groupsPath, 'currentContextId', 'contextId.json');

      if (fs.existsSync(contextIdPath)) {
        try {
          const currentContextId = fs.readJSONSync(contextIdPath);

          if (currentContextId) {
            return currentContextId;
          }
        } catch (error) {
          console.error(`readCurrentContextIdSync() - error reading ${contextIdPath}`, error);
        }
      }

      console.warn(`readCurrentContextIdSync() - contextIdPath, ${contextIdPath} doesn't exist or is invalid`);
      const groupsData = this.getGroupsData(toolName);
      const groupsDataKeys = Object.keys(groupsData);
      const firstKey = groupsDataKeys[0];
      console.warn(`The project doesn't have a currentContextId, thus getting the first item on the groupsData list`);
      const groupData = groupsData[firstKey][0];
      const { contextId } = groupData || { contextId: null };
      return contextId;
    } catch (error) {
      console.error(`readCurrentContextIdSync() - failure getting first item`, error);
      return null;
    }
  }
}
