// helpers
import { generateTimestamp } from '../helpers/index';
import * as gatewayLanguageHelpers from '../helpers/gatewayLanguageHelpers';
import * as generatePathsUtil from '../common/generatePathsUtil';
import * as invalidatedCheckHelpers from '../helpers/invalidatedCheckHelpers';
import consts from './ActionTypes';

/**
 * @description sets invalidatedReducer to true or false
 * @param {String} userName - The username of who invalidated.
 * @param {String} timestamp
 * @param {Boolean} invalidated - new state for invalidated flag
 * @return {object} action state.
 */
export function set(userName, timestamp, invalidated) {
  return ((dispatch, getState) => {
    const {
      gatewayLanguageCode,
      gatewayLanguageQuote,
    } = gatewayLanguageHelpers.getGatewayLanguageCodeAndQuote(getState());

    dispatch({
      type: consts.SET_INVALIDATED,
      modifiedTimestamp: timestamp,
      gatewayLanguageCode,
      gatewayLanguageQuote,
      userName,
      invalidated,
    });
  });
}

/**
 * @description sets invalidated to true or false in both invalidatedReducer and groupDataReducer
 * @param {String} username - The username of who invalidated.
 * @param {Boolean} invalidated - new state for invalidated flag
 * @return {object} action state.
 */
export const setInvalidated = (username, invalidated) => ((dispatch, getState) => {
  let state = getState();
  let contextId = state.contextIdReducer.contextId;

  dispatch(set(username, generateTimestamp(), invalidated));
  dispatch({
    type: consts.SET_INVALIDATION_IN_GROUPDATA,
    contextId,
    boolean: invalidated,
  });
});

export const getAllInvalidatedChecksForCurrentProject = () => ((dispatch, getState) => {
  const { projectSaveLocation, manifest: { project } } = getState().projectDetailsReducer;
  const bookAbbreviation = project.id;
  const invalidatedFolderPath = generatePathsUtil.getCheckDataFolderPath(projectSaveLocation, bookAbbreviation, 'invalidated');
  const verseEditFolderPath = generatePathsUtil.getCheckDataFolderPath(projectSaveLocation, bookAbbreviation, 'verseEdits');
  const verseEditsTotal = invalidatedCheckHelpers.getTotalOfEditedVerses(verseEditFolderPath);
  const invalidatedChecksTotal = invalidatedCheckHelpers.loadTotalOfInvalidatedChecksForCurrentProject(invalidatedFolderPath);
  const invalidatedAlignmentsTotal = invalidatedCheckHelpers.getTotalInvalidatedAlignments(projectSaveLocation, bookAbbreviation);

  dispatch({
    type: consts.SET_INVALIDATED_CHECKS_TOTAL,
    invalidatedChecksTotal,
  });

  dispatch({
    type: consts.SET_VERSE_EDITS_TOTAL,
    verseEditsTotal,
  });

  dispatch({
    type: consts.SET_INVALIDATED_ALIGNMENTS_TOTAL,
    invalidatedAlignmentsTotal,
  });
});
