import types from "./ActionTypes";
import { loadToolsInDir } from "../helpers/toolHelper";
import { getTranslate } from "../selectors";
import * as ModalActions from "./ModalActions";
import * as ProjectDataLoadingActions from "./ProjectDataLoadingActions";
import * as AlertModalActions from "./AlertModalActions";

/**
 * Registers a tool that has been loaded from the disk.
 * @param {object} tool - a tc-tool.
 */
export const registerTool = tool => ({
  type: types.ADD_TOOL,
  name: tool.name,
  tool
});

/**
 * Loads the app tools.
 * This puts the tools into redux for later use.
 * @param {string} toolsDir - path to the tools directory
 * @returns {Function}
 */
export const loadTools = (toolsDir) => (dispatch) => {
  // TRICKY: push this off the render thread just for a moment to simulate threading.
  setTimeout(() => {
    loadToolsInDir(toolsDir).then((tools) => {
      for(let i = 0, len = tools.length; i < len; i ++) {
        dispatch(registerTool(tools[i]));
      }
    });
  }, 500);
};

/**
 * Opens a tool
 * @param {string} name - the name of the tool to open
 * @returns {Function}
 */
export const openTool = (name) => (dispatch, getData) => {
  const translate = getTranslate(getData());

  dispatch(ModalActions.showModalContainer(false));
  dispatch({ type: types.START_LOADING });
  setTimeout(() => {
    try {
      dispatch(resetReducersData());
      dispatch({
        type: types.OPEN_TOOL,
        name
      });
      dispatch(ProjectDataLoadingActions.loadProjectData(name));
    } catch (e) {
      console.warn(e);
      AlertModalActions.openAlertDialog(translate('projects.error_setting_up_project', {email: translate('_.help_desk_email')}));
    }
  }, 100);
};

export function resetReducersData() {
  // TODO: this is crazy. All of related reducers could be keyed by the same action.
  return (dispatch => {
    dispatch({ type: types.CLEAR_PREVIOUS_GROUPS_DATA });
    dispatch({ type: types.CLEAR_PREVIOUS_GROUPS_INDEX });
    dispatch({ type: types.CLEAR_CONTEXT_ID });
    dispatch({ type: types.CLEAR_ALIGNMENT_DATA });
    dispatch({ type: types.CLEAR_RESOURCES_REDUCER });
    dispatch({ type: types.CLEAR_PREVIOUS_FILTERS});
  });
}
