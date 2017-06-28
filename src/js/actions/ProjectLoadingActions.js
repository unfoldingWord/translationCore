import path from 'path-extra';
import consts from './ActionTypes';
// actions
import * as TargetLanguageActions from './TargetLanguageActions';
import * as AlertModalActions from './AlertModalActions';
// helpers
import * as ProjectLoadingHelpers from '../helpers/ProjectLoadingHelpers';

/**
 * @description function that handles both getGroupsIndex and
 * getGroupData with promises.
 * @param {string} toolName - name of the tool being loaded.
 * @return {object} object action.
 */
export function loadProjectData(toolName) {
  return ((dispatch, getState) => {
    return new Promise((resolve, reject) => {
      let { projectDetailsReducer } = getState();
      let { projectSaveLocation, params } = projectDetailsReducer;
      const dataDirectory = path.join(projectSaveLocation, '.apps', 'translationCore', 'index', toolName);

      dispatch(TargetLanguageActions.generateTargetBible(projectSaveLocation));
      ProjectLoadingHelpers.getGroupsIndex(dispatch, toolName, dataDirectory)
        .then(() => {
          ProjectLoadingHelpers.getGroupData(dispatch, dataDirectory, toolName, params)
          .then(dispatch({ type: consts.TOGGLE_LOADER_MODAL, show: false }))
        });
    })
    .catch(err => {
      console.warn(err);
      AlertModalActions.openAlertDialog("Oops! We have encountered a problem loading your project. Please contact Help Desk (help@door43.org) for assistance.");
    });
  })
}
