// actions
// selectors
import { getProjectBookId } from '../selectors';
// helpers
import {
  getCurrentOrigLangVersionForTn,
  getLatestResourcesForTn,
  getOrigLangVersionInfoForTn,
} from '../helpers/originalLanguageResourcesHelpers';
import { TRANSLATION_NOTES } from '../common/constants';
import { loadBibleBook } from './ResourcesActions';
import { addObjectPropertyToManifest } from './ProjectDetailsActions';

/**
 * Loads the latest or an older version of the original based on tool requirements
 * language resource based on the tool & project combo.
 * @param {string} toolName
 */
export const loadOlderOriginalLanguageResource = (toolName) => (dispatch, getData) => {
  const {
    origLangId, origLangBibleId, latestOlVersion, tsvOLVersion,
  } = getOrigLangVersionInfoForTn(getData());
  const bookId = getProjectBookId(getData());

  // if version of current original language resource if not the one needed by the tn groupdata
  if (tsvOLVersion && (tsvOLVersion !== latestOlVersion) && toolName === TRANSLATION_NOTES) {
    // load original language resource that matches version number for tn groupdata
    console.log(`translationNotes requires original lang ${tsvOLVersion}`);
    dispatch(loadBibleBook(origLangBibleId, bookId, origLangId, 'v' + tsvOLVersion));
  } else {
    // load latest version of original language resource
    dispatch(loadBibleBook(origLangBibleId, bookId, origLangId));
  }
};

/**
 * make sure project manifest is updated for latest tN helps
 */
export const updateProjectResourcesForTn = () => (dispatch, getState) => {
  const state = getState();
  const { origLangVersion, tsv_relation } = getLatestResourcesForTn(state);
  const tsvOLVersion = getCurrentOrigLangVersionForTn(state);

  if (origLangVersion && tsvOLVersion && tsv_relation && (origLangVersion !== tsvOLVersion)) {
    // update project manifest with latest relation
    dispatch(addObjectPropertyToManifest('tsv_relation', tsv_relation));
  }
};

/**
 * Make resources loaded in reducer match the latest for tool
 * @param {string} toolName
 */
export const updateResourcesForOpenTool = (toolName) => (dispatch) => {
  dispatch(updateProjectResourcesForTn());

  // Load version of OL resource needed by tool
  dispatch(loadOlderOriginalLanguageResource(toolName));
};
