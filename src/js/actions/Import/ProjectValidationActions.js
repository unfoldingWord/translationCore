import React from 'react';
import consts from '../ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
//actions
import * as BodyUIActions from '../BodyUIActions';
import * as ProjectLoadingActions from '../MyProjects/ProjectLoadingActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as AlertModalActions from '../AlertModalActions';
import * as ProjectDetailsActions from '../ProjectDetailsActions';
// helpers
import * as manifestValidationHelpers from '../../helpers/ProjectValidation/ManifestValidationHelpers';
import * as projectStructureValidatoinHelpers from '../../helpers/ProjectValidation/ProjectStructureValidationHelpers';
import * as manifestHelpers from '../../helpers/manifestHelpers';
// constants
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(path.homedir(), 'translationCore', 'projects');

/**
 * @description Action that call helpers to handle business
 * logic for validations
 * @param {String} projectPath - Full path to the project root folder
 * @param {String | Null} projectLink - Link from the online project
 */
export const validate = (projectPath, projectLink) => {
  return (async (dispatch, getState) => {
    dispatch(AlertModalActions.closeAlertDialog());
    await manifestValidationHelpers.manifestExists(projectPath);
    await projectStructureValidatoinHelpers.verifyProjectType(projectPath);
    await projectStructureValidatoinHelpers.detectInvalidProjectStructure(projectPath);
    await setUpProjectDetails(projectPath, projectLink, dispatch);
    await projectStructureValidatoinHelpers.verifyValidBetaProject(getState());
    await promptMissingDetails(dispatch, projectPath);
  });
};

/**
 *
 * @param {String} projectPath - Full path to the project root folder
 * @param {String | Null} projectLink - Link from the online project
 * @param {function} dispatch - Redux dispatcher
 * @returns {<new Promise>}
 */
export const setUpProjectDetails = (projectPath, projectLink, dispatch) => {
  return new Promise((resolve) => {
    dispatch(ProjectLoadingActions.clearLastProject());
    dispatch(BodyUIActions.resetStepLabels(2));
    dispatch(BodyUIActions.updateStepLabel(2, path.parse(projectPath).base));
    let manifest = manifestHelpers.getProjectManifest(projectPath, projectLink);
    dispatch(ProjectLoadingActions.loadProjectDetails(projectPath, manifest));
    resolve();
  });
};

/**
 * @description - Wrapper from asynchronously handling user input from the
 * project import stepper
 * @param {function} dispatch - Redux dispatcher
 * @returns {<new Promise>}
 */
export const promptMissingDetails = (dispatch, projectPath) => {
  return new Promise((resolve) => {
    // running this action here in case it isnt run by projectInformationStepperActions when project is valid
    dispatch(updateProjectFolderToNameSpecification(projectPath));
    dispatch(ProjectImportStepperActions.validateProject(resolve));
  });
};

/**
 * @description Updates the project folder name to follow
 * project naming specifications
 * @param {String} projectPath - path to project.
 */
export const updateProjectFolderToNameSpecification = (projectPath) => {
  return((dispatch, getState) => {
    const { manifest } = getState().projectDetailsReducer;
    const { selectedProjectFilename } = getState().localImportReducer;
    let newFilename = `${manifest.target_language.id}_${manifest.project.id}`;
    newFilename = manifest.resource && manifest.resource.id ? newFilename + `_${manifest.resource.id}` : newFilename;
    const oldProjectNamePath = projectPath && projectPath.includes('projects') ? projectPath : path.join(IMPORTS_PATH, selectedProjectFilename);
    const newProjectNamePath = path.join(projectPath && projectPath.includes('projects') ? PROJECTS_PATH : IMPORTS_PATH, newFilename);

    if (oldProjectNamePath.toLowerCase() !== newProjectNamePath.toLowerCase()) {
      // Avoid duplicate project
      if (fs.existsSync(newProjectNamePath)) {
        dispatch(AlertModalActions.openAlertDialog(
          <div>
            The project you selected ({newProjectNamePath}) already exists.<br />
            Reimporting existing projects is not currently supported.
          </div>
        ));
      } else {
        fs.renameSync(oldProjectNamePath, newProjectNamePath);
        dispatch(ProjectDetailsActions.setSaveLocation(newProjectNamePath));
        dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename: newFilename });
      }
    }
  });
};
