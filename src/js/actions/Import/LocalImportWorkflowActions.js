import React from 'react';
import path from 'path-extra';
import { ipcRenderer } from 'electron';
import consts from '../ActionTypes';
// actions
import * as BodyUIActions from '../BodyUIActions';
import * as AlertModalActions from '../AlertModalActions';
import { migrate } from './ProjectMigrationActions';
import { validate } from './ProjectValidationActions';
import { move } from './ProjectImportFilesystemActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as ProjectSelectionActions from '../ProjectSelectionActions';
import * as MyProjectsActions from '../MyProjects/MyProjectsActions';
import { displayTools } from '../MyProjects/ProjectLoadingActions';
import * as ProjectDetailsActions from '../ProjectDetailsActions';
// helpers
import * as FileConversionHelpers from '../../helpers/FileConversionHelpers';
// constants
export const ALERT_MESSAGE = (
  <div>
    No file was selected. Please click on the
    <span style={{ color: 'var(--accent-color-dark)', fontWeight: "bold" }}>
      &nbsp;Import Local Project&nbsp;
    </span>
    button again and select the project you want to load.
  </div>
);
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(path.homedir(), 'translationCore', 'projects');

/**
 * @description selects a project from the filesystem and moves it to tC imports folder.
 * @param sendSync - optional parameter to specify new sendSync function (useful for testing).
 *  @param startLocalImport - optional parameter to specify new startLocalImport function (useful for testing).
 *  Default is localImport()
 */
export function selectLocalProject(sendSync = ipcRenderer.sendSync, startLocalImport = localImport) {
  return ((dispatch) => {
    dispatch(BodyUIActions.dimScreen(true));
    dispatch(BodyUIActions.toggleProjectsFAB());
    setTimeout(() => {
      const options = {
        properties: ['openFile'],
        filters: [
          { name: 'Supported File Types', extensions: ['usfm', 'sfm', 'txt', 'tstudio', 'tcore'] }
        ]
      };
      let filePaths = sendSync('load-local', { options: options });
      dispatch(BodyUIActions.dimScreen(false));
      dispatch(AlertModalActions.openAlertDialog(`Importing local project`, true));
      // if import was cancel then show alert indicating that it was cancel
      if (filePaths === undefined || !filePaths[0]) {
        dispatch(AlertModalActions.openAlertDialog(ALERT_MESSAGE));
      } else {
        const sourceProjectPath = filePaths[0];
        const selectedProjectFilename = path.parse(sourceProjectPath).base.split('.')[0] || '';
        setTimeout(() => {
          dispatch({ type: consts.UPDATE_SOURCE_PROJECT_PATH, sourceProjectPath });
          dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename });
          dispatch(startLocalImport());
        }, 100);
      }
    }, 500);
  });
}

/**
 * @description Action that dispatches other actions to wrap up local importing
 */
export const localImport = () => {
  return (async (dispatch, getState) => {
    // selectedProjectFilename and sourceProjectPath is populated by selectProjectMoveToImports()
    const {
      selectedProjectFilename,
      sourceProjectPath
    } = getState().localImportReducer;
    // convert file to tC acceptable project format
    try {
      FileConversionHelpers.convert(sourceProjectPath, selectedProjectFilename);
      dispatch(AlertModalActions.closeAlertDialog());
      const importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename);
      const projectPath = path.join(PROJECTS_PATH, selectedProjectFilename);
      migrate(importProjectPath);
      await dispatch(validate(importProjectPath));
      dispatch(move(selectedProjectFilename));
      dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
      dispatch(MyProjectsActions.getMyProjects());
      dispatch(displayTools());
    } catch (e) {
      await dispatch(AlertModalActions.openAlertDialog(e));
      await dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
      await dispatch(ProjectSelectionActions.clearLastProject());
      dispatch({ type: "LOADED_ONLINE_FAILED" });
    }
  });
};
