import path from "path-extra";
import fs from "fs-extra";

const PROJECT_TC_DIR = ".apps/translationCore/";

/**
 * Provides an interface with which tools can interact with a project
 * TODO: this could eventually be used to handle all project manipulation in tC not use used with the tools
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

    this.writeData = this.writeData.bind(this);
    this.writeDataSync = this.writeDataSync.bind(this);
    this.readDir = this.readDir.bind(this);
    this.readDirSync = this.readDirSync.bind(this);
    this.readData = this.readData.bind(this);
    this.readDataSync = this.readDataSync.bind(this);
    this.pathExists = this.pathExists.bind(this);
    this.pathExistsSync = this.pathExistsSync.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.deleteFileSync = this.deleteFileSync.bind(this);
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
   * Loads the project manifest from the disk.
   * Subsequent calls are cached.
   * @returns {Promise<JSON>} the manifest json object
   * @private
   */
  getManifest() {
    if (this._manifest === null) {
      const data = this._readProjectDataSync("manifest.json");
      this._manifest = JSON.parse(data);
    }
    return this._manifest;
  }

  /**
   * Returns the project's book id
   * @returns {Promise<string>}
   */
  getBookId() {
    const manifest = this.getManifest();
    return manifest.project.id;
  }

  /**
   * Checks if a tool (a.k.a. translationHelps) category has been loaded
   * @param {string} toolName - the tool name. This is synonymous with translationHelp name
   * @param {string} category - the category id
   * @returns {boolean}
   */
  isToolCategoryLoaded(toolName, category) {
    // TODO: the book id is redundant to have in the project directory.
    const bookId = this.getBookId();
    const categoriesPath = path.join(this._dataPath, "index", toolName, bookId, ".categories");
    if(fs.existsSync(categoriesPath)) {
      try {
        const data = fs.readJSONSync(categoriesPath);
        return data.loaded.indexOf(category) >= 0;
      } catch (e) {
        console.warn(`Failed to parse tool categories index at ${categoriesPath}.`, e);
      }
    }

    // rebuild missing/corrupt category index
    fs.writeJSONSync(categoriesPath, {
      current: [],
      loaded: []
    });

    return false;
  }

  /**
   * Handles writing global project data
   *
   * @param {string} filePath - the relative path to be written
   * @param {string} data - the data to write
   * @return {Promise}
   */
  writeData(filePath, data) {
    const writePath = path.join(this._dataPath, filePath);
    return fs.outputFile(writePath, data);
  }

  /**
   * Handles writing global project data synchronously
   * @param {string} filePath - the relative path to be written
   * @param {string} data - the data to write
   */
  writeDataSync(filePath, data) {
    const writePath = path.join(this._dataPath, filePath);
    fs.outputFileSync(writePath, data);
  }

  /**
   * Reads the contents of the project directory
   * @param {string} dir - the relative path to read
   * @return {Promise<string[]>}
   */
  readDir(dir) {
    const dirPath = path.join(this._dataPath, dir);
    return fs.readdir(dirPath);
  }

  /**
   * Handles reading a project directory synchronously
   * @param {string} dir - the relative path to read
   * @return {string[]}
   */
  readDirSync(dir) {
    const dirPath = path.join(this._dataPath, dir);
    return fs.readdirSync(dirPath);
  }

  /**
   * Handles reading global project data
   *
   * @param {string} filePath - the relative path to read
   * @return {Promise<string>}
   */
  async readData(filePath) {
    const readPath = path.join(this._dataPath, filePath);
    const data = await fs.readFile(readPath);
    return data.toString();
  }

  /**
   * Read data relative to the project's root path.
   * You probably shouldn't use this in most situations.
   * @param {string} filePath - the relative file path
   * @returns {string}
   * @private
   */
  _readProjectDataSync(filePath) {
    const readPath = path.join(this._projectPath, filePath);
    const data = fs.readFileSync(readPath);
    return data.toString();
  }

  /**
   * Handles reading global project data synchronously
   * @param {string} filePath - the relative path to read
   * @return {string}
   */
  readDataSync(filePath) {
    const readPath = path.join(this._dataPath, filePath);
    const data = fs.readFileSync(readPath);
    return data.toString();
  }

  /**
   * Checks if the path exists in the project
   * @param {string} filePath - the relative path who's existence will be checked
   * @return {Promise<boolean>}
   */
  pathExists(filePath) {
    const readPath = path.join(this._dataPath, filePath);
    return fs.pathExists(readPath);
  }

  /**
   * Synchronously checks if a path exists in the project
   * @param {string} filePath - the relative path who's existence will be checked
   * @return {boolean}
   */
  pathExistsSync(filePath) {
    const readPath = path.join(this._dataPath, filePath);
    return fs.pathExistsSync(readPath);
  }

  /**
   * Handles deleting global project data files
   *
   * @param {string} filePath - the relative path to delete
   * @return {Promise}
   */
  deleteFile(filePath) {
    const fullPath = path.join(this._dataPath, filePath);
    return fs.remove(fullPath);
  }

  /**
   * Handles deleting global project data files synchronously
   *
   * @param {string} filePath - the relative path to delete
   */
  deleteFileSync(filePath) {
    const fullPath = path.join(this._dataPath, filePath);
    fs.removeSync(fullPath);
  }
}
