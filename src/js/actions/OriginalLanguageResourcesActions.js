// actions
// selectors
import { getProjectBookId } from '../selectors';
// helpers
import { getOrigLangVersionInfoForTool } from '../helpers/originalLanguageResourcesHelpers';
import { TRANSLATION_NOTES } from '../common/constants';
import { loadBibleBook } from './ResourcesActions';

/**
 * Loads the latest or an older version of the original
 * language resource based on the tool & project combo.
 * @param {object} toolName
 */
export const loadOlderOriginalLanguageResource = (toolName) => (dispatch, getData) => {
  const {
    languageId, resourceId, latestOlVersion, tsvOLVersion,
  } = getOrigLangVersionInfoForTool(getData());
  const bookId = getProjectBookId(getData());

  // if version of current original language resource if not the one needed by the tn groupdata
  if (tsvOLVersion && (tsvOLVersion !== latestOlVersion) && toolName === TRANSLATION_NOTES) {
    // load original language resource that matches version number for tn groupdata
    console.log(`translationNotes requires original lang ${tsvOLVersion}`);
    dispatch(loadBibleBook(resourceId, bookId, languageId, 'v' + tsvOLVersion));
  } else {
    // load latest version of original language resource
    dispatch(loadBibleBook(resourceId, bookId, languageId));
  }
};
