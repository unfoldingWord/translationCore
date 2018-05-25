import React from 'react';
import path from 'path-extra';
import ospath from 'ospath';
import {ipcRenderer} from 'electron';
import consts from '../ActionTypes';
import fs from 'fs-extra';
// actions
import * as BodyUIActions from '../BodyUIActions';
import * as AlertModalActions from '../AlertModalActions';
import * as ProjectMigrationActions from '../Import/ProjectMigrationActions';
import * as ProjectValidationActions from '../Import/ProjectValidationActions';
import * as ProjectImportFilesystemActions from './ProjectImportFilesystemActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as MyProjectsActions from '../MyProjects/MyProjectsActions';
import * as ProjectLoadingActions from '../MyProjects/ProjectLoadingActions';
import * as InvalidatedActions from '../InvalidatedActions';
// helpers
import {getTranslate, getProjectManifest} from '../../selectors';
import * as ProjectReimportHelpers from '../../helpers/Import/ProjectReimportHelpers';
import * as UsfmFileConversionHelpers from '../../helpers/FileConversionHelpers/UsfmFileConversionHelpers';
// constants
export const ALERT_MESSAGE = (
  <div>
    No file was selected. Please click on the
    <span style={{color: 'var(--accent-color-dark)', fontWeight: "bold"}}>
      &nbsp;Import Local Project&nbsp;
    </span>
    button again and select the project you want to load.
  </div>
);
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

/**
 * @description Action that dispatches other actions to wrap up local reimporting of a USFM file
 */
export const localReimport = () => {
  return async (dispatch, getState) => {
    const translate = getTranslate(getState());
    const {
      selectedProjectFilename,
      sourceProjectPath
    } = getState().localImportReducer;
    const importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename);
    try {
      debugger;
      await UsfmFileConversionHelpers.convertToProjectFormat(sourceProjectPath, selectedProjectFilename);
      const manifest = getProjectManifest(getState());
      let reimportMessage = translate('projects.project_reimport_usfm3_message');
      if (! fs.existsSync(path.join(importProjectPath, '.apps'))) {
        reimportMessage = (
          <div>
            <p>{translate('projects.project_already_exists', {'project_name': selectedProjectFilename})}</p>
            <p>{translate('projects.project_reimport_usfm2_message')}</p>
          </div>
        );
      }
      dispatch(confirmReimportDialog(reimportMessage, 
        () => { dispatch(continueProjectReimport()) },
        () => { dispatch(cancelProjectReimport()) }
      ));

    } catch (error) {
      const errorMessage = error || translate('projects.reimport_error', {fromPath: sourceProjectPath, toPath: importProjectPath}); // default warning if exception is not set
      // Catch all errors in nested functions above
      if (error && (error.type !== 'div')) console.warn(error);
      // clear last project must be called before any other action.
      // to avoid triggering auto-saving.
      dispatch(ProjectLoadingActions.clearLastProject());
      dispatch(AlertModalActions.openAlertDialog(errorMessage));
      dispatch(cancelProjectReimport());
    }
  };
};

export const cancelProjectReimport = () => {
  return async (dispatch) => {
    return new Promise(async (resolve) => {
      dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
      // remove failed project import
      dispatch(ProjectImportFilesystemActions.deleteProjectFromImportsFolder());
      resolve();
    });
  };
};

export const continueProjectReimport = () => {
  return async (dispatch, getState) => {
    return new Promise(async (resolve) => {
      const {
        selectedProjectFilename
      } = getState().localImportReducer;
      const importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename);
      const projectPath = path.join(PROJECTS_PATH, selectedProjectFilename);

      await dispatch(ProjectReimportHelpers.preserveExistingProjectChecks(selectedProjectFilename, getTranslate(getState())));
      await ProjectMigrationActions.migrate(importProjectPath);
      await dispatch(ProjectValidationActions.validate(importProjectPath));

      await fs.removeSync(projectPath);
      await dispatch(ProjectImportFilesystemActions.move());
      dispatch(MyProjectsActions.getMyProjects());
      await dispatch(ProjectLoadingActions.displayTools());
      await dispatch(InvalidatedActions.getAllInvalidatedChecksForCurrentProject());
      resolve;
    });
  };
};

/**
 * @description selects a project from the filesystem and reimports in into an existing project.
 * @param startLocalImport - optional parameter to specify new startLocalImport function (useful for testing).
 * Default is localImport()
 */
export function reimportProject(projectPath, startLocalReimport = localReimport) {
  return ((dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      const translate = getTranslate(getState());
      const projectName = path.basename(projectPath);
      try {
        //Running migrations before exporting to attempt to fix any invalid alignments/usfm
        ProjectMigrationActions.migrate(projectPath);
        dispatch(BodyUIActions.dimScreen(true));
        await delay(300);

        const options = {
          properties: ['openFile'],
          filters: [
            {name: translate('supported_file_types'), extensions: ['usfm', 'sfm', 'txt']}
          ]
        };

        let filePaths = ipcRenderer.sendSync('load-local', {options: options});

        dispatch(BodyUIActions.dimScreen(false));

        if (filePaths && filePaths[0]) {
          const sourceProjectPath = filePaths[0];
          const selectedProjectFilename = projectName;
          dispatch({type: consts.UPDATE_SOURCE_PROJECT_PATH, sourceProjectPath});
          dispatch({type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename});
          await delay(100);
          await dispatch(localReimport());
          resolve();
        } else {
          dispatch(AlertModalActions.closeAlertDialog());
          resolve();
        }
      } catch (err) {
        if (err) dispatch(AlertModalActions.openAlertDialog(err.message || err, false));
        reject(err);
      }
      dispatch(BodyUIActions.dimScreen(false));
    });
  });
}

/**
 * Displays a confirmation dialog before users access the internet.
 * @param {string} message - the message in the alert box
 * @param {func} onConfirm - callback when the user allows reimport
 * @param {func} onCancel - callback when the user denies reimport
 * @return {Function} - returns a thunk for redux
 */
export function confirmReimportDialog(message, onConfirm, onCancel) {
  return ((dispatch, getState) => {
    const translate = getTranslate(getState());
    const confirmText = translate('buttons.overwrite_project');
    const cancelText = translate('buttons.cancel_button');
    dispatch(AlertModalActions.openOptionDialog(message,
      (result) => {
        if (result !== cancelText) {
          dispatch(AlertModalActions.closeAlertDialog());
          onConfirm();
        } else {
          dispatch(AlertModalActions.closeAlertDialog());
          onCancel();
        }
      }, confirmText, cancelText));
  });
}

function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}
