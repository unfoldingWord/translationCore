import types from "./ActionTypes";
import { loadToolsInDir } from "../helpers/toolHelper";
import { getToolGatewayLanguage, getTranslate, getProjectSaveLocation } from "../selectors";
import * as ModalActions from "./ModalActions";
import * as AlertModalActions from "./AlertModalActions";
import * as GroupsDataActions from "./GroupsDataActions";
import { loadCurrentContextId } from "./ContextIdActions";
import * as BodyUIActions from "./BodyUIActions";
import { loadProjectGroupData, loadProjectGroupIndex } from "../helpers/ResourcesHelpers";
import { loadGroupsIndex } from "./GroupsIndexActions";

/**
 * Registers a tool that has been loaded from the disk.
 * @param {object} tool - a tc-tool.
 */
const registerTool = tool => ({
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
  console.log("openTool(" + name + ")");

  dispatch(ModalActions.showModalContainer(false));
  dispatch({ type: types.START_LOADING });
  setTimeout(() => {
    try {

      dispatch({ type: types.CLEAR_PREVIOUS_GROUPS_DATA });
      dispatch({ type: types.CLEAR_PREVIOUS_GROUPS_INDEX });
      dispatch({ type: types.CLEAR_CONTEXT_ID });

      dispatch({
        type: types.OPEN_TOOL,
        name
      });

      // load group data
      const projectDir = getProjectSaveLocation(getData());
      const groupData = loadProjectGroupData(name, projectDir);
      dispatch({
        type: types.LOAD_GROUPS_DATA_FROM_FS,
        allGroupsData: groupData
      });

      // load group index
      const language = getToolGatewayLanguage(getData(), name);
      const groupIndex = loadProjectGroupIndex(language, name, projectDir, translate);
      dispatch(loadGroupsIndex(groupIndex));

      dispatch(loadCurrentContextId());

      // verify stuff. We need this to pick up external edits and when checks data is updated.
      // TRICKY: this must be after loadCurrentContextId() for group data changes to be saved to file
      dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs());

      dispatch({type: types.TOGGLE_LOADER_MODAL, show: false});
      dispatch(BodyUIActions.toggleHomeView(false));
    } catch (e) {
      console.warn("openTool()", e);
      AlertModalActions.openAlertDialog(translate('projects.error_setting_up_project', {email: translate('_.help_desk_email')}));
    }
  }, 100);
};
