import consts from './ActionTypes';
import path from 'path-extra';
// helpers
import * as ProjectDetailsHelpers from '../helpers/ProjectDetailsHelpers';
// constants
const INDEX_FOLDER_PATH = path.join('.apps', 'translationCore', 'index');

/**
 * @description sets the project save location in the projectDetailReducer.
 * @param {string} pathLocation - project save location and/or directory.
 * @return {object} action object.
 */
export const setSaveLocation = pathLocation => {
  return {
    type: consts.SET_SAVE_PATH_LOCATION,
    pathLocation
  };
};

export const resetProjectDetail = () => {
  return {
    type: consts.RESET_PROJECT_DETAIL
  };
};

export function getProjectProgressForTools(toolName) {
  return ((dispatch, getState) => {
    const {
      projectDetailsReducer: {
        projectSaveLocation,
        manifest
      }
    } = getState();

    const bookId = manifest.project.id;
    const pathToCheckDataFiles = path.join(projectSaveLocation, INDEX_FOLDER_PATH, toolName, bookId);
    const progress = ProjectDetailsHelpers.getToolProgress(pathToCheckDataFiles);

    dispatch({
      type: consts.SET_PROJECT_PROGRESS_FOR_TOOL,
      toolName,
      progress
    });
  });
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
