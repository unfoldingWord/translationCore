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
    return ResourceAPI.getLatestVersion(helpDir);
  }

  /**
   * Returns the versioned folder within the directory with the highest value.
   * e.g. `v10` is greater than `v9`
   * @param {string} dir - the directory to read
   * @returns {string} the full path to the latest version directory.
   */
  static getLatestVersion(dir) {
    const versions = ResourceAPI.listVersions(dir);
    if(versions.length > 0) {
      return path.join(dir, versions[0]);
    } else {
      return null;
    }
  }

  /**
   * Returns an array of paths found in the directory filtered and sorted by version
   * @param {string} dir
   * @returns {string[]}
   */
  static listVersions(dir) {
    if (fs.pathExistsSync(dir)) {
      const versionedDirs = fs.readdirSync(dir).filter(file => {
        return fs.lstatSync(path.join(dir, file)).isDirectory() &&
          file.match(/^v\d/i);
      });
      return versionedDirs.sort((a, b) => {
        const numA = parseInt(a.substr(1));
        const numB = parseInt(b.substr(1));
        return numB - numA;
      });
    }
    return [];
  }
}

export default ResourceAPI;
