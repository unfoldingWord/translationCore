import path from 'path-extra';
import fs from 'fs-extra';
import { resourcesHelpers } from 'tc-source-content-updater';
import { getLatestVersion } from '../actions/ResourcesActions';
import {
  getProjectBookId,
  getProjectManifest,
  getProjectSaveLocation,
} from '../selectors';
import { TRANSLATION_NOTES, USER_RESOURCES_PATH } from '../common/constants';
import * as BibleHelpers from './bibleHelpers';

/**
 * Returns the original language version number needed for tn's group data files.
 * @param {array} tsvRelations
 * @param {string} resourceId
 */
export function getTsvOLVersion(tsvRelations, resourceId) {
  try {
    let tsvOLVersion = null;

    if (tsvRelations) {
      // Get the query string from the tsv_relation array for given resourceId
      const query = tsvRelations.find((query) => query.includes(resourceId));

      if (query) {
        // Get version number from query
        tsvOLVersion = query.split('?v=')[1];
      }
    }
    return tsvOLVersion;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Search folder for most recent version
 * @param {string} bibleFolderPath
 * @return {string} latest version found
 */
function getMostRecentVersionInFolder(bibleFolderPath) {
  const versionNumbers = fs.readdirSync(bibleFolderPath).filter(folder => folder !== '.DS_Store'); // ex. v9
  const latestVersion = getLatestVersion(versionNumbers);
  return latestVersion;
}

/**
 * get current Original language resources by tN
 * @param {Object} state - current reducers state
 * @return {null|string}
 */
export function getCurrentOrigLangVersionForTn(state) {
  const bookId = getProjectBookId(state);
  const { bibleId: origLangBibleId } = BibleHelpers.getOrigLangforBook(bookId);
  // tn files are generated from a specific version number of the original language resources which are reference as relation
  const { tsv_relation } = getProjectManifest(state);
  // Get version number needed by tn's tsv
  const tsvOLVersion = getTsvOLVersion(tsv_relation, origLangBibleId);
  return tsvOLVersion;
}

/**
 * gets the data that the tool needs
 * @param {Object} state - current reducers state
 * @return {{resourceId, languageId, latestOlVersion, tsvOLVersion: (*|undefined)}}
 */
export function getOrigLangVersionInfoForTn(state) {
  const bookId = getProjectBookId(state);
  const { bibleId: origLangBibleId, languageId: origLangId } = BibleHelpers.getOrigLangforBook(bookId);
  const bibleFolderPath = path.join(USER_RESOURCES_PATH, origLangId, 'bibles', origLangBibleId);
  let latestOlVersion = null;

  if (fs.existsSync(bibleFolderPath)) {
    latestOlVersion = getMostRecentVersionInFolder(bibleFolderPath);

    if (latestOlVersion && (latestOlVersion[0] === 'v')) {
      latestOlVersion = latestOlVersion.substr(1); // strip off leading 'v'
    }
  }

  const tsvOLVersion = getCurrentOrigLangVersionForTn(state);
  return {
    origLangId, origLangBibleId, latestOlVersion, tsvOLVersion,
  };
}

/**
 * the gl tN helps may have changed so get the latest helps for the gl and get the Orig Lang version needed
 * @param {Object} state - current reducers state
 * @return {{resourceId, languageId, latestOlVersion, tsvOLVersion: (*|undefined)}}
 */
export function getLatestResourcesForTn(state) {
  const manifest = getProjectManifest(state);
  const bookId = getProjectBookId(state);
  const { bibleId: origLangBibleId } = BibleHelpers.getOrigLangforBook(bookId);
  const gl = manifest && manifest.toolsSelectedGLs && manifest.toolsSelectedGLs && manifest.toolsSelectedGLs.translationNotes;
  let glVersion = null, origLangVersion = null, tsv_relation = null;

  if (gl) {
    const resourcesPath = path.join(USER_RESOURCES_PATH, gl, 'translationHelps/translationNotes');

    if (fs.existsSync(resourcesPath)) {
      glVersion = getMostRecentVersionInFolder(resourcesPath);
      const resourceManifestPath = path.join(resourcesPath, glVersion, 'manifest.json');

      if (fs.existsSync(resourceManifestPath)) {
        const manifest = fs.readJsonSync(resourceManifestPath);
        tsv_relation = manifest && manifest.dublin_core && manifest.dublin_core.relation;
        origLangVersion = getTsvOLVersion(tsv_relation, origLangBibleId);
      }
    }
  }
  return {
    glVersion, origLangVersion, tsv_relation,
  };
}

/**
 * returns true if tool is using the most current original Language version
 * @param {object} state
 * @param {String} toolName
 */
export const isToolUsingCurrentOriginalLanguage = (state, toolName) => {
  let isCurrent = false;
  const projectSaveLocation = getProjectSaveLocation(state);

  if (projectSaveLocation) { // only check if project is selected
    if (toolName === TRANSLATION_NOTES) {
      const { latestOlVersion, tsvOLVersion } = getOrigLangVersionInfoForTn(state);
      const latestOlVersion_ = resourcesHelpers.splitVersionAndOwner(latestOlVersion).version;
      isCurrent = (latestOlVersion_ === tsvOLVersion);
    } else if (toolName) { // any other tool always uses current
      isCurrent = true;
    }
  }

  return isCurrent;
};
