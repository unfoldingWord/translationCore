// actions
// selectors
import {
  getSourceBookManifest, getProjectBookId, getProjectManifest,
} from '../selectors';
// helpers
import { getTsvOLVersion } from '../helpers/originalLanguageResourcesHelpers';
import { TRANSLATION_NOTES } from '../common/constants';
import { loadBibleBook } from './ResourcesActions';

/**
 * Loads the latest or an older version of the original
 * language resource based on the tool & project combo.
 * @param {object} toolName
 */
export const loadOlderOriginalLanguageResource = (toolName) => (dispatch, getData) => {
  const originalLanguageBookManifest = getSourceBookManifest(getData());
  const {
    language_id: languageId,
    resource_id: resourceId,
    dublin_core: { version },
  } = originalLanguageBookManifest || {};
  // tn files are generated from a specific version number of the original languade resources which are reference as relation
  const { tsv_relation } = getProjectManifest(getData());
  // Get version number needed by tn's tsv
  const tsvOLVersion = getTsvOLVersion(tsv_relation, resourceId);
  const bookId = getProjectBookId(getData());

  // if version of current original language resource if not the one needed by the tn groupdata
  if (tsvOLVersion && (tsvOLVersion !== version) && toolName === TRANSLATION_NOTES) {
    // load original language resource that matches version number for tn groupdata
    dispatch(loadBibleBook(resourceId, bookId, languageId, 'v' + tsvOLVersion));
  } else {
    // load latest version of original language resource
    dispatch(loadBibleBook(resourceId, bookId, languageId));
  }
};
