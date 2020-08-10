/* eslint-disable no-async-promise-executor */
/* eslint-disable require-await */
import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
import consts from '../ActionTypes';
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
import * as ProjectSettingsHelpers from '../../helpers/ProjectSettingsHelpers';
import {
  doesProjectNameMatchSpec,
  openOnlyProjectDetailsScreen,
  toggleProjectInformationCheckSaveButton,
  setAlreadyImportedInProjectInformationCheckReducer,
  setLocalImportInProjectInformationCheckReducer,
  setUsfmProjectInProjectInformationCheckReducer,
  upfdateOverwritePermittedInProjectInformationCheckReducer,
} from '../ProjectInformationCheckActions';
// constants
import { PROJECTS_PATH, IMPORTS_PATH } from '../../common/constants';

/**
 * Action that call helpers to handle business
 * logic for validations
 * @param {String} projectPath - Full path to the project root folder
 * @param {null|Function} promptCallback - optional callback for feedback if user was prompted
 */
export const validateProject = (projectPath, promptCallback = null) => async (dispatch, getState) => {
  dispatch(AlertModalActions.closeAlertDialog());
  await manifestValidationHelpers.manifestExists(projectPath);
  await projectStructureValidatoinHelpers.verifyProjectType(projectPath);
  await projectStructureValidatoinHelpers.detectInvalidProjectStructure(projectPath);
  await setUpProjectDetails(projectPath, dispatch);
  await projectStructureValidatoinHelpers.verifyValidBetaProject(getState());
  await dispatch(promptMissingDetails(projectPath, promptCallback));
};

/**
 *
 * @param {String} projectPath - Full path to the project root folder
 * @param {function} dispatch - Redux dispatcher
 * @returns {Promise}
 */
export const setUpProjectDetails = (projectPath, dispatch) => new Promise((resolve) => {
  dispatch(ProjectLoadingActions.closeProject());
  let manifest = manifestHelpers.getProjectManifest(projectPath);
  let settings = ProjectSettingsHelpers.getProjectSettings(projectPath);
  dispatch(ProjectLoadingActions.loadProjectDetails(projectPath, manifest, settings));
  resolve();
});

/**
 * @description - Wrapper from asynchronously handling user input from the
 * project import stepper
 * @param {String} projectPath
 * @param {null|Function} promptCallback - optional callback for feedback if user was prompted
 */
export const promptMissingDetails = (projectPath, promptCallback) => ((dispatch, getState) => new Promise(async (resolve, reject) => {
  try {
    let needToCheckProjectNameWhenStepperDone = false;

    dispatch(ProjectImportStepperActions.validateProject(async (haveValidationSteps) => {
      if (needToCheckProjectNameWhenStepperDone) {
        await dispatch(ProjectDetailsActions.updateProjectNameIfNecessaryAndDoPrompting());
      }

      if (promptCallback) {
        promptCallback(haveValidationSteps);
      }
      resolve();
    }));

    const { projectInformationCheckReducer: { alreadyImported, skipProjectNameCheck } } = getState();

    if (!skipProjectNameCheck) {
      const manifest = manifestHelpers.getProjectManifest(projectPath);
      const programNameMatchesSpec = doesProjectNameMatchSpec(projectPath, manifest);

      if (ProjectImportStepperActions.stepperActionCount(getState()) === 0) { // if not in stepper, then we just open project details prompt
        if (!programNameMatchesSpec || !alreadyImported) {
          dispatch(openOnlyProjectDetailsScreen(projectPath, true));
        }
      } else { // we have validation steps
        if (!programNameMatchesSpec) { // if we are within validation stepper, then we should check project name at finish
          needToCheckProjectNameWhenStepperDone = alreadyImported;
        }
      }
    }
  } catch (error) {
    reject(error);
  }
}));

/**
 * @description Updates the project folder name to follow
 * project naming specifications
 * @param {String} projectPath - path to project.
 */
export const updateProjectFolderToNameSpecification = (projectPath) => ((dispatch, getState) => {
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
              {translate('projects.project_exists', { project_path: newProjectNamePath })} <br/>
              {translate('projects.reimporting_not_supported')}
            </div>,
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

/**
 * enable/disable the overwrite on button
 * @param enable
 * @return {Function}
 */
export function displayOverwriteButton(enable) {
  return ((dispatch, getState) => {
    const { projectValidationReducer } = getState();

    if (projectValidationReducer.showOverwriteButton != enable) { // only update if changed
      dispatch({ type: consts.SHOW_OVERWRITE_BUTTON, value: enable });
    }
  });
}

/**
 * initializes project validation and project checking reducers for open, import or validation.
 * @param {boolean} localImport - true if importing a local project (versus online)
 * @param {boolean} alreadyImported - true if if we are openning a project that has already been imported
 * @param {boolean} usfmProject - true if usfm project
 * @return {Function}
 */
export const initializeReducersForProjectValidation = (localImport, alreadyImported, usfmProject) => (dispatch) => {
  dispatch({ type: consts.RESET_PROJECT_VALIDATION_REDUCER });
  dispatch({ type: consts.CLEAR_PROJECT_INFORMATION_REDUCER });
  dispatch(setValuesForProjectValidation(localImport, alreadyImported, usfmProject));
};

/**
 * makes sure values in project information check reducer are set to correct boolean value.
 * @param {boolean} localImport - true if importing a local project (versus online)
 * @param {boolean} alreadyImported - true if if we are openning a project that has already been imported
 * @param {boolean} usfmProject - true if usfm project
 * @return {Function}
 */
export const setValuesForProjectValidation = (localImport, alreadyImported, usfmProject) => (dispatch, getState) => {
  const { projectInformationCheckReducer } = getState();

  if (!alreadyImported !== !projectInformationCheckReducer.alreadyImported) { // update if boolean value is different
    dispatch(setAlreadyImportedInProjectInformationCheckReducer(!!alreadyImported));
  }

  if (!localImport !== !projectInformationCheckReducer.localImport) { // update if boolean value is different
    dispatch(setLocalImportInProjectInformationCheckReducer(!!localImport));
  }

  if (!usfmProject !== !projectInformationCheckReducer.usfmProject) { // update if boolean value is different
    dispatch(setUsfmProjectInProjectInformationCheckReducer(!!usfmProject));
  }
  dispatch(upfdateOverwritePermittedInProjectInformationCheckReducer());
  dispatch(toggleProjectInformationCheckSaveButton());
};


/**
 * initializes project validation and project checking reducers for import or validation.
 * @param {boolean} localImport - true if importing a local project (versus online)
 * @param {boolean} usfmProject - true if usfm project
 * @return {Function}
 */
export const initializeReducersForProjectImportValidation = (localImport, usfmProject=false) => (dispatch) => {
  dispatch(initializeReducersForProjectValidation(localImport, false, usfmProject));
};

/**
 * initializes project validation and project checking reducers for opening or editing local project.
 * @return {Function}
 */
export const initializeReducersForProjectOpenValidation = () => (dispatch) => {
  dispatch(initializeReducersForProjectValidation(false, true, false));
};
