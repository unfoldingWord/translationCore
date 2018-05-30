import React from 'react';
import consts from '../ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
//actions
import * as ProjectLoadingActions from '../MyProjects/ProjectLoadingActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as AlertModalActions from '../AlertModalActions';
import * as ProjectDetailsActions from '../ProjectDetailsActions';
// helpers
import * as manifestValidationHelpers from '../../helpers/ProjectValidation/ManifestValidationHelpers';
import * as projectStructureValidatoinHelpers from '../../helpers/ProjectValidation/ProjectStructureValidationHelpers';
import * as manifestHelpers from '../../helpers/manifestHelpers';
import { getTranslate } from '../../selectors';
// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

/**
 * @description Action that call helpers to handle business
 * logic for validations
 * @param {String} projectPath - Full path to the project root folder
 */
export const validate = (projectPath) => {
  return ((dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      try {
        dispatch(AlertModalActions.closeAlertDialog());
        await manifestValidationHelpers.manifestExists(projectPath);
        await projectStructureValidatoinHelpers.verifyProjectType(projectPath);
        await projectStructureValidatoinHelpers.detectInvalidProjectStructure(projectPath);
        await setUpProjectDetails(projectPath, dispatch);
        await projectStructureValidatoinHelpers.verifyValidBetaProject(getState());
        await promptMissingDetails(dispatch, projectPath);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

/**
 *
 * @param {String} projectPath - Full path to the project root folder
 * @param {function} dispatch - Redux dispatcher
 * @returns {Promise}
 */
export const setUpProjectDetails = (projectPath, dispatch) => {
  return new Promise((resolve) => {
    dispatch(ProjectLoadingActions.clearLastProject());
    let manifest = manifestHelpers.getProjectManifest(projectPath);
    dispatch(ProjectLoadingActions.loadProjectDetails(projectPath, manifest));
    resolve();
  });
};

/**
 * @description - Wrapper from asynchronously handling user input from the
 * project import stepper
 * @param {function} dispatch - Redux dispatcher
 * @returns {Promise}
 */
export const promptMissingDetails = (dispatch, projectPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Running this action here because if the project is valid it
      // wont get call in the projectInformationStepperActions.
      await dispatch(updateProjectFolderToNameSpecification(projectPath));
      dispatch(ProjectImportStepperActions.validateProject(resolve));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @description Updates the project folder name to follow
 * project naming specifications
 * @param {String} projectPath - path to project.
 */
export const updateProjectFolderToNameSpecification = (projectPath) => {
  return((dispatch, getState) => {
    const translate = getTranslate(getState());
    return new Promise((resolve, reject) => {
      const { manifest } = getState().projectDetailsReducer;
      const { selectedProjectFilename } = getState().localImportReducer;
      let newFilename = `${manifest.target_language.id}_${manifest.project.id}`;
      newFilename = manifest.resource && manifest.resource.id ? newFilename + `_${manifest.resource.id}` : newFilename;
      const oldProjectNamePath = projectPath && projectPath.includes(path.join('translationCore', 'projects')) ?
        projectPath : path.join(IMPORTS_PATH, selectedProjectFilename);
      const newProjectNamePath = path.join(projectPath && projectPath.includes(path.join('translationCore', 'projects')) ?
        PROJECTS_PATH : IMPORTS_PATH, newFilename);

      if (oldProjectNamePath.toLowerCase() !== newProjectNamePath.toLowerCase()) {
        fs.renameSync(oldProjectNamePath, newProjectNamePath);
        dispatch(ProjectDetailsActions.setSaveLocation(newProjectNamePath));
        dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename: newFilename });
        dispatch({ type: consts.OLD_SELECTED_PROJECT_FILENAME, oldSelectedProjectFileName:selectedProjectFilename });
      }
      resolve();
    });
  });
};
