import * as manifestValidationHelpers from '../../helpers/ProjectValidation/ManifestValidationHelpers';
import * as projectStructureValidatoinHelpers from '../../helpers/ProjectValidation/ProjectStructureValidationHelpers';
import * as ProjectSelectionHelpers from '../../helpers/ProjectSelectionHelpers';
//actions
import * as BodyUIActions from '../BodyUIActions';
import * as ProjectSelectionActions from '../ProjectSelectionActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
/**
 * @Description:
 * Actions that call helpers to handle business logic for validations
**/

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

export const setUpProjectDetails = (projectPath, projectLink, dispatch) => {
  return new Promise((resolve) => {
    dispatch(ProjectSelectionActions.clearLastProject());
    dispatch(BodyUIActions.resetStepLabels(2));
    dispatch(BodyUIActions.updateStepLabel(2, ProjectSelectionHelpers.getProjectName(projectPath)));
    let manifest = ProjectSelectionHelpers.getProjectManifest(projectPath, projectLink);
    dispatch(ProjectSelectionActions.loadProjectDetails(projectPath, manifest));
    resolve();
  });
};

export const promptMissingDetails = (dispatch) => {
  return new Promise((resolve) => {
    dispatch(ProjectImportStepperActions.validateProject(resolve));
  });
};
