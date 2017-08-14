import consts from './ActionTypes';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as ToolsMetadataActions from './ToolsMetadataActions';
import * as RecentProjectsActions from './RecentProjectsActions';
import * as BodyUIActions from './BodyUIActions';
import * as ProjectDetailsActions from './projectDetailsActions';
import * as TargetLanguageActions from './TargetLanguageActions';
import * as ProjectValidationActions from './ProjectValidationActions';
// helpers
import * as ProjectSelectionHelpers from '../helpers/ProjectSelectionHelpers';
import * as LoadHelpers from '../helpers/LoadHelpers';
import * as manifestHelpers from '../helpers/manifestHelpers';
import * as usfmHelpers from '../helpers/usfmHelpers';
import * as migrationHelpers from '../helpers/migrationHelpers';


/**
 * Wrapper function to initate selection of a project from path.
 * @param {string} projectPath - Path location in the filesystem for the project.
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git.
 */
export function selectProject(projectPath, projectLink) {
  return ((dispatch, getState) => {
    const { username } = getState().loginReducer.userdata;
    if (!projectPath) {
      return dispatch(AlertModalActions.openAlertDialog("No project path specified"));
    }
    projectPath = LoadHelpers.saveProjectInHomeFolder(projectPath);
    let manifest, params, targetLanguage;
    /**@type {String} */
    let USFMFilePath = usfmHelpers.isUSFMProject(projectPath);
    //If present proceed to usfm loading process
    if (USFMFilePath) {
      let usfmProjectObject = usfmHelpers.getProjectDetailsFromUSFM(USFMFilePath, projectPath);
      let { parsedUSFM, direction } = usfmProjectObject;
      targetLanguage = parsedUSFM;
      manifest = usfmHelpers.getUSFMProjectManifest(projectPath, projectLink, parsedUSFM, direction, username);
      params = usfmHelpers.getUSFMParams(projectPath, manifest);
    } else {
      //If no usfm file found proceed to load regular loading process
      manifest = ProjectSelectionHelpers.getProjectManifest(projectPath, projectLink, username);
      if (!manifest) dispatch(AlertModalActions.openAlertDialog("No valid manifest found in project"));
      params = manifestHelpers.getParams(projectPath, manifest);
    }
    dispatch(clearLastProject());
    dispatch(loadProjectDetails(projectPath, manifest, params));
    dispatch(ProjectValidationActions.validateProject((isValidProject) => {
      if (isValidProject) {
        TargetLanguageActions.generateTargetBible(projectPath, targetLanguage, manifest);
        dispatch(displayTools());
      } else {
        dispatch(ProjectValidationActions.showStepper(true));
      }
    }));
    //TODO: Factor back into project opening workflow
    // if (LoadHelpers.projectHasMergeConflicts(projectPath, manifest.project.id)) dispatch(AlertModalActions.openAlertDialog("Oops! The project you are trying to load has a merge conflict and cannot be opened in this version of translationCore! Please contact Help Desk (help@door43.org) for assistance."));
    // if (LoadHelpers.projectIsMissingVerses(projectPath, manifest.project.id)) {
    //   dispatch(confirmOpenMissingVerseProjectDialog(projectPath, manifest))
    // } else {
    //   dispatch(displayTools(manifest));
    // }
  })
}

/**
 * @description - This action creates a confirm dialog that ensures
 * if the user wants to use a project with missing verses
 * @param {string} projectPath - path location in the filesystem for the project.
 * @param {object} manifest project manifest.
 */
export function confirmOpenMissingVerseProjectDialog(projectPath, manifest) {
  return ((dispatch) => {
    const callback = (option) => {
      dispatch(AlertModalActions.closeAlertDialog());
      if (option != "Cancel") {
        dispatch(displayTools());
      } else {
        dispatch(clearLastProject());
      }
    }
    dispatch(AlertModalActions.openOptionDialog(
      "Oops! Your project has blank verses! Please contact Help Desk (help@door43.org) for assistance with fixing this problem. If you proceed without fixing, some features may not work properly",
      callback,
      "Continue Without Fixing",
      "Cancel"
    ));
  })
}

/**
 * @description loads and set the projects details into the projectDetailsReducer.
 * @param {string} projectPath - path location in the filesystem for the project.
 * @param {object} manifest - project manifest.
 * @param {object} params - parameters defining a projects detals, similiar to metadata.
 */
export function loadProjectDetails(projectPath, manifest, params) {
  return ((dispatch) => {
    migrationHelpers.migrateAppsToDotApps(projectPath);
    dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
    dispatch(ProjectDetailsActions.setProjectManifest(manifest));
    dispatch(ProjectDetailsActions.setProjectDetail("bookName", manifest.project.name));
    dispatch(ProjectDetailsActions.setProjectParams(params));
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
      dispatch(AlertModalActions.openAlertDialog('You can only load Titus projects for now.'));
      dispatch(RecentProjectsActions.getProjectsFromFolder());
      dispatch(clearLastProject())
    }
  });
}
