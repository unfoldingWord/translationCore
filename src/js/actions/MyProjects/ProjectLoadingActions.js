import consts from '../ActionTypes';
import path from 'path-extra';
// actions
import * as ProjectMigrationActions from '../Import/ProjectMigrationActions';
import * as ProjectValidationActions from '../Import/ProjectValidationActions';
import * as ToolsMetadataActions from '../ToolsMetadataActions';
import * as BodyUIActions from '../BodyUIActions';
import * as RecentProjectsActions from '../RecentProjectsActions';
import * as AlertModalActions from '../AlertModalActions';
import * as ProjectDetailsActions from '../ProjectDetailsActions';
import * as ProjectLoadingActions from '../MyProjects/ProjectLoadingActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
//helpers
import * as manifestHelpers from '../../helpers/manifestHelpers';
// constants
const PROJECTS_PATH = path.join(path.homedir(), 'translationCore', 'projects');

/**
 * @description action that Migrates, Validates and Loads the Project
 * This may seem redundant to run migrations and validations each time
 * But the helpers called from each action test to only run when needed
 * @param {String} selectedProjectFilename
 */
export const migrateValidateLoadProject = (selectedProjectFilename) => {
  return(async (dispatch) => {
    try {
      dispatch(AlertModalActions.openAlertDialog('Loading your project data', true));
      setTimeout(async () => {
        let projectPath = path.join(PROJECTS_PATH, selectedProjectFilename);
        ProjectMigrationActions.migrate(projectPath);
        dispatch(AlertModalActions.closeAlertDialog());
        await dispatch(ProjectValidationActions.validate(projectPath));
        dispatch(displayTools());
      }, 200);
    } catch (error) {
      if (error.type !== 'div') console.warn(error);
      // clear last project must be called before any other action.
      // to avoid triggering autosaving.
      dispatch(clearLastProject());
      dispatch(AlertModalActions.openAlertDialog(error));
      dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
      dispatch({ type: "LOADED_ONLINE_FAILED" });
    }
  });
};

/**
 * @description - Opening the tools screen upon making sure the project is
 * not a titus or in the user is in developer
 */
export function displayTools() {
  return ((dispatch, getState) => {
    const { currentSettings } = getState().settingsReducer;
    const { manifest } = getState().projectDetailsReducer;
    if (manifestHelpers.checkIfValidBetaProject(manifest) || currentSettings.developerMode) {
      dispatch(ToolsMetadataActions.getToolsMetadatas());
      // Go to toolsCards page
      dispatch(BodyUIActions.goToStep(3));
    } else {
      dispatch(AlertModalActions.openAlertDialog('This version of translationCore only supports Titus projects.'));
      dispatch(RecentProjectsActions.getProjectsFromFolder());
    }
  });
}

/**
 * @description - Wrapper to clear everything in the store that could
 * prevent a new project from loading
 */
export function clearLastProject() {
  return ((dispatch) => {
    dispatch(BodyUIActions.toggleHomeView(true));
    dispatch(ProjectDetailsActions.resetProjectDetail());
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_DATA });
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_INDEX });
    dispatch({ type: consts.CLEAR_CONTEXT_ID });
    dispatch({ type: consts.CLEAR_CURRENT_TOOL_DATA });
    dispatch({ type: consts.CLEAR_RESOURCES_REDUCER });
    dispatch({
      type: consts.SET_CURRENT_TOOL_TITLE,
      currentToolTitle: ""
    });
    /** After clearing the local project the label also needs to be updated in the stepper */
    dispatch(BodyUIActions.resetStepLabels(1));
  });
}

/**
 * @description loads and set the projects details into the projectDetailsReducer.
 * @param {string} projectPath - path location in the filesystem for the project.
 * @param {object} manifest - project manifest.
 */
export function loadProjectDetails(projectPath, manifest) {
  return ((dispatch) => {
    dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
    dispatch(ProjectDetailsActions.setProjectManifest(manifest));
  });
}
