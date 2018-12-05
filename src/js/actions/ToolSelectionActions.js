import fs from 'fs-extra';
import path from 'path-extra';
import consts from './ActionTypes';
import * as AlertModalActions from './AlertModalActions';
import * as ProjectDataLoadingActions from './ProjectDataLoadingActions';
import * as ModalActions from './ModalActions';
import {getTranslate} from '../selectors';

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
        dispatch(resetReducersData());
        dispatch({
          type: consts. SET_CURRENT_TOOL_NAME,
          currentToolName
        });
        dispatch({
          type: consts.SET_CURRENT_TOOL_TITLE,
          currentToolTitle: dataObject.title
        });
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
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_DATA });
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_INDEX });
    dispatch({ type: consts.CLEAR_CONTEXT_ID });
    dispatch({ type: consts.CLEAR_ALIGNMENT_DATA });
    dispatch({ type: consts.CLEAR_RESOURCES_REDUCER });
    dispatch({ type: consts.CLEAR_PREVIOUS_FILTERS});
  });
}
