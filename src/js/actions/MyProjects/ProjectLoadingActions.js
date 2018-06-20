import consts from '../ActionTypes';
import path from 'path-extra';
import ospath from 'ospath';
// actions
import * as ProjectMigrationActions from '../Import/ProjectMigrationActions';
import * as ProjectValidationActions from '../Import/ProjectValidationActions';
import * as ToolsMetadataActions from '../ToolsMetadataActions';
import * as BodyUIActions from '../BodyUIActions';
import * as RecentProjectsActions from '../RecentProjectsActions';
import * as AlertModalActions from '../AlertModalActions';
import * as ProjectDetailsActions from '../ProjectDetailsActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as ProjectInformationCheckActions from "../ProjectInformationCheckActions";
//helpers
import * as manifestHelpers from '../../helpers/manifestHelpers';
import { getTranslate } from '../../selectors';
import * as ProjectStructureValidationHelpers from '../../helpers/ProjectValidation/ProjectStructureValidationHelpers';

// constants
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

function delay(ms) {
  return new Promise ((resolve) =>
    setTimeout(resolve, ms)
  );
}

/**
 * @description action that Migrates, Validates and Loads the Project
 * This may seem redundant to run migrations and validations each time
 * But the helpers called from each action test to only run when needed
 * @param {String} selectedProjectFilename
 */
export const migrateValidateLoadProject = (selectedProjectFilename) => {
  return async (dispatch, getState) => {
    const translate = getTranslate(getState());
    try {
      dispatch({ type: consts.RESET_PROJECT_VALIDATION_REDUCER });
      dispatch(ProjectInformationCheckActions.setAlreadyImportedInProjectInformationReducer(true));
      dispatch(AlertModalActions.openAlertDialog(translate('projects.loading_project_alert'), true));
      await delay(200);
      const projectPath = path.join(PROJECTS_PATH, selectedProjectFilename);
      await ProjectStructureValidationHelpers.ensureSupportedVersion(projectPath, translate);
      ProjectMigrationActions.migrate(projectPath);
      dispatch(AlertModalActions.closeAlertDialog());
      await dispatch(ProjectValidationActions.validate(projectPath));
      await dispatch(displayTools());
    } catch (error) {
      if (error.type !== 'div') console.warn(error);
      // clear last project must be called before any other action.
      // to avoid triggering autosaving.
      dispatch(clearLastProject());
      dispatch(AlertModalActions.openAlertDialog(error));
      dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
      dispatch({ type: "LOADED_ONLINE_FAILED" });
    }
  };
};

/**
 * @description - Opening the tools screen upon making sure the project is
 * not a titus or in the user is in developer
 */
export function displayTools() {
  return (dispatch, getState) => {
    const translate = getTranslate(getState());
    return new Promise ((resolve, reject) => {
      try {
        const { currentSettings } = getState().settingsReducer;
        const { manifest } = getState().projectDetailsReducer;
        if (manifestHelpers.checkIfValidBetaProject(manifest) || currentSettings.developerMode) {
          dispatch(ToolsMetadataActions.getToolsMetadatas());
          // Go to toolsCards page
          dispatch(BodyUIActions.goToStep(3));
        } else {
          dispatch(RecentProjectsActions.getProjectsFromFolder());
          reject(translate('projects.books_available', {app: translate('_.app_name')}));
        }
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  };
}

/**
 * @description - Wrapper to clear everything in the store that could
 * prevent a new project from loading
 */
export function clearLastProject() {
  return (dispatch) => {
    /**
     * ATTENTION: THE project details reducer must be reset
     * before any other action being called to avoid
     * autosaving messing up with the project data.
     */
    dispatch({ type: consts.RESET_PROJECT_DETAIL });
    dispatch(BodyUIActions.toggleHomeView(true));
    dispatch(ProjectDetailsActions.resetProjectDetail());
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_DATA });
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_INDEX });
    dispatch({ type: consts.CLEAR_CONTEXT_ID });
    dispatch({ type: consts.CLEAR_CURRENT_TOOL_DATA });
    dispatch({ type: consts.CLEAR_RESOURCES_REDUCER });
    dispatch({ type: consts.CLEAR_PREVIOUS_FILTERS});
    dispatch({
      type: consts.SET_CURRENT_TOOL_TITLE,
      currentToolTitle: ""
    });
  };
}

/**
 * @description loads and set the projects details into the projectDetailsReducer.
 * @param {string} projectPath - path location in the filesystem for the project.
 * @param {object} manifest - project manifest.
 */
export function loadProjectDetails(projectPath, manifest) {
  return (dispatch) => {
    dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
    dispatch(ProjectDetailsActions.setProjectManifest(manifest));
  };
}
