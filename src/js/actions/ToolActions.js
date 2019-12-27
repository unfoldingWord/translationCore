
/* eslint-disable no-async-promise-executor */
import { batchActions } from 'redux-batched-actions';
import {
  getToolGatewayLanguage,
  getTranslate,
  getProjectSaveLocation,
} from '../selectors';
import { loadProjectGroupData, loadProjectGroupIndex } from '../helpers/ResourcesHelpers';
import {
  loadToolsInDir, isInvalidationAlertDisplaying, getInvalidCountForTool,
} from '../helpers/toolHelper';
import { delay } from '../common/utils';
import { WORD_ALIGNMENT } from '../common/constants';
import types from './ActionTypes';
// actions
import * as ModalActions from './ModalActions';
import { openAlertDialog, closeAlertDialog } from './AlertModalActions';
import * as GroupsDataActions from './GroupsDataActions';
import { loadCurrentContextId } from './ContextIdActions';
import * as BodyUIActions from './BodyUIActions';
import { loadGroupsIndex } from './GroupsIndexActions';
import { loadOlderOriginalLanguageResource } from './OriginalLanguageResourcesActions';
// helpers
import { showInvalidatedWarnings } from './SelectionsActions';

/**
 * Registers a tool that has been loaded from the disk.
 * @param {object} tool - a tc-tool.
 */
const registerTool = tool => ({
  type: types.ADD_TOOL,
  name: tool.name,
  tool,
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
      for (let i = 0, len = tools.length; i < len; i++) {
        dispatch(registerTool(tools[i]));
      }
    });
  }, 500);
};

/**
 * This function prepares the data needed to load a tool, also
 *  useful for checking the progress of a tool
 * @param {String} name - Name of the tool
 */
export function prepareToolForLoading(name) {
  return async (dispatch, getData) => {
    const translate = getTranslate(getData());

    dispatch(batchActions([
      { type: types.CLEAR_PREVIOUS_GROUPS_DATA },
      { type: types.CLEAR_PREVIOUS_GROUPS_INDEX },
      { type: types.CLEAR_CONTEXT_ID },
    ]));

    // Load older version of OL resource if needed by tN tool
    dispatch(loadOlderOriginalLanguageResource(name));

    // load group data
    const projectDir = getProjectSaveLocation(getData());
    const groupData = loadProjectGroupData(name, projectDir);

    dispatch({
      type: types.LOAD_GROUPS_DATA_FROM_FS,
      allGroupsData: groupData,
    });

    // load group index
    const language = getToolGatewayLanguage(getData(), name);
    const groupIndex = loadProjectGroupIndex(language, name, projectDir, translate);
    dispatch(loadGroupsIndex(groupIndex));

    dispatch(loadCurrentContextId(name));
    //TRICKY: need to verify groups data after the contextId has been loaded, or changes are not saved
    await dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs(name));
    // wait for filesystem calls to finish
  };
}

/**
 * Opens a tool
 * @param {string} name - the name of the tool to open
 * @returns {Function}
 */
export const openTool = (name) => (dispatch, getData) => new Promise(async (resolve, reject) => {
  console.log('openTool(' + name + ')');
  const translate = getTranslate(getData());
  dispatch(ModalActions.showModalContainer(false));
  dispatch(openAlertDialog(translate('tools.loading_tool_data'), true));
  await delay(300);

  try {
    dispatch({ type: types.OPEN_TOOL, name });
    await dispatch(prepareToolForLoading(name));
    dispatch(batchActions([
      closeAlertDialog(),
      BodyUIActions.toggleHomeView(false),
    ]));
    dispatch(warnOnInvalidations(name));
  } catch (e) {
    console.warn('openTool()', e);
    dispatch(openAlertDialog(translate('projects.error_setting_up_project', { email: translate('_.help_desk_email') })));
    reject(e);
  }
  resolve();
});

/**
 * check for invalidations in tool and show appropriate warning for tool if there is not already a warning
 * @param {String} toolName
 * @return {Function}
 */
export const warnOnInvalidations = (toolName) => (dispatch, getState) => {
  try {
    const state = getState();
    const alertAlreadyDisplayed = isInvalidationAlertDisplaying(state, toolName);

    if (!alertAlreadyDisplayed) {
      const numInvalidChecks = getInvalidCountForTool(state, toolName);

      if (numInvalidChecks) {
        console.log(`warnOnInvalidations(${toolName}) - numInvalidChecks: ${numInvalidChecks} - showing alert`);
        const showAlignmentsInvalidated = toolName === WORD_ALIGNMENT;
        dispatch(showInvalidatedWarnings(!showAlignmentsInvalidated, showAlignmentsInvalidated));
      }
    } else {
      console.log(`warnOnInvalidations(${toolName}) - already showing alert`);
    }
  } catch (e) {
    console.warn('warnOnInvalidations() - error getting invalid checks', e);
  }
};
