import consts from '../ActionTypes';
import path from 'path-extra';
import ospath from 'ospath';
// actions
import migrateProject from '../../helpers/ProjectMigration';
import {initializeReducersForProjectOpenValidation, validateProject} from '../Import/ProjectValidationActions';
import * as ToolsMetadataActions from '../ToolsMetadataActions';
import * as BodyUIActions from '../BodyUIActions';
import * as RecentProjectsActions from '../RecentProjectsActions';
import {openAlertDialog, closeAlertDialog} from '../AlertModalActions';
import * as ProjectDetailsActions from '../ProjectDetailsActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
//helpers
import * as manifestHelpers from '../../helpers/manifestHelpers';
import { getTranslate } from '../../selectors';
import {isProjectSupported, ensureSupportedVersion} from '../../helpers/ProjectValidation/ProjectStructureValidationHelpers';

// constants
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

function delay(ms) {
  return new Promise ((resolve) =>
    setTimeout(resolve, ms)
  );
}

/**
 * This thunk opens a project and prepares it for use in tools.
 * @param {string} name -  the name of the project
 */
export const openProject = (name) => {
  return async (dispatch, getState) => {
    const projectDir = path.join(PROJECTS_PATH, name);
    const translate = getTranslate(getState());

    try {
      // TODO: refactor project reducers
      dispatch(initializeReducersForProjectOpenValidation());
      dispatch(
        openAlertDialog(translate('projects.loading_project_alert'), true));
      // TRICKY: prevent dialog from flashing on small projects
      await delay(200);
      const isSupported = await isProjectSupported(projectDir);
      if(!isSupported) {
        const errorMessage = translate('project_validation.old_project_unsupported', {app: translate('_.app_name')});
        throw new Error(errorMessage);
      }
      migrateProject(projectDir);
      await dispatch(validateProject(projectDir));
      // TODO: load the project data here
      dispatch(closeAlertDialog());
      await dispatch(displayTools());
    } catch (e) {
      // TODO: clean this up
      if (e.type !== 'div') console.warn(e);
      // clear last project must be called before any other action.
      // to avoid triggering autosaving.
      dispatch(clearLastProject());
      dispatch(openAlertDialog(e));
      dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
    }
  };
};

/**
 * @deprecated This action is deprecated. Use {@link openProject} instead.
 * This thunk migrates, validates, then loads a project.
 * This may seem redundant to run migrations and validations each time
 * But the helpers called from each action test to only run when needed
 * @param {string} projectName - the name of the project
 */
export const migrateValidateLoadProject = (projectName) => {
  return async (dispatch, getState) => {
    const translate = getTranslate(getState());
    try {
      dispatch(initializeReducersForProjectOpenValidation());
      dispatch(openAlertDialog(translate('projects.loading_project_alert'), true));
      await delay(200);
      const projectPath = path.join(PROJECTS_PATH, projectName);
      await ensureSupportedVersion(projectPath, translate);
      migrateProject(projectPath);
      dispatch(closeAlertDialog());
      await dispatch(validateProject(projectPath));
      await dispatch(displayTools());
    } catch (error) {
      if (error.type !== 'div') console.warn(error);
      // clear last project must be called before any other action.
      // to avoid triggering autosaving.
      dispatch(clearLastProject());
      dispatch(openAlertDialog(error));
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
      resolve();
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
