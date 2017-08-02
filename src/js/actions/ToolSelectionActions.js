import fs from 'fs-extra';
import path from 'path-extra';
import consts from './ActionTypes';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as ProjectLoadingActions from './ProjectLoadingActions';
import * as ModalActions from './ModalActions';
// helpers
import * as LoadHelpers from '../helpers/LoadHelpers';

/**
 * @description Loads the tool into the main app view, and initates the tool Container component.
 * @param {string} moduleFolderName - Folder path of the tool being loaded.
 * @param {string} toolName - name of the current tool being loaded.
 * @return {object} action object.
 */
export function selectTool(moduleFolderName, currentToolName) {
  return ((dispatch) => {
    // TODO: Remove after homescreen implementation
    dispatch(ModalActions.showModalContainer(false))
    dispatch({ type: consts.START_LOADING });
    setTimeout(() => {
      try {
        const modulePath = path.join(moduleFolderName, 'package.json');
        const dataObject = fs.readJsonSync(modulePath);
        const checkArray = LoadHelpers.createCheckArray(dataObject, moduleFolderName);
        dispatch({ type: consts.CLEAR_CURRENT_TOOL_DATA });
        dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_DATA });
        dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_INDEX });
        dispatch({ type: consts.CLEAR_CONTEXT_ID });
        dispatch( {
          type: consts. SET_CURRENT_TOOL_NAME,
          currentToolName
        });
        dispatch({
          type: consts.SET_CURRENT_TOOL_TITLE,
          currentToolTitle: dataObject.title
        });
        dispatch(saveToolViews(checkArray));
        // load project data
        dispatch(ProjectLoadingActions.loadProjectData(currentToolName));
      } catch (e) {
        console.warn(e);
        AlertModalActions.openAlertDialog("Oops! We have encountered a problem setting up your project to be loaded. Please contact Help Desk (help@door43.org) for assistance.");
      }
    }, 100);
  });
}

/**
 * @description Saves tools included module Containers in the store
 * @param {Array} checkArray - Array of the checks that the views should be loaded.
 * @return {object} action object.
 */
export function saveToolViews(checkArray) {
  return (dispatch => {
    for (let module of checkArray) {
      try {
        const viewObj = require(path.join(module.location, 'Container'));
        dispatch({
          type: consts.SAVE_TOOL_VIEW,
          identifier: module.name,
          module: viewObj.view || viewObj.container
        })
      } catch (e) {
        console.log(e);
      }
    }
  });
}