/* eslint-disable no-async-promise-executor */
import path from 'path-extra';
import { batchActions } from 'redux-batched-actions';
import {
  getSourceBook,
  getToolGatewayLanguage,
  getTranslate,
} from '../selectors';
import {
  loadToolsInDir,
  getInvalidCountForTool,
  isInvalidationAlertDisplaying,
} from '../helpers/toolHelper';
import ResourceAPI from '../helpers/ResourceAPI';
import {
  WORD_ALIGNMENT,
  ALERT_SELECTIONS_INVALIDATED_ID,
  ALERT_SELECTIONS_INVALIDATED_MSG,
  ALERT_ALIGNMENTS_RESET_ID,
  ALERT_ALIGNMENTS_RESET_MSG,
  ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG,
} from '../common/constants';
import types from './ActionTypes';
// actions
import * as ModalActions from './ModalActions';
import { openAlertDialog, closeAlertDialog } from './AlertModalActions';
import * as AlertActions from './AlertActions';
import * as BodyUIActions from './BodyUIActions';
import { loadOlderOriginalLanguageResource } from './OriginalLanguageResourcesActions';
import * as ProjectDetailsActions from './ProjectDetailsActions';

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
  }, 50);
};

/**
 * save to project manifest the original lang and gl used for tool checking or alignment
 * @param toolName
 * @param gl
 */
export function saveResourcesUsed(toolName, gl) {
  return (dispatch, getState) => {
    const sourceBook = getSourceBook(getState());
    const sourceVersion = (sourceBook && sourceBook.manifest && sourceBook.manifest.dublin_core && sourceBook.manifest.dublin_core.version) || 'unknown';
    dispatch(ProjectDetailsActions.addObjectPropertyToManifest('tc_orig_lang_check_version_' + toolName, sourceVersion));

    if (toolName !== WORD_ALIGNMENT) {
      const resources = ResourceAPI.default();
      const helpDir = resources.getLatestTranslationHelp(gl, toolName);
      const glVersion = (helpDir && path.basename(helpDir)) || 'unknown';
      dispatch(ProjectDetailsActions.addObjectPropertyToManifest('tc_' + gl + '_check_version_' + toolName, glVersion));
    }
  };
}

/**
 * This function prepares the data needed to load a tool, also
 *  useful for checking the progress of a tool
 * @param {String} toolName - Name of the tool
 */
export function prepareToolForLoading(toolName) {
  return (dispatch, getState) => {
    // Load older version of OL resource if needed by tN tool
    dispatch(loadOlderOriginalLanguageResource(toolName));
    const language = getToolGatewayLanguage(getState(), toolName);
    dispatch(saveResourcesUsed(toolName, language));
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

/**
 * displays warning that selections, alignments, or both have been invalidated
 * @param {boolean} showSelectionInvalidated
 * @param {boolean} showAlignmentsInvalidated
 * @param {Function|Null} callback - optional callback after OK button clicked
 * @return {Function}
 */
export const showInvalidatedWarnings = (showSelectionInvalidated, showAlignmentsInvalidated,
  callback = null) => (dispatch, getState) => {
  let message = null;
  let id = null;

  if (showSelectionInvalidated && showAlignmentsInvalidated) {
    message = ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG;
    id = ALERT_ALIGNMENTS_RESET_ID;
  } else if (showSelectionInvalidated) {
    message = ALERT_SELECTIONS_INVALIDATED_MSG;
    id = ALERT_SELECTIONS_INVALIDATED_ID;
  } else { // (showAlignmentsInvalidated)
    message = ALERT_ALIGNMENTS_RESET_MSG;
    id = ALERT_ALIGNMENTS_RESET_ID;
  }

  const translate = getTranslate(getState());
  dispatch(AlertActions.openIgnorableAlert(id, translate(message), { onConfirm: callback }));
};
