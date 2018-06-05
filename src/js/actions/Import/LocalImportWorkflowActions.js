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
import * as TargetLanguageHelpers from '../../helpers/TargetLanguageHelpers';
import * as FileConversionHelpers from '../../helpers/FileConversionHelpers';
import {getTranslate, getProjectManifest, getProjectSaveLocation} from '../../selectors';
import * as ProjectReimportHelpers from '../../helpers/Import/ProjectReimportHelpers';

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
 * @description Action that dispatches other actions to wrap up local importing
 */
export const localImport = () => {
  return async (dispatch, getState) => {
    const translate = getTranslate(getState());
    // selectedProjectFilename and sourceProjectPath are populated by selectProjectMoveToImports()
    const {
      selectedProjectFilename,
      sourceProjectPath
    } = getState().localImportReducer;
    const importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename);
    try {
      // convert file to tC acceptable project format
      await FileConversionHelpers.convert(sourceProjectPath, selectedProjectFilename);
      ProjectMigrationActions.migrate(importProjectPath);
      await dispatch(ProjectValidationActions.validate(importProjectPath));
      const manifest = getProjectManifest(getState());
      const updatedImportPath = getProjectSaveLocation(getState());
      if (!TargetLanguageHelpers.targetBibleExists(updatedImportPath, manifest)) {
        TargetLanguageHelpers.generateTargetBibleFromTstudioProjectPath(updatedImportPath, manifest);
        await delay(400);
        await dispatch(ProjectValidationActions.validate(updatedImportPath));
      }
      const projectName = getState().localImportReducer.selectedProjectFilename;
      const projectsPath = path.join(PROJECTS_PATH, projectName);
      if (fs.pathExistsSync(projectsPath)) {
        let reimportMessage = translate('projects.project_reimport_usfm3_message');
        if (! fs.existsSync(path.join(updatedImportPath, '.apps'))) {
          reimportMessage = (
            <div>
              <p>{translate('projects.project_already_exists', {'project_name': selectedProjectFilename})}</p>
              <p>{translate('projects.project_reimport_usfm2_message')}</p>
            </div>
          );
        }
        dispatch(confirmReimportDialog(reimportMessage,
          () => { dispatch(handleProjectReimport()) },
          () => { dispatch(cancelImport()) }
        ));
      } else {
        dispatch(continueImport());
      }
    } catch (error) { // Catch all errors in nested functions above
      const errorMessage = FileConversionHelpers.getSafeErrorMessage(error, translate('projects.import_error', {fromPath: sourceProjectPath, toPath: importProjectPath}));
      // clear last project must be called before any other action.
      // to avoid triggering auto-saving.
      dispatch(ProjectLoadingActions.clearLastProject());
      dispatch(AlertModalActions.openAlertDialog(errorMessage));
      dispatch(cancelImport());
    }
  };
};

const handleProjectReimport = () => {
  return async (dispatch, getState) => {
    return new Promise(async (resolve) => {
      const {
        selectedProjectFilename
      } = getState().localImportReducer;
      const projectPath = path.join(PROJECTS_PATH, selectedProjectFilename);
      await dispatch(ProjectReimportHelpers.preserveExistingProjectChecks(selectedProjectFilename, getTranslate(getState())));
      await fs.removeSync(projectPath);
      await dispatch(continueImport());
      resolve;
    });
  };
};

const continueImport = () => {
  return async dispatch => {
    return new Promise(async (resolve) => {
      await dispatch(ProjectImportFilesystemActions.move());
      await dispatch(MyProjectsActions.getMyProjects());
      await dispatch(InvalidatedActions.findInvalidatedSelectionsForAllCheckData());
      await dispatch(ProjectLoadingActions.displayTools());
      resolve();
    });
  };
};

const cancelImport = () => {
  return async (dispatch) => {
    return new Promise(async (resolve) => {
      dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
      // remove failed project import
      dispatch(ProjectImportFilesystemActions.deleteProjectFromImportsFolder());
      resolve();
    });
  };
};

/**
 * @description selects a project from the filesystem and moves it to tC imports folder.
 * @param startLocalImport - optional parameter to specify new startLocalImport function (useful for testing).
 * Default is localImport()
 */
export const selectLocalProject = (startLocalImport = localImport) => {
  return (dispatch, getState) => {
    return new Promise(async (resolve) => {
      const translate = getTranslate(getState());
      dispatch(BodyUIActions.dimScreen(true));
      dispatch(BodyUIActions.closeProjectsFAB());
      // TODO: the filter name and dialog text should not be set here.
      // we should instead send generic data and load the text in the react component with localization
      // or at least we could insert the locale keys here.
      await delay(500);
      const options = {
        properties: ['openFile'],
        filters: [
          {name: translate('supported_file_types'), extensions: ['usfm', 'sfm', 'txt', 'tstudio', 'tcore']}
        ]
      };
      let filePaths = ipcRenderer.sendSync('load-local', {options: options});
      dispatch(BodyUIActions.dimScreen(false));
      // if import was cancel then show alert indicating that it was cancel
      if (filePaths && filePaths[0]) {
        dispatch(AlertModalActions.openAlertDialog(translate('projects.importing_local_alert'), true));
        const sourceProjectPath = filePaths[0];
        const selectedProjectFilename = path.parse(sourceProjectPath).base.split('.')[0] || '';
        await delay(100);
        dispatch({type: consts.UPDATE_SOURCE_PROJECT_PATH, sourceProjectPath});
        dispatch({type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename});
        await dispatch(startLocalImport());
        resolve();
      } else {
        dispatch(AlertModalActions.closeAlertDialog());
        resolve();
      }
    });
  };
};

/**
 * Displays a confirmation dialog before users access the internet.
 * @param {string} message - the message in the alert box
 * @param {func} onConfirm - callback when the user allows reimport
 * @param {func} onCancel - callback when the user denies reimport
 * @return {Function} - returns a thunk for redux
 */
const confirmReimportDialog = (message, onConfirm, onCancel) => {
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
      }, confirmText, cancelText)
    );
  });
};

const delay = (ms) => {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
};
