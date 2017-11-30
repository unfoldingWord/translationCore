import consts from './ActionTypes';
// actions
import * as ToolsMetadataActions from './ToolsMetadataActions';
import * as BodyUIActions from './BodyUIActions';
import * as ProjectDetailsActions from './ProjectDetailsActions';


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
  return ((dispatch) => {
    dispatch(ToolsMetadataActions.getToolsMetadatas());
    // Go to toolsCards page
    dispatch(BodyUIActions.goToStep(3));
  });
}
