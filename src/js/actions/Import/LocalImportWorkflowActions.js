/* eslint-disable no-async-promise-executor */
import React from 'react';
import path from 'path-extra';
import { ipcRenderer } from 'electronite';
import consts from '../ActionTypes';
// actions
import * as BodyUIActions from '../BodyUIActions';
import * as AlertModalActions from '../AlertModalActions';
import * as ProjectValidationActions from '../Import/ProjectValidationActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as MyProjectsActions from '../MyProjects/MyProjectsActions';
import * as ProjectLoadingActions from '../MyProjects/ProjectLoadingActions';
import * as ProjectDetailsActions from '../ProjectDetailsActions';
import * as ProjectInformationCheckActions from '../ProjectInformationCheckActions';
// helpers
import * as TargetLanguageHelpers from '../../helpers/TargetLanguageHelpers';
import * as FileConversionHelpers from '../../helpers/FileConversionHelpers';
import {
  getTranslate, getProjectManifest, getProjectSaveLocation, getUsername,
} from '../../selectors';
import * as ProjectDetailsHelpers from '../../helpers/ProjectDetailsHelpers';
import { deleteImportsFolder, deleteProjectFromImportsFolder } from '../../helpers/Import/ProjectImportFilesystemHelpers';
import migrateProject from '../../helpers/ProjectMigration';
import { delay } from '../../common/utils';
// constants
import { IMPORTS_PATH } from '../../common/constants';
import * as ProjectImportFilesystemActions from './ProjectImportFilesystemActions';
export const ALERT_MESSAGE = (
  <div>
    No file was selected. Please click on the
    <span style={{ color: 'var(--accent-color-dark)', fontWeight: 'bold' }}>
      &nbsp;Import Local Project&nbsp;
    </span>
    button again and select the project you want to load.
  </div>
);

/**
 * Action that dispatches other actions to wrap up local importing
 */
export const localImport = () => async (dispatch, getState) => {
  const translate = getTranslate(getState());
  // selectedProjectFilename and sourceProjectPath are populated by selectProjectMoveToImports()
  const {
    selectedProjectFilename,
    sourceProjectPath,
  } = getState().localImportReducer;
  console.log('localImport() - importing project: ' + sourceProjectPath);
  const importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename);

  try {
    await deleteImportsFolder();
    // convert file to tC acceptable project format
    console.log('localImport() - converting project');
    const projectInfo = await FileConversionHelpers.convert(sourceProjectPath, selectedProjectFilename);
    const initialBibleDataFolderName = ProjectDetailsHelpers.getInitialBibleDataFolderName(selectedProjectFilename, importProjectPath);
    await migrateProject(importProjectPath, null, getUsername(getState()));
    console.log('localImport() - start project validation');
    dispatch(ProjectValidationActions.initializeReducersForProjectImportValidation(true, projectInfo.usfmProject));
    await dispatch(ProjectValidationActions.validateProject(importProjectPath));
    const manifest = getProjectManifest(getState());
    const updatedImportPath = getProjectSaveLocation(getState());
    ProjectDetailsHelpers.fixBibleDataFolderName(manifest, initialBibleDataFolderName, updatedImportPath);

    if (!TargetLanguageHelpers.targetBibleExists(updatedImportPath, manifest)) {
      dispatch(AlertModalActions.openAlertDialog(translate('projects.loading_ellipsis'), true));
      console.log('localImport() - generate bible from path: ' + updatedImportPath);
      TargetLanguageHelpers.generateTargetBibleFromTstudioProjectPath(updatedImportPath, manifest);
      dispatch(ProjectInformationCheckActions.setSkipProjectNameCheckInProjectInformationCheckReducer(true));
      dispatch(AlertModalActions.closeAlertDialog());
      console.log('localImport() - validate project');
      await dispatch(ProjectValidationActions.validateProject(updatedImportPath));
    }
    console.log('localImport() - validation done');
    const renamingResults = {};
    await dispatch(ProjectDetailsActions.updateProjectNameIfNecessary(renamingResults));
    const { projectDetailsReducer: { projectSaveLocation } } = getState();

    if (renamingResults.repoRenamed) {
      dispatch({ type: consts.UPDATE_SOURCE_PROJECT_PATH, sourceProjectPath: projectSaveLocation });
      dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename: renamingResults.newRepoName });
    }

    let success = false;

    if (ProjectDetailsHelpers.doesProjectAlreadyExist(renamingResults.newRepoName)) {
      success = await dispatch(ProjectDetailsActions.handleOverwriteWarning(projectSaveLocation, renamingResults.newRepoName));
      await delay(200);
    } else {
      await dispatch(ProjectImportFilesystemActions.move());

      if (renamingResults.repoRenamed) {
        await dispatch(ProjectDetailsActions.doRenamePrompting());
      }
      success = true;
    }

    if (success) {
      dispatch(MyProjectsActions.getMyProjects());

      // TODO: refactor this localImport method to remove project opening logic so we are not duplicating logic.

      const finalProjectPath = getProjectSaveLocation(getState());
      console.log('localImport() - project import complete: ' + finalProjectPath);
      await dispatch(ProjectLoadingActions.openProject(path.basename(finalProjectPath), true));
      dispatch(AlertModalActions.closeAlertDialog());
      return;
    }
  } catch (error) { // Catch all errors in nested functions above
    console.log('localImport() - ERROR:', error);
    const errorMessage = FileConversionHelpers.getSafeErrorMessage(error, translate('projects.local_import_error', { fromPath: sourceProjectPath, toPath: importProjectPath }));
    dispatch(AlertModalActions.openAlertDialog(errorMessage));
  }
  // Either import was canceled or error occurred. We clean up here.
  // clear last project must be called before any other action.
  // to avoid triggering auto-saving.
  dispatch(ProjectLoadingActions.closeProject());
  dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
  // remove failed project import
  const projectName = getState().localImportReducer.selectedProjectFilename;
  deleteProjectFromImportsFolder(projectName);
  const { projectDetailsReducer: { projectSaveLocation } } = getState();
  deleteProjectFromImportsFolder(projectSaveLocation);
};

/**
 * @description selects a project from the filesystem and moves it to tC imports folder.
 * @param startLocalImport - optional parameter to specify new startLocalImport function (useful for testing).
 * Default is localImport()
 */
export function selectLocalProject(startLocalImport = localImport) {
  return (dispatch, getState) => new Promise(async (resolve) => {
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
        { name: translate('supported_file_types'), extensions: ['usfm', 'sfm', 'txt', 'tstudio', 'tcore'] },
      ],
    };
    let filePaths = ipcRenderer.sendSync('load-local', { options: options });
    dispatch(BodyUIActions.dimScreen(false));

    // if import was cancel then show alert indicating that it was cancel
    if (filePaths && filePaths[0]) {
      dispatch(AlertModalActions.openAlertDialog(translate('projects.importing_local_alert'), true));
      const sourceProjectPath = filePaths[0];
      const selectedProjectFilename = path.parse(sourceProjectPath).base.split('.')[0] || '';
      await delay(100);
      dispatch({ type: consts.UPDATE_SOURCE_PROJECT_PATH, sourceProjectPath });
      dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename });
      await dispatch(startLocalImport());
      resolve();
    } else {
      dispatch(AlertModalActions.closeAlertDialog());
      resolve();
    }
  });
}
