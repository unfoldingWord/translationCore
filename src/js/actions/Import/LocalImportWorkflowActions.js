import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
import { ipcRenderer } from 'electron';
import consts from '../ActionTypes';
// actions
import * as BodyUIActions from './BodyUIActions';
import * as AlertModalActions from './AlertModalActions';
import { migrate } from './ProjectMigrationActions';
import { validate } from './ProjectValidationActions';
import { move } from './ProjectImportFilesystemActions';
// helpers
import * as FileConversionHelpers from '../../helpers/FileConversionHelpers';
// constants
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');

/**
 * @description Action that dispatches other actions to wrap up local importing
 */
export const localImport = () => {
  return((dispatch, getState) => {
    dispatch(selectProjectMoveToImports());
    // selectedProjectFilename and sourceProjectPath is populated by selectProjectMoveToImports()
    const {
      selectedProjectFilename,
      sourceProjectPath
    } = getState().localImportReducer;
    // convert file to tC acceptable project
    FileConversionHelpers.convert(sourceProjectPath, selectedProjectFilename);
    dispatch(migrate());
    dispatch(validate());
    dispatch(move());
  });
};

/**
 * @description selects a project from the filesystem and moves it to tC imports folder.
 * @param sendSync - optional parameter to specify new sendSync function (useful for testing).
 */
export function selectProjectMoveToImports(sendSync=ipcRenderer.sendSync) {
  const ALERT_MESSAGE = (
    <div>
      No file was selected. Please click on the
      <span style={{ color: 'var(--accent-color-dark)', fontWeight: "bold" }}>
        &nbsp;Import Local Project&nbsp;
      </span>
      button again and select the project you want to load.
    </div>
  );
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
      const sourceProjectPath = filePaths[0];
      const selectedProjectFilename = path.parse(sourceProjectPath).base.split('.')[0] || '';
      const projectTempDestinationPath = path.join(IMPORTS_PATH, selectedProjectFilename);

      dispatch(BodyUIActions.dimScreen(false));
      dispatch(AlertModalActions.openAlertDialog(`Importing local project`, true));
      // if import was cancel then show alert indicating that it was cancel
      if (filePaths === undefined || !filePaths[0]) {
        dispatch(AlertModalActions.openAlertDialog(ALERT_MESSAGE));
      } else {
        dispatch({ type: consts.UPDATE_SOURCE_PROJECT_PATH, sourceProjectPath });
        dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename });
        fs.copySync(sourceProjectPath, projectTempDestinationPath);
      }
    },500);
  });
}
