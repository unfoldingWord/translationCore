import React from 'react';
import path from 'path-extra';
import ospath from 'ospath';
import { ipcRenderer } from 'electron';
import consts from '../ActionTypes';
// actions
import * as BodyUIActions from '../BodyUIActions';
import * as AlertModalActions from '../AlertModalActions';
import * as ProjectMigrationActions from '../Import/ProjectMigrationActions';
import * as ProjectValidationActions from '../Import/ProjectValidationActions';
import * as ProjectImportFilesystemActions from './ProjectImportFilesystemActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as MyProjectsActions from '../MyProjects/MyProjectsActions';
import * as ProjectLoadingActions from '../MyProjects/ProjectLoadingActions';
// helpers
import * as FileConversionHelpers from '../../helpers/FileConversionHelpers';
import { getTranslate } from '../../selectors';
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
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');

/**
 * @description Action that dispatches other actions to wrap up local importing
 */
export const localImport = () => {
  return async (dispatch, getState) => {
    const translate = getTranslate(getState());
    try {
      // selectedProjectFilename and sourceProjectPath are populated by selectProjectMoveToImports()
      const {
        selectedProjectFilename,
        sourceProjectPath
      } = getState().localImportReducer;
      // convert file to tC acceptable project format
      await FileConversionHelpers.convert(sourceProjectPath, selectedProjectFilename);
      const importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename);
      ProjectMigrationActions.migrate(importProjectPath);
      await dispatch(ProjectValidationActions.validate(importProjectPath));
      await dispatch(ProjectImportFilesystemActions.move());
      dispatch(MyProjectsActions.getMyProjects());
      await dispatch(ProjectLoadingActions.displayTools());
    } catch (error) {
      const errorMessage = error || translate('import_error'); // default warning if exception is not set
      // Catch all errors in nested functions above
      if (error && (error.type !== 'div')) console.warn(error);
      // clear last project must be called before any other action.
      // to avoid troggering autosaving.
      dispatch(ProjectLoadingActions.clearLastProject());
      dispatch(AlertModalActions.openAlertDialog(errorMessage));
      dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
      // remove failed project import
      dispatch(ProjectImportFilesystemActions.deleteProjectFromImportsFolder());
    }
  };
};

/**
 * @description selects a project from the filesystem and moves it to tC imports folder.
 * @param sendSync - optional parameter to specify new sendSync function (useful for testing).
 * @param startLocalImport - optional parameter to specify new startLocalImport function (useful for testing).
 * Default is localImport()
 */
export function selectLocalProject(startLocalImport = localImport) {
  return (dispatch, getState) => {
    return new Promise((resolve) => {
      const translate = getTranslate(getState());
      dispatch(BodyUIActions.dimScreen(true));
      dispatch(BodyUIActions.toggleProjectsFAB());
      // TODO: the filter name and dialog text should not be set here.
      // we should instead send generic data and load the text in the react component with localization
      // or at least we could insert the locale keys here.
      setTimeout(() => {
        const options = {
          properties: ['openFile'],
          filters: [
            { name: translate('supported_file_types'), extensions: ['usfm', 'sfm', 'txt', 'tstudio', 'tcore'] }
          ]
        };
        let filePaths = ipcRenderer.sendSync('load-local', { options: options });
        dispatch(BodyUIActions.dimScreen(false));
        // if import was cancel then show alert indicating that it was cancel
        if (filePaths && filePaths[0]) {
          dispatch(AlertModalActions.openAlertDialog(translate('home.project.importing_local_project'), true));
          const sourceProjectPath = filePaths[0];
          const selectedProjectFilename = path.parse(sourceProjectPath).base.split('.')[0] || '';
          setTimeout(async () => {
            dispatch({ type: consts.UPDATE_SOURCE_PROJECT_PATH, sourceProjectPath });
            dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename });
            await dispatch(startLocalImport());
            resolve();
          }, 100);
        } else {
          dispatch(AlertModalActions.closeAlertDialog());
          resolve();
        }
      }, 500);
    });
  };
}
