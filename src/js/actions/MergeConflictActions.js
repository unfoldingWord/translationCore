import consts from './ActionTypes';
import path from 'Path-extra';

import * as ProjectValidationActions from '../actions/ProjectValidationActions';
import * as MergeConflictHelpers from '../helpers/MergeConflictHelpers';
import * as ProjectSelectionHelpers from '../helpers/ProjectSelectionHelpers';
import * as TargetLanguageActions from '../actions/TargetLanguageActions';
import * as USFMHelpers from '../helpers/usfmHelpers';
const MERGE_CONFLICT_NAMESPACE = "mergeConflictCheck";
/**
 * Wrapper action for handling merge conflict detection, and 
 * storing result in reducer. Returns false under step namespace
 * 'mergeConflictCheck' if check is passed
 */
export function validate() {
  return ((dispatch, getState) => {
    let state = getState();
    const { projectSaveLocation, manifest } = state.projectDetailsReducer;
    /**
     * Object that will be sent back to reducers with the chapter, 
     * verse and text info  of each merge conflict version.
     * An array of arrays of an object.
     * */
    let parsedAllMergeConflictsFoundArray = [];
    let usfmFilePath = USFMHelpers.isUSFMProject(projectSaveLocation) ||
      path.join(projectSaveLocation, manifest.project.id + '.usfm');

    /**@type {string} */
    let usfmData = MergeConflictHelpers.checkProjectForMergeConflicts(usfmFilePath, projectSaveLocation);
    if (!usfmData) {
      return dispatch({
        type: consts.MERGE_CONFLICTS_CHECK
      })
    }
    /**
     * @example ["1 this is the first version", "1 This is the second version"]
     * @type {[string]}
     * extracting merge conflicts from usfm data
    */
    let allMergeConflictsFoundArray = MergeConflictHelpers.getMergeConflicts(usfmData);
    for (let matchIndex in allMergeConflictsFoundArray) {
      /** Array representing the different versions for a merge conflict parsed into a more consumable format */
      let parsedMergeConflictVersionsArray = [];
      /** Array representing current versions to be parsed*/
      let mergeConflictVersionsArray = [];
      /**
       * Getting the first to matched elements from all merge conflicts array
       * These elements are paired because they represent one 'merge conflict'
       * They are the two different version histories of the conflict
       */
      mergeConflictVersionsArray.push(allMergeConflictsFoundArray.shift());
      mergeConflictVersionsArray.push(allMergeConflictsFoundArray.shift());
      for (var versionText of mergeConflictVersionsArray) {
        /**
         * Parsing the merge conflict version text in an object more easily
         * consumable for the displaying container
         * @type {{chapter,verses,text}}
         */
        let parsedMergeConflictVersionObject = MergeConflictHelpers.parseMergeConflictVersion(versionText, usfmData);
        parsedMergeConflictVersionsArray.push(parsedMergeConflictVersionObject);
      }
      parsedAllMergeConflictsFoundArray.push(parsedMergeConflictVersionsArray)
    }
    dispatch({
      type: consts.MERGE_CONFLICTS_CHECK,
      conflicts: parsedAllMergeConflictsFoundArray,
      filePath: usfmFilePath
    });
    dispatch(ProjectValidationActions.addProjectValidationStep(MERGE_CONFLICT_NAMESPACE));
  });
}

export function updateVersionSelection(mergeConflictIndex, versionIndex, value) {
  return ((dispatch, getState) => {
    let otherVersionIndex = Number(! + versionIndex);
    const oldMergeConflictCheckObject = getState().mergeConflictReducer;
    let newMergeConflictCheckObject = JSON.parse(JSON.stringify(oldMergeConflictCheckObject));
    newMergeConflictCheckObject.conflicts[mergeConflictIndex][versionIndex].checked = value;
    newMergeConflictCheckObject.conflicts[mergeConflictIndex][otherVersionIndex].checked = !value;
    dispatch({
      type: consts.MERGE_CONFLICTS_CHECK,
      ...newMergeConflictCheckObject
    });
    return dispatch(updateMergeConflictNextButton());
  })
}

export function updateMergeConflictNextButton() {
  return ((dispatch, getState) => {
    let mergeConflictCheckObject = getState().mergeConflictReducer;
    let allMergeConflictsHandled = true;
    for (var conflict of mergeConflictCheckObject.conflicts) {
      let mergeHistorySelected = false
      for (var version of conflict) {
        //if current check is selected or the previous one was
        mergeHistorySelected = version.checked || mergeHistorySelected;
      }
      //All merge conflicts have been handled previously and for the current conflict
      allMergeConflictsHandled = allMergeConflictsHandled && mergeHistorySelected;
    }
    return dispatch(ProjectValidationActions.toggleNextButton(!allMergeConflictsHandled));
  });
}

export function finalize() {
  return ((dispatch, getState) => {
    let { projectSaveLocation, manifest } = getState().projectDetailsReducer;
    const mergeConflictsObject = getState().mergeConflictReducer;
    MergeConflictHelpers.merge(mergeConflictsObject, projectSaveLocation, manifest);
    let usfmProjectObject = USFMHelpers.getProjectDetailsFromUSFM(mergeConflictsObject.filePath, projectSaveLocation);
    TargetLanguageActions.generateTargetBible(projectSaveLocation, usfmProjectObject.parsedUSFM, manifest);
    dispatch(ProjectValidationActions.removeProjectValidationStep(MERGE_CONFLICT_NAMESPACE));
    return dispatch(ProjectValidationActions.goToNextProjectValidationStep());
  });
}