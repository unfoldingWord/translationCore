/* eslint-disable no-console */
import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as ProjectInformationCheckHelpers from '../helpers/ProjectInformationCheckHelpers';
import * as UsfmHelpers from '../helpers/usfmHelpers';
// actions
import * as ProjectDetailsActions from './ProjectDetailsActions';
import * as ProjectValidationActions from './ProjectValidationActions';
// constants
const PROJECT_INFORMATION_CHECK_NAMESPACE = 'projectInformationCheck'

/**
 * validates if the project's manifest is missing required details.
 */
export function validate() {
  return ((dispatch, getState) => {
    const { projectSaveLocation } = getState().projectDetailsReducer;
    const projectManifestPath = path.join(projectSaveLocation, 'manifest.json');
    const manifest = fs.readJsonSync(projectManifestPath);
    if (ProjectInformationCheckHelpers.checkBookReference(manifest) || ProjectInformationCheckHelpers.checkLanguageDetails(manifest) || ProjectInformationCheckHelpers.checkCheckers(manifest)) {
      // project failed the project information check.
      dispatch(ProjectValidationActions.addProjectValidationStep(PROJECT_INFORMATION_CHECK_NAMESPACE));
    }
  });
}
/**
 * Saves all the project details from the project information check reducer
 * to the project details reducer under the manifest property.
 */
export function finalize() {
  return ((dispatch, getState) => {
    let { manifest, projectSaveLocation, projectType } = getState().projectDetailsReducer;
    dispatch(ProjectDetailsActions.setProjectBookIdAndBookName());
    dispatch(ProjectDetailsActions.setLanguageDetails());
    dispatch(ProjectDetailsActions.updateContributors());
    dispatch(ProjectDetailsActions.updateCheckers());
    dispatch(clearProjectInformationReducer());
    if (projectType === 'usfm') {
      //Need to update the folder naming convention if the project was usfm
      //because new data may have been supplied that enables tC to create a relevant folder name
      let destinationPath = UsfmHelpers.updateUSFMFolderName(manifest, projectSaveLocation);
      dispatch(ProjectDetailsActions.setSaveLocation(destinationPath));
    }
    dispatch(ProjectValidationActions.removeProjectValidationStep(PROJECT_INFORMATION_CHECK_NAMESPACE));
    dispatch(ProjectValidationActions.updateStepperIndex());
  })
}

/**
 * Sets the book id and book name in the project information check reducer.
 * @param {String} bookId - book abbreviation.
 */
export function setBookIDInProjectInformationReducer(bookId) {
  return ((dispatch) => {
    dispatch({
      type: consts.SET_BOOK_ID_IN_PROJECT_INFORMATION_REDUCER,
      bookId
    });
    dispatch(toggleProjectInformationCheckSaveButton());
  });
}

/**
 * Sets the language Id in the project information check reducer.
 * @param {String} languageId - language id e.g. en (english), es (spanish).
 */
export function setLanguageIdInProjectInformationReducer(languageId) {
  return ((dispatch) => {
    dispatch({
      type: consts.SET_LANGUAGE_ID_IN_PROJECT_INFORMATION_REDUCER,
      languageId
    });
    dispatch(toggleProjectInformationCheckSaveButton());
  });
}

/**
 * Sets the language name in the project information check reducer.
 * @param {String} languageName - language name e.g. english, spanish.
 */
export function setLanguageNameInProjectInformationReducer(languageName) {
  return ((dispatch) => {
    dispatch({
      type: consts.SET_LANGUAGE_NAME_IN_PROJECT_INFORMATION_REDUCER,
      languageName
    });
    dispatch(toggleProjectInformationCheckSaveButton());
  });
}

/**
 * Sets the language direction in the project information check reducer.
 * @param {String} languageDirection - language direction
 * e.g. ltr (left to right) or rtl (right to left)
 */
export function setLanguageDirectionInProjectInformationReducer(languageDirection) {
  return ((dispatch) => {
    dispatch({
      type: consts.SET_LANGUAGE_DIRECTION_IN_PROJECT_INFORMATION_REDUCER,
      languageDirection
    });
    dispatch(toggleProjectInformationCheckSaveButton());
  });
}

/**
 * Sets the list of contributors in the project information check reducer.
 * @param {array} contributors - array of contributor names.
 */
export function setContributorsInProjectInformationReducer(contributors) {
  return ((dispatch) => {
    dispatch({
      type: consts.SET_CONTRIBUTORS_IN_PROJECT_INFORMATION_REDUCER,
      contributors
    });
    dispatch(toggleProjectInformationCheckSaveButton());
  });
}

/**
 * Sets the list of checkers in the project information check reducer.
 * @param {array} checkers - array of checker names.
 */
export function setCheckersInProjectInformationReducer(checkers) {
  return ((dispatch) => {
    dispatch({
      type: consts.SET_CHECKERS_IN_PROJECT_INFORMATION_REDUCER,
      checkers
    });
    dispatch(toggleProjectInformationCheckSaveButton());
  });
}

/**
 * enables or disables the next button in the project information check
 * based on all required fields being completed.
 */
export function toggleProjectInformationCheckSaveButton() {
  return ((dispatch, getState) => {
    if (ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(getState())) {
      dispatch(ProjectValidationActions.toggleNextButton(false));
    } else {
      dispatch(ProjectValidationActions.toggleNextButton(true));
    }
  });
}

/**
 * Updates a checker string name in the checkers array.
 * @param {String} newCheckerName - new name for the checker name.
 * @param {Number} selectedIndex - index of checker name text to be updated.
 */
export function updateCheckerName(newCheckerName, selectedIndex) {
  return ((dispatch, getState) => {
    const { checkers } = getState().projectInformationCheckReducer;

    let newCheckersArray = checkers.map((checkerName, index) => {
      if (selectedIndex === index) {
        return newCheckerName;
      } else {
        return checkerName;
      }
    });

    dispatch(setCheckersInProjectInformationReducer(newCheckersArray));
  });
}

/**
 * Updates a contributor string name in the checkers array.
 * @param {String} newContributorName - new name for the contributor name.
 * @param {Number} selectedIndex - index of contributor name text to be updated.
 */
export function updateContributorName(newContributorName, selectedIndex) {
  return ((dispatch, getState) => {
    const { contributors } = getState().projectInformationCheckReducer;

    let newContributorsArray = contributors.map((contributorName, index) => {
      if (selectedIndex === index) {
        return newContributorName;
      } else {
        return contributorName;
      }
    });

    dispatch(setContributorsInProjectInformationReducer(newContributorsArray));
  });
}

/**
 * Resets / clears the project information check reducer
 */
export function clearProjectInformationReducer() {
  return ((dispatch) => {
    dispatch({ type: consts.CLEAR_PROJECT_INFORMATION_REDUCER });
  });
}