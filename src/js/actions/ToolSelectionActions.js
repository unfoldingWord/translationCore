import fs from 'fs-extra';
import path from 'path-extra';
import consts from './ActionTypes';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as ProjectDataLoadingActions from './ProjectDataLoadingActions';
import * as ModalActions from './ModalActions';
// helpers
import * as LoadHelpers from '../helpers/LoadHelpers';
import {getTranslate}  from '../selectors';

/**
 * @description Loads the tool into the main app view, and initates the tool Container component.
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
        // load project data
        dispatch(ProjectDataLoadingActions.loadProjectData(currentToolName));
      } catch (e) {
        console.warn(e);
        AlertModalActions.openAlertDialog(translate('proejcts.error_setting_up_project', {email: translate('_.help_desk_email')}));
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
        const viewObj = require(path.join(module.location, 'index')).default;
        dispatch({
          type: consts.SAVE_TOOL_VIEW,
          identifier: module.name,
          module: viewObj.container
        });
      } catch (e) {
        console.log(e);
      }
    }
  });
}
