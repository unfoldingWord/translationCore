import path from "path-extra";
import fs from "fs-extra";

const PROJECT_TC_DIR = ".apps/translationCore/";

/**
 * Provides an interface for interacting with project files.
 * This is used by tools to manage data in the project.
 */
export default class ProjectAPI {

  /**
   * Creates a new project api
   * @param {string} projectDir - the absolute path to the project directory
   */
  constructor(projectDir) {
    this.projectPath = projectDir;
    this.dataPath = path.join(projectDir, PROJECT_TC_DIR);

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
   * Handles writing global project data
   *
   * @param {string} filePath - the relative path to be written
   * @param {string} data - the data to write
   * @return {Promise}
   */
  writeData(filePath, data) {
    const writePath = path.join(this.dataPath, filePath);
    return fs.outputFile(writePath, data);
  }

  /**
   * Handles writing global project data synchronously
   * @param {string} filePath - the relative path to be written
   * @param {string} data - the data to write
   */
  writeDataSync(filePath, data) {
    const writePath = path.join(this.dataPath, filePath);
    fs.outputFileSync(writePath, data);
  }

  /**
   * Reads the contents of the project directory
   * @param {string} dir - the relative path to read
   * @return {Promise<string[]>}
   */
  readDir(dir) {
    const dirPath = path.join(this.dataPath, dir);
    return fs.readdir(dirPath);
  }

  /**
   * Handles reading a project directory synchronously
   * @param {string} dir - the relative path to read
   * @return {string[]}
   */
  readDirSync(dir) {
    const dirPath = path.join(this.dataPath, dir);
    return fs.readdirSync(dirPath);
  }

  /**
   * Handles reading global project data
   *
   * @param {string} filePath - the relative path to read
   * @return {Promise<string>}
   */
  async readData(filePath) {
    const readPath = path.join(this.dataPath, filePath);
    const data = await fs.readFile(readPath);
    return data.toString();
  }

  /**
   * Handles reading global project data synchronously
   * @param {string} filePath - the relative path to read
   * @return {string}
   */
  readDataSync(filePath) {
    const readPath = path.join(this.dataPath, filePath);
    const data = fs.readFileSync(readPath);
    return data.toString();
  }

  /**
   * Checks if the path exists in the project
   * @param {string} filePath - the relative path who's existence will be checked
   * @return {Promise<boolean>}
   */
  pathExists(filePath) {
    const readPath = path.join(this.dataPath, filePath);
    return fs.pathExists(readPath);
  }

  /**
   * Synchronously checks if a path exists in the project
   * @param {string} filePath - the relative path who's existence will be checked
   * @return {boolean}
   */
  pathExistsSync(filePath) {
    const readPath = path.join(this.dataPath, filePath);
    return fs.pathExistsSync(readPath);
  }

  /**
   * Handles deleting global project data files
   *
   * @param {string} filePath - the relative path to delete
   * @return {Promise}
   */
  deleteFile(filePath) {
    const fullPath = path.join(this.dataPath, filePath);
    return fs.remove(fullPath);
  }

  /**
   * Handles deleting global project data files synchronously
   *
   * @param {string} filePath - the relative path to delete
   */
  deleteFileSync(filePath) {
    const fullPath = path.join(this.dataPath, filePath);
    fs.removeSync(fullPath);
  }
}
