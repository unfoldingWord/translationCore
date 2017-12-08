<<<<<<< HEAD
/**
 * @Description:
 * Actions that call helpers to handle business logic for validations
**/

export const validate = () => {
  // return((dispatch, getState) => {
  // });
=======
//actions
import * as BodyUIActions from '../BodyUIActions';
import * as ProjectLoadingActions from '../MyProjects/ProjectLoadingActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
// helpers
import * as manifestValidationHelpers from '../../helpers/ProjectValidation/ManifestValidationHelpers';
import * as projectStructureValidatoinHelpers from '../../helpers/ProjectValidation/ProjectStructureValidationHelpers';
import * as ProjectSelectionHelpers from '../../helpers/ProjectSelectionHelpers';


/**
 * @description Action that call helpers to handle business
 * logic for validations
 * @param {String} projectPath - Full path to the project root folder
 * @param {String | null} projectLink - Link from the online project
 */
export const validate = (projectPath, projectLink) => {
  return (async (dispatch, getState) => {
    await manifestValidationHelpers.manifestExists(projectPath);
    await projectStructureValidatoinHelpers.verifyProjectType(projectPath);
    await projectStructureValidatoinHelpers.detectInvalidProjectStructure(projectPath);
    await setUpProjectDetails(projectPath, projectLink, dispatch);
    await projectStructureValidatoinHelpers.verifyValidBetaProject(getState());
    await promptMissingDetails(dispatch);
  });
};

/**
 * 
 * @param {string} projectPath - Full path to the project root folder
 * @param {string | null} projectLink - Link from the online project
 * @param {function} dispatch - Redux dispatcher
 * @returns {<new Promise>}
 */
export const setUpProjectDetails = (projectPath, projectLink, dispatch) => {
  return new Promise((resolve) => {
    dispatch(ProjectLoadingActions.clearLastProject());
    dispatch(BodyUIActions.resetStepLabels(2));
    dispatch(BodyUIActions.updateStepLabel(2, ProjectSelectionHelpers.getProjectName(projectPath)));
    let manifest = ProjectSelectionHelpers.getProjectManifest(projectPath, projectLink);
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
export const promptMissingDetails = (dispatch) => {
  return new Promise((resolve) => {
    dispatch(ProjectImportStepperActions.validateProject(resolve));
  });
>>>>>>> 7f6897c218b9d4b6b85a4fbfb4ec51139a32b68e
};
