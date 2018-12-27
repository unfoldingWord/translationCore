import ospath from "ospath";
import path from "path-extra";
import fs from "fs-extra";

/**
 * Provides an interface by which you can interact with the resources in the user's home directory.
 */
class ResourceAPI {

  /**
   * Creates a new resource api
   * @param {string} resourcesDir - the absolute path to the resources directory
   */
  constructor(resourcesDir) {
    this._resourcesDir = resourcesDir;
  }

  /**
   * Creates a new api for the default resources directory
   * @returns {ResourceAPI}
   */
  static default() {
    const dir = path.join(ospath.home(), "translationCore", "resources");
    return new ResourceAPI(dir);
  }

  /**
   * Returns the path to the resources directory
   * @returns {string}
   */
  get path() {
    return this._resourcesDir;
  }

  /**
   * Lists the translation helps available in the gateway language
   * @param {string} gatewayLanguage - the gateway language code
   * @returns {string[]}
   */
  getTranslationHelps(gatewayLanguage) {
    const dir = path.join(this._resourcesDir, gatewayLanguage, "translationHelps");
    return fs.readdirSync(dir);
  }

  /**
   * Returns the path to the latest version of the translation help
   * @param {string} gatewayLanguage - the gateway language code
   * @param {string} helpName - this is synonymous with toolName
   * @returns {string|null} the file path or null if no directory was found
   */
  getLatestTranslationHelp(gatewayLanguage, helpName) {
    const helpDir = path.join(this._resourcesDir, gatewayLanguage, "translationHelps", helpName);
    const versions = this.listVersionedDirectories(helpDir);
    if(versions.length > 0) {
      return path.join(helpDir, versions[0]);
    } else {
      return null;
    }
  }

  /**
   * Returns an array of paths found in the directory sorted by version
   * @param {string} dir
   * @returns {string[]}
   */
  listVersionedDirectories(dir) {
    if (fs.pathExistsSync(dir)) {
      const versionedDirs = fs.readdirSync(dir).filter(file => {
        return fs.lstatSync(path.join(dir, file)).isDirectory() &&
          file.match(/^v\d/i);
      });
      return versionedDirs.sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true});
      });
    }
    return [];
  }
}

export default ResourceAPI;
