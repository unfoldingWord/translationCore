import consts from './ActionTypes';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as ModalActions from './ModalActions';
import * as ToolsMetadataActions from './ToolsMetadataActions';
import * as RecentProjectsActions from './RecentProjectsActions';
import * as BodyUIActions from './BodyUIActions';
import * as ProjectDetailsActions from './projectDetailsActions';
import * as TargetLanguageActions from './TargetLanguageActions';
// helpers
import * as ProjectSelectionHelpers from '../helpers/ProjectSelectionHelpers';
import * as LoadHelpers from '../helpers/LoadHelpers';


export function selectProject(projectPath, projectLink) {
  return ((dispatch, getState) => {
    const { username } = getState().loginReducer.userdata;
    if (!projectPath) {
      console.error("No project path specified");
    } else if (LoadHelpers.isUSFMProject(projectPath)) {
      console.error("translationCore does not support USFM importing");
    } else {
      projectPath = LoadHelpers.saveProjectInHomeFolder(projectPath);
      let manifest = ProjectSelectionHelpers.getProjectManifest(projectPath, projectLink, username);
      if (!manifest) console.error("No valid manifest found in project");
      dispatch(clearLastProject());
      dispatch(loadProjectDetails(projectPath, manifest));
      dispatch(TargetLanguageActions.generateTargetBible(projectPath));
      if (LoadHelpers.projectHasMergeConflicts(manifest.project.id, projectPath)) console.err("Oops! The project you are trying to load has a merge conflict and cannot be opened in this version of translationCore! Please contact Help Desk (help@door43.org) for assistance.");
      if (LoadHelpers.projectIsMissingVerses(manifest.project.id, projectPath)) {
        const callback = (option) => {
          if (option != "Cancel") {
            dispatch(displayTools(manifest));
          } else {
            dispatch(clearLastProject());
          }
          return dispatch(AlertModalActions.closeAlertDialog());
        }
        dispatch(AlertModalActions.openOptionDialog(
          "Oops! Your project has blank verses! Please contact Help Desk (help@door43.org) for assistance with fixing this problem. If you proceed without fixing, some features may not work properly",
          callback,
          "Continue Without Fixing",
          "Cancel"
        ));
      } else {
        dispatch(displayTools(manifest));
      }
    }
  })
}

/**
 * @description loads and set the projects details into the projectDetailsReducer.
 * @param {string} projectPath - path location in the filesystem for the project.
 * @param {object} manifest - project manifest.
 */
export function loadProjectDetails(projectPath, manifest) {
  return ((dispatch) => {
    LoadHelpers.migrateAppsToDotApps(projectPath);
    dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
    dispatch(ProjectDetailsActions.setProjectManifest(manifest));
    dispatch(ProjectDetailsActions.setProjectDetail("bookName", manifest.project.name));
    const params = LoadHelpers.getParams(projectPath, manifest);
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

export function displayTools(manifest) {
  return ((dispatch, getState) => {
    const { currentSettings } = getState().settingsReducer;
    if (LoadHelpers.checkIfValidBetaProject(manifest) || currentSettings.developerMode) {
      dispatch(ToolsMetadataActions.getToolsMetadatas());
      dispatch(ModalActions.selectModalTab(3, 1, true));
    } else {
      dispatch(AlertModalActions.openAlertDialog('You can only load Ephesians or Titus projects for now.', false));
      dispatch(RecentProjectsActions.getProjectsFromFolder());
      dispatch(clearLastProject())
    }
  });
}