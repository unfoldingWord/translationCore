import path from 'path-extra';
import fs from 'fs-extra';
import semver from 'semver';
import env from 'tc-electron-env';
import { apiHelpers, resourcesHelpers } from 'tc-source-content-updater';
import {
  TC_PATH,
  TRANSLATION_HELPS,
  TRANSLATION_WORDS,
  TRANSLATION_WORDS_LINKS,
} from '../common/constants';

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
    const dir = path.join(env.home(), TC_PATH, 'resources');
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
    const dir = path.join(this._resourcesDir, gatewayLanguage, TRANSLATION_HELPS);
    return fs.readdirSync(dir);
  }

  /**
   * Returns the path to the latest version of the translation help (this is for the helps index)
   * @param {string} gatewayLanguage - the gateway language code
   * @param {string} helpName - this is synonymous with toolName
   * @param {string} owner
   * @returns {string|null} the file path or null if no directory was found
   */
  getLatestTranslationHelp(gatewayLanguage, helpName, owner) {
    if ((helpName === TRANSLATION_WORDS) && (owner !== apiHelpers.DOOR43_CATALOG)) { // support twls if not from Door43 catalog
      helpName = TRANSLATION_WORDS_LINKS;
    }

    const helpDir = path.join(this._resourcesDir, gatewayLanguage, TRANSLATION_HELPS, helpName);
    return ResourceAPI.getLatestVersion(helpDir, owner);
  }

  /**
   * Returns the versioned folder within the directory with the highest value.
   * e.g. `v10` is greater than `v9`
   * @param {string} dir - the directory to read
   * @param {string} ownerStr - optional owner, if not given defaults to Door43-Catalog
   * @returns {string} the full path to the latest version directory.
   */
  static getLatestVersion(dir, ownerStr) {
    return resourcesHelpers.getLatestVersionInPath(dir, ownerStr);
  }

  /**
   * Gets latest versions by owner
   * @param {string} dir - the directory to read
   * @return {object} latest by owner
   */
  static getLatestVersionsAndOwners(dir) {
    return resourcesHelpers.getLatestVersionsAndOwners(dir);
  }

  /**
   * Returns an array of paths found in the directory filtered and sorted by version, and optionally filtered by owner
   * @param {string} dir
   * @param {string} owner
   * @returns {string[]}
   */
  static listVersions(dir, owner = null) {
    if (fs.pathExistsSync(dir)) {
      const versionedDirs = fs.readdirSync(dir).filter(file => {
        let valid = fs.lstatSync(path.join(dir, file)).isDirectory() && file.match(/^v\d/i);

        if (valid && owner) { // make sure matches owner
          const { owner: owner_ } = resourcesHelpers.splitVersionAndOwner(file);

          if (owner_ !== owner) {
            return false;
          }
        }
        return valid;
      });
      return versionedDirs.sort((a, b) =>
        -this.compareVersions(a, b), // do inverted sort
      );
    }
    return [];
  }

  /**
   * compares version numbers, if a > b returns 1; if a < b return -1; else are equal and return 0
   * @param a
   * @param b
   * @return {number}
   */
  static compareVersions(a, b) {
    const cleanA = semver.coerce(a);
    const cleanB = semver.coerce(b);

    if (semver.gt(cleanA, cleanB)) {
      return 1;
    } else if (semver.lt(cleanA, cleanB)) {
      return -1;
    } else {
      return 0;
    }
  }
}

export default ResourceAPI;
