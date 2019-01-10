import path from "path-extra";
import fs from "fs-extra";

const PROJECT_TC_DIR = ".apps/translationCore/";

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
    this._dataPath = path.join(projectDir, PROJECT_TC_DIR);
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
    this.getGroupData = this.getGroupData.bind(this);
    this.setCategoryGroupIds = this.setCategoryGroupIds.bind(this);
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
    return path.join(this._dataPath, "index", toolName, bookId);
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
      const files = fs.readdirSync(dir);

      for (let i = 0, len = files.length; i < len; i++) {
        const dataPath = path.join(dir, files[i]);
        if (path.extname(dataPath) !== ".json") {
          continue;
        }

        const groupName = path.basename(dataPath, ".json");
        try {
          data[groupName] = fs.readJsonSync(dataPath);
        } catch (e) {
          console.error(`Failed to load group data from ${dataPath}`);
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
   * @returns {object} - the group data object
   */
  getGroupData(toolName, groupId) {
    const dataPath = path.join(this.getCategoriesDir(toolName), `${groupId}`);
    return fs.readJsonSync(dataPath);
  }

  /**
   * Imports a group data file into the project.
   * Group data that already exists will not be overwritten.
   * @param {string} toolName - the name of the tool that the categories belong to
   * @param {string} dataPath - the path to the group data file
   * @returns {boolean} true if the group data was imported. false if already imported.
   */
  importCategoryGroupData(toolName, dataPath) {
    const destDir = this.getCategoriesDir(toolName);
    const groupName = path.basename(dataPath);
    const destFile = path.join(destDir, groupName);

    if (!fs.pathExistsSync(destFile)) {
      fs.copySync(dataPath, destFile);
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
      const data = this.readFileSync("manifest.json");
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
   * Checks if a tool (a.k.a. translationHelps) category has been copied into the project.
   * @param {string} toolName - the tool name. This is synonymous with translationHelp name
   * @param {string} category - the category id
   * @returns {boolean}
   */
  isCategoryLoaded(toolName, category) {
    const categoriesPath = path.join(this.getCategoriesDir(toolName),
      ".categories");
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
      loaded: []
    });

    return false;
  }

  /**
   * Marks a category as having been loaded into the project.
   * @param {string} toolName - The tool name. This is synonymous with translationHelp name
   * @param {string} category - the category that has been copied into the project
   * @param {boolean} [loaded=true] - indicates if the category is loaded
   * @returns {boolean}
   */
  setCategoryLoaded(toolName, category, loaded=true) {
    const categoriesPath = path.join(this.getCategoriesDir(toolName),
      ".categories");
    let data = {
      current: [],
      loaded: loaded ? [category] : []
    };

    if (fs.pathExistsSync(categoriesPath)) {
      try {
        let rawData = fs.readJsonSync(categoriesPath);
        // TRICKY: assert data structure before overwriting default to not propagate errors.
        if(loaded) {
          rawData.loaded.push(category);
        } else {
          rawData.loaded = rawData.loaded.filter(c => c !== category);
        }
        data = rawData;
      } catch (e) {
        console.warn(
          `Failed to parse tool categories index at ${categoriesPath}.`, e);
      }
    }

    fs.outputJsonSync(categoriesPath, data);
  }

  /**
   * Records an index of which groups belong to which category.
   * @param {string} toolName - The tool name. This is synonymous with translationHelp name
   * @param {string} category - the name of the category to which the groups belong
   * @param {string[]} groups - an array of group ids
   */
  setCategoryGroupIds(toolName, category, groups) {
    const indexPath = path.join(this.getCategoriesDir(toolName),
      ".categoryIndex", `${category}.json`);
    fs.outputJsonSync(indexPath, groups);
  }

  /**
   * Returns an array of groups ids for the given category
   * @param {string} toolName - The tool name. This is synonymous with translationHelp name
   * @param {string} category - the name of the category
   * @returns {string[]} - an array of group ids that belong to the category
   */
  getCategoryGroupIds(toolName, category) {
    const indexPath = path.join(this.getCategoriesDir(toolName),
      ".categoryIndex", `${category}.json`);
    if(fs.pathExistsSync(indexPath)) {
      try {
        return fs.readJsonSync(indexPath);
      } catch (e) {
        console.error(`Failed to read the category index at ${indexPath}`, e);
      }
    }
    return [];
  }

  /**
   * Returns an array of categories that have been selected for the given tool.
   * @param toolName - The tool name. This is synonymous with translationHelp name
   * @return {string[]} an array of category names
   */
  getSelectedCategories(toolName) {
    const categoriesPath = path.join(this.getCategoriesDir(toolName),
      ".categories");
    if (fs.pathExistsSync(categoriesPath)) {
      try {
        const data = fs.readJsonSync(categoriesPath);
        return data.current;
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
  setSelectedCategories(toolName, categories=[]) {
    const categoriesPath = path.join(this.getCategoriesDir(toolName),
      ".categories");
    let data = {
      current: categories,
      loaded: []
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

    fs.outputJsonSync(categoriesPath, data);
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
    return await fs.outputFile(writePath, data);
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
}
