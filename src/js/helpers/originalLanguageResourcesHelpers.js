import { getProjectManifest, getProjectSaveLocation, getSourceBookManifest } from '../selectors';
import { TRANSLATION_NOTES } from '../common/constants';

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
 * gets the data that the tool needs
 * @param {Object} state - current reducers state
 * @return {{resourceId, languageId, latestOlVersion, tsvOLVersion: (*|undefined)}}
 */
export function getOrigLangVersionInfoForTool(state) {
  const origLangBookManifest = getSourceBookManifest(state);
  let languageId, resourceId, latestOlVersion;

  if (origLangBookManifest) {
    languageId = origLangBookManifest.language_id;
    resourceId = origLangBookManifest.resource_id;
    latestOlVersion = origLangBookManifest.dublin_core && origLangBookManifest.dublin_core.version;
  }

  // tn files are generated from a specific version number of the original language resources which are reference as relation
  const { tsv_relation } = getProjectManifest(state);
  // Get version number needed by tn's tsv
  const tsvOLVersion = getTsvOLVersion(tsv_relation, resourceId);
  return {
    languageId, resourceId, latestOlVersion, tsvOLVersion,
  };
}

/**
 * returns true if tool is using the current originalLanguage version
 * @param {object} state
 * @param {String} toolName
 */
export const isToolUsingCurrentOriginalLanguage = (state, toolName) => {
  let isCurrent = false;
  const projectSaveLocation = getProjectSaveLocation(state);

  if (projectSaveLocation) { // only check if project is selected
    if (toolName === TRANSLATION_NOTES) {
      const { latestOlVersion, tsvOLVersion } = getOrigLangVersionInfoForTool(state);
      isCurrent = (latestOlVersion === tsvOLVersion);
    } else if (toolName) { // any other tool always uses current
      isCurrent = true;
    }
  }

  return isCurrent;
};
