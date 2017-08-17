/* eslint-disable no-console */
import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as ProjectInformationCheckHelpers from '../helpers/ProjectInformationCheckHelpers';
// actions
import * as ProjectDetailsActions from './projectDetailsActions';

export function validate() {
  return ((dispatch, getState) => {
    const { projectSaveLocation } = getState().projectDetailsReducer;
    const projectManifestPath = path.join(projectSaveLocation, 'manifest.json');
    const manifest = fs.readJsonSync(projectManifestPath);
    if (ProjectInformationCheckHelpers.checkBookReference(manifest) || ProjectInformationCheckHelpers.checkLanguageDetails(manifest) || ProjectInformationCheckHelpers.checkTranslators(manifest) || ProjectInformationCheckHelpers.checkCheckers(manifest)) {
      // dispatch({
      //   ACTIONS TO MAKE THIS CHECK FAIL 
      // })
    }
  });
}

export function finalize() {
  return ((dispatch) => {
    dispatch(ProjectDetailsActions.setProjectBookIdAndBookName());
    dispatch(ProjectDetailsActions.setLanguageDetails());
    dispatch(ProjectDetailsActions.updateTranslators());
    dispatch(ProjectDetailsActions.updateCheckers());
    dispatch(clearProjectInformationReducer());
  })
}

export function setBookIDInProjectInformationReducer(bookId) {
  return {
    type: consts.SET_BOOK_ID_IN_PROJECT_INFORMATION_REDUCER,
    bookId
  }
}

export function setLanguageIdInProjectInformationReducer(languageId) {
  return {
    type: consts.SET_LANGUAGE_ID_IN_PROJECT_INFORMATION_REDUCER,
    languageId
  }
}

export function setLanguageNameInProjectInformationReducer(languageName) {
  return {
    type: consts.SET_LANGUAGE_NAME_IN_PROJECT_INFORMATION_REDUCER,
    languageName
  }
}

export function setLanguageDirectionInProjectInformationReducer(languageDirection) {
  return {
    type: consts.SET_LANGUAGE_DIRECTION_IN_PROJECT_INFORMATION_REDUCER,
    languageDirection
  }
}

export function setContributorsInProjectInformationReducer(contributors) {
  return {
    type: consts.SET_CONTRIBUTORS_IN_PROJECT_INFORMATION_REDUCER,
    contributors
  }
}

export function setCheckersInProjectInformationReducer(checkers) {
  return {
    type: consts.SET_CHECKERS_IN_PROJECT_INFORMATION_REDUCER,
    checkers
  }
}

export function clearProjectInformationReducer() {
  return {
    type: consts.CLEAR_PROJECT_INFORMATION_REDUCER
  }
}
