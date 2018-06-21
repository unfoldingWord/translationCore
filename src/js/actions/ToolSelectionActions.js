import fs from 'fs-extra';
import path from 'path-extra';
import consts from './ActionTypes';
import * as AlertModalActions from './AlertModalActions';
import * as ProjectDataLoadingActions from './ProjectDataLoadingActions';
import * as ModalActions from './ModalActions';
import * as LoadHelpers from '../helpers/LoadHelpers';
import {getTranslate, getToolsMeta} from '../selectors';

/**
 * @description Loads the tool into the main app view, and initiates the tool Container component.
 * @param {string} moduleFolderName - Folder path of the tool being loaded.
 * @param {string} currentToolName - name of the current tool being loaded.
 * @return {object} action object.
 */
export function selectTool(moduleFolderName, currentToolName) {
  return (dispatch, getData) => {
    const translate = getTranslate(getData());
    dispatch(ModalActions.showModalContainer(false));
    dispatch({ type: consts.START_LOADING });
    setTimeout(() => {
      try {
        const modulePath = path.join(moduleFolderName, 'package.json');
        const dataObject = fs.readJsonSync(modulePath);
        const checkArray = LoadHelpers.createCheckArray(dataObject, moduleFolderName);
        dispatch(resetReducersData());
        dispatch({
          type: consts. SET_CURRENT_TOOL_NAME,
          currentToolName
        });
        dispatch({
          type: consts.SET_CURRENT_TOOL_TITLE,
          currentToolTitle: dataObject.title
        });
        dispatch(saveToolViews(checkArray));
        dispatch(loadSupportingToolApis(currentToolName));
        // load project data
        dispatch(ProjectDataLoadingActions.loadProjectData(currentToolName));
      } catch (e) {
        console.warn(e);
        AlertModalActions.openAlertDialog(translate('projects.error_setting_up_project', {email: translate('_.help_desk_email')}));
      }
    }, 100);
  };
}

export function resetReducersData() {
  return (dispatch => {
    dispatch({ type: consts.CLEAR_CURRENT_TOOL_DATA });
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_DATA });
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_INDEX });
    dispatch({ type: consts.CLEAR_CONTEXT_ID });
    dispatch({ type: consts.CLEAR_ALIGNMENT_DATA });
    dispatch({ type: consts.CLEAR_RESOURCES_REDUCER });
    dispatch({ type: consts.CLEAR_PREVIOUS_FILTERS});
  });
}

/**
 * Loads APIs for the supporting tools.
 * For now this is just every tool except for the current one.
 * @param {string} currentToolName - the current tool name
 */
function loadSupportingToolApis(currentToolName) {
  return (dispatch, getState) => {
    const state = getState();
    const meta = getToolsMeta(state);
    for(const toolMeta of meta) {
      if(toolMeta.name === currentToolName) {
        continue;
      }
      try {
        let tool = require(
          path.join(toolMeta.folderName, toolMeta.main)).default;
        // TRICKY: compatibility for older tools
        if ('container' in tool.container && 'name' in tool.container) {
          tool = tool.container;
        }
        if (tool.api) {
          dispatch(registerToolApi(tool.name, tool.api));
        }
      } catch (e) {
        console.error(`Failed to load tool api for ${toolMeta.name}`, toolMeta, e);
      }
    }
  };
}

/**
 * Stores a tool's api
 * @param {string} name - the name of the tool
 * @param {ApiController} api - the tool's api
 * @return {{type: *, name: *, api: *}}
 */
const registerToolApi = (name, api) => ({
  type: consts.ADD_TOOL_API,
  name,
  api
});

/**
 * @description Saves tools included module Containers in the store
 * @param {Array} checkArray - Array of the checks that the views should be loaded.
 * @return {object} action object.
 */
export function saveToolViews(checkArray) {
  return (dispatch => {
    for (let module of checkArray) {
      try {
        let tool = require(path.join(module.location, 'index')).default;
        // TRICKY: compatibility for older tools
        if('container' in tool.container && 'name' in tool.container) {
          tool = tool.container;
        }
        dispatch({
          type: consts.SAVE_TOOL_VIEW,
          identifier: module.name,
          module: tool.container
        });
        if(tool.api) {
          dispatch(registerToolApi(tool.name, tool.api));
        }
      } catch (e) {
        console.error(`Failed to load ${module.name} tool`, e);
      }
    }
  });
}
