import consts from './ActionTypes';
import path from 'path-extra';
import fs from 'fs-extra';
import * as bibleHelpers from '../helpers/bibleHelpers';
import * as ProjectDetailsHelpers from '../helpers/ProjectDetailsHelpers';
import {generateNewProjectName} from "./Import/ProjectValidationActions";
// constants
const INDEX_FOLDER_PATH = path.join('.apps', 'translationCore', 'index');

/**
 * @description sets the project save location in the projectDetailReducer.
 * @param {String} pathLocation - project save location and/or directory.
 * @return {object} action object.
 */
export const setSaveLocation = pathLocation => {
  return((dispatch) => {
    dispatch({
      type: consts.SET_SAVE_PATH_LOCATION,
      pathLocation
    });
  });
};

export const resetProjectDetail = () => {
  return {
    type: consts.RESET_PROJECT_DETAIL
  };
};

export function setProjectToolGL(toolName, selectedGL) {
  return (dispatch) => {
    if(typeof toolName !== 'string') {
      return Promise.reject(`Expected "toolName" to be a string but received ${typeof toolName} instead`);
    }
    dispatch({
      type: consts.SET_GL_FOR_TOOL,
      toolName,
      selectedGL
    });
  };
}

export function getProjectProgressForTools(toolName) {
  return (dispatch, getState) => {
    const {
      projectDetailsReducer: {
        projectSaveLocation,
        manifest
      }
    } = getState();
    const bookId = manifest.project.id;
    let progress = 0;
    if(typeof toolName !== 'string') {
      return Promise.reject(`Expected "toolName" to be a string but received ${typeof toolName} instead`);
    }
    const pathToCheckDataFiles = path.join(projectSaveLocation, INDEX_FOLDER_PATH, toolName, bookId);
    if (toolName === 'wordAlignment') {
      const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
      progress = ProjectDetailsHelpers.getWordAlignmentProgress(pathToWordAlignmentData, bookId);
    } else {
      progress = ProjectDetailsHelpers.getToolProgress(pathToCheckDataFiles);
    }

    dispatch({
      type: consts.SET_PROJECT_PROGRESS_FOR_TOOL,
      toolName,
      progress
    });
  };
}

/**
 * @description Sends project manifest to the store
 * @param {object} manifest - manifest file of a project.
 * @return {object} action object.
 */
export function setProjectManifest(manifest) {
  return {
    type: consts.STORE_MANIFEST,
    manifest: manifest
  };
}

/**
 * @description adds a new key name to the manifest object
 * @param {String} propertyName - key string name.
 * ex.
 * manifest {
 *  ...,
 *  [propertyName]: 'value',
 *  ...
 * }
 * @param {*} value - value to be saved in the propertyName
 */
export function addObjectPropertyToManifest(propertyName, value) {
  return {
    type: consts.ADD_MANIFEST_PROPERTY,
    propertyName,
    value
  };
}

export function setProjectBookIdAndBookName() {
  return ((dispatch, getState) => {
    const { bookId } = getState().projectInformationCheckReducer;
    const bookName = bibleHelpers.convertToFullBookName(bookId);
    dispatch({
      type: consts.SAVE_BOOK_ID_AND_BOOK_NAME_IN_MANIFEST,
      bookId,
      bookName
    });
  });
}

export function setProjectResourceId() {
  return ((dispatch, getState) => {
    const { resourceId } = getState().projectInformationCheckReducer;
    dispatch({
      type: consts.SAVE_RESOURCE_ID_IN_MANIFEST,
      resourceId
    });
  });
}

export function setProjectNickname() {
  return ((dispatch, getState) => {
    const { nickname } = getState().projectInformationCheckReducer;
    dispatch({
      type: consts.SAVE_NICKNAME_IN_MANIFEST,
      nickname
    });
  });
}

export function setLanguageDetails() {
  return ((dispatch, getState) => {
    const { languageDirection, languageId, languageName } = getState().projectInformationCheckReducer;
    dispatch({
      type: consts.SAVE_LANGUAGE_DETAILS_IN_MANIFEST,
      languageDirection,
      languageId,
      languageName
    });
  });
}

export function updateContributors() {
  return ((dispatch, getState) => {
    const { contributors } = getState().projectInformationCheckReducer;
    dispatch({
      type: consts.SAVE_TRANSLATORS_LIST_IN_MANIFEST,
      translators: contributors
    });
  });
}

export function updateCheckers() {
  return ((dispatch, getState) => {
    const { checkers } = getState().projectInformationCheckReducer;
    dispatch({
      type: consts.SAVE_CHECKERS_LIST_IN_MANIFEST,
      checkers
    });
  });
}

/**
 * returns true if project name needs to be updated to match spec
 * @param {Object} manifest
 * @param {String} projectSaveLocation
 */
export function shouldProjectNameBeUpdated(manifest, projectSaveLocation) {
  if (projectSaveLocation) {
    const newFilename = generateNewProjectName(manifest);
    const currentProjectName = path.basename(projectSaveLocation);
    return currentProjectName !== newFilename;
  }
  return false;
}

/**
 * if project name needs to be updated to match spec, then project is renamed
 */
export function updateProjectNameIfNecessary() {
  return ((dispatch, getState) => {
    const {
      projectDetailsReducer: {manifest, projectSaveLocation}
    } = getState();
    if (shouldProjectNameBeUpdated(manifest, projectSaveLocation)) {
      const projectPath = path.dirname(projectSaveLocation);
      const newFilename = generateNewProjectName(manifest);
      const currentProjectName = path.basename(projectSaveLocation);
      const newProjectPath = path.join(projectPath, newFilename);
      if (!fs.existsSync(newProjectPath)) {
        ProjectDetailsHelpers.updateProjectTargetLanguageBookFolderName(newFilename, projectPath, currentProjectName);
        dispatch(setSaveLocation(newProjectPath));
      }
    }
  });
}

export function updateProjectTargetLanguageBookFolderName() {
  return ((dispatch, getState) => {
    const {
      projectInformationCheckReducer: { bookId },
      projectDetailsReducer: { projectSaveLocation },
      localImportReducer: { oldSelectedProjectFileName }
    } = getState();
    if (!oldSelectedProjectFileName) {
      console.log("no old selected project File Name");
    } else {
      ProjectDetailsHelpers.updateProjectTargetLanguageBookFolderName(bookId, projectSaveLocation, oldSelectedProjectFileName);
    }
  });
}
