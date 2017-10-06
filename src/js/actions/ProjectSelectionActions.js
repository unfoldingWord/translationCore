import consts from './ActionTypes';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as ToolsMetadataActions from './ToolsMetadataActions';
import * as RecentProjectsActions from './RecentProjectsActions';
import * as BodyUIActions from './BodyUIActions';
import * as ProjectDetailsActions from './ProjectDetailsActions';
import * as ProjectValidationActions from './ProjectValidationActions';
import * as MyProjectsActions from './MyProjectsActions';
// helpers
import * as ProjectSelectionHelpers from '../helpers/ProjectSelectionHelpers';
import * as LoadHelpers from '../helpers/LoadHelpers';
import * as manifestHelpers from '../helpers/manifestHelpers';
import * as usfmHelpers from '../helpers/usfmHelpers';
import * as migrationHelpers from '../helpers/migrationHelpers';


/**
 * Wrapper function to initate selection of a project from path.
 * @param {String} projectPath - Path location in the filesystem for the project.
 * @param {String} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git.
 */
export function selectProject(projectPath, projectLink) {
  return ((dispatch, getState) => {
    dispatch(BodyUIActions.resetStepLabels(2));
    //Need to keep user but reset project and tool
    dispatch(BodyUIActions.updateStepLabel(2, ProjectSelectionHelpers.getProjectName(projectPath)));
    const { projectType } = getState().projectDetailsReducer;
    if (!projectPath) {
      return dispatch(AlertModalActions.openAlertDialog("No project path specified"));
    }
    if (projectType !== 'usfm')
      projectPath = LoadHelpers.saveProjectInHomeFolder(projectPath);
    /**After the project is placed in the tC home folder there needs to a fetch of my projects */
    dispatch(MyProjectsActions.getMyProjects());
    let manifest;
    /**@type {String} */
    //If usfm project proceed to usfm loading process
    if (projectType === 'usfm') {
      let USFMFilePath = usfmHelpers.isUSFMProject(projectPath);
      let usfmProjectObject = usfmHelpers.getProjectDetailsFromUSFM(USFMFilePath);
      let { parsedUSFM } = usfmProjectObject;
      manifest = usfmHelpers.getUSFMProjectManifest(projectPath, projectLink, parsedUSFM);
    } else {
      //If no usfm file found proceed to load regular loading process
      manifest = ProjectSelectionHelpers.getProjectManifest(projectPath, projectLink);
      if (!manifest) dispatch(AlertModalActions.openAlertDialog("No valid manifest found in project"));
    }
    const { currentSettings } = getState().settingsReducer;
    if (manifestHelpers.checkIfValidBetaProject(manifest) || currentSettings.developerMode) {
      dispatch(clearLastProject());
      dispatch(loadProjectDetails(projectPath, manifest, projectType));
      dispatch(ProjectValidationActions.validateProject());
    } else {
      dispatch(AlertModalActions.openAlertDialog('This version of translationCore only supports Titus projects.'));
      dispatch(RecentProjectsActions.getProjectsFromFolder());
      dispatch(clearLastProject());
    }
  });
}

/**
 * @description - This action creates a confirm dialog that ensures
 * if the user wants to use a project with missing verses
 * @param {string} projectPath - path location in the filesystem for the project.
 * @param {object} manifest project manifest.
 */
export function confirmOpenMissingVerseProjectDialog() {
  return ((dispatch) => {
    const callback = (option) => {
      dispatch(AlertModalActions.closeAlertDialog());
      if (option !== "Cancel") {
        dispatch(displayTools());
      } else {
        dispatch(clearLastProject());
      }
    };
    dispatch(AlertModalActions.openOptionDialog(
      "Oops! Your project has blank verses! Please contact Help Desk (help@door43.org) for assistance with fixing this problem. If you proceed without fixing, some features may not work properly",
      callback,
      "Continue Without Fixing",
      "Cancel"
    ));
  });
}

/**
 * @description loads and set the projects details into the projectDetailsReducer.
 * @param {string} projectPath - path location in the filesystem for the project.
 * @param {object} manifest - project manifest.
 */
export function loadProjectDetails(projectPath, manifest, projectType) {
  return ((dispatch) => {
    migrationHelpers.migrateAppsToDotApps(projectPath);
    dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
    dispatch(ProjectDetailsActions.setProjectManifest(manifest));
    dispatch(ProjectDetailsActions.setProjectType(projectType));
  });
}

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
      dispatch(clearLastProject());
    }
  });
}
