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
import * as ProjectDetailsHelpers from '../../helpers/ProjectDetailsHelpers';
import {
  doesProjectNameMatchSpec,
  openOnlyProjectDetailsScreen,
  toggleProjectInformationCheckSaveButton
} from "../ProjectInformationCheckActions";
import * as ProjectInformationCheckActions from "../ProjectInformationCheckActions";
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
        await dispatch(promptMissingDetails(projectPath));
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
 * @param {String} projectPath
 */
export const promptMissingDetails = (projectPath) => {
  return((dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      try {
        dispatch(ProjectImportStepperActions.validateProject(resolve));
        const manifest = manifestHelpers.getProjectManifest(projectPath);
        const programNameMatchesSpec = doesProjectNameMatchSpec(projectPath, manifest);
        if (ProjectImportStepperActions.stepperActionCount(getState()) === 0) { // if not in stepper
          if (!programNameMatchesSpec) {
            dispatch(openOnlyProjectDetailsScreen(projectPath, true));
          }
        } else {
          if(!programNameMatchesSpec) {
            dispatch(toggleProjectInformationCheckSaveButton());
          }
        }
      } catch (error) {
        reject(error);
      }
    });
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
      const newFilename = ProjectDetailsHelpers.generateNewProjectName(manifest);
      const oldProjectNamePath = projectPath && projectPath.includes(path.join('translationCore', 'projects')) ?
        projectPath : path.join(IMPORTS_PATH, selectedProjectFilename);
      const newProjectNamePath = path.join(projectPath && projectPath.includes(path.join('translationCore', 'projects')) ?
        PROJECTS_PATH : IMPORTS_PATH, newFilename);

      if (oldProjectNamePath.toLowerCase() !== newProjectNamePath.toLowerCase()) {
        // Avoid duplicate project
        if (fs.existsSync(newProjectNamePath)) {
          // The project you selected ({newProjectNamePath}) already exists.<br />
          const { alreadyImported } = getState().projectInformationCheckReducer;
          if (!alreadyImported) {
            reject(
              <div>
                {translate('projects.project_exists', {project_path: newProjectNamePath})} <br/>
                {translate('projects.reimporting_not_supported')}
              </div>
            );
          }
        } else {
          fs.renameSync(oldProjectNamePath, newProjectNamePath);
          dispatch(ProjectDetailsActions.setSaveLocation(newProjectNamePath));
          dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename: newFilename });
          dispatch({ type: consts.OLD_SELECTED_PROJECT_FILENAME, oldSelectedProjectFileName:selectedProjectFilename });
        }
      }
      resolve();
    });
  });
};

/**
 * enable/disable the overwrite on button
 * @param enable
 * @return {Function}
 */
export function showOverWriteButton(enable) {
  return ((dispatch) => {
    dispatch({ type: consts.SHOW_OVERWRITE_BUTTON, value: enable });
  });
}

/**
 * initializes project validation and project checking reducers for import or validation.
 * @param {boolean} localProject - true if opening a local project (versus importing)
 * @param {boolean} usfmProject - true if usfm project
 * @return {Function}
 */
export const initializeReducersForProjectValidation = (localProject, usfmProject=false) => {
  return (dispatch) => {
    dispatch({ type: consts.RESET_PROJECT_VALIDATION_REDUCER });
    dispatch({ type: consts.CLEAR_PROJECT_INFORMATION_REDUCER });
    dispatch(ProjectInformationCheckActions.setAlreadyImportedInProjectInformationCheckReducer(localProject));
    dispatch(ProjectInformationCheckActions.setUsfmProjectInProjectInformationCheckReducer(usfmProject));
    dispatch(ProjectInformationCheckActions.upfdateOverwritePermittedInProjectInformationCheckReducer());
    dispatch(toggleProjectInformationCheckSaveButton());
  };
};
