import path from 'path-extra';
import fs from 'fs-extra';
// actions
import consts from '../../actions/ActionTypes';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as OnlineModeConfirmActions from '../../actions/OnlineModeConfirmActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as MyProjectsActions from '../MyProjects/MyProjectsActions';
import * as ProjectDetailsActions from '../ProjectDetailsActions';
import * as ProjectInformationCheckActions from '../ProjectInformationCheckActions';
import * as ProjectImportFilesystemActions from '../../actions/Import/ProjectImportFilesystemActions';
import { showStatus } from '../../actions/ProjectUploadActions';
import * as ProjectValidationActions from '../../actions/Import/ProjectValidationActions';
// helpers
import * as TargetLanguageHelpers from '../../helpers/TargetLanguageHelpers';
import {
  generateImportPath,
  verifyThisIsTCoreOrTStudioProject,
} from '../../helpers/Import/OnlineImportWorkflowHelpers';
import * as CopyrightCheckHelpers from '../../helpers/CopyrightCheckHelpers';
import {
  getProjectManifest,
  getProjectSaveLocation,
  getTranslate,
  getUsername,
} from '../../selectors';
import * as FileConversionHelpers from '../../helpers/FileConversionHelpers';
import * as ProjectDetailsHelpers from '../../helpers/ProjectDetailsHelpers';
import migrateProject from '../../helpers/ProjectMigration';
import Repo from '../../helpers/Repo';
import { isProjectSupported } from '../../helpers/ProjectValidation/ProjectStructureValidationHelpers';
import {
  openProject,
  closeProject,
  showInvalidVersionError,
} from '../MyProjects/ProjectLoadingActions';
import { delay } from '../../common/utils';
import { deleteImportsFolder, deleteProjectFromImportsFolder } from '../../helpers/Import/ProjectImportFilesystemHelpers';
//constants
import {
  IMPORTS_PATH,
  PROJECTS_PATH,
  tc_MIN_VERSION_ERROR,
} from '../../common/constants';
import * as ProjectOverwriteHelpers from '../../helpers/ProjectOverwriteHelpers';
import { getManifestFromPath } from '../../helpers/ResourcesHelpers';
import * as manifestUtils from '../../helpers/ProjectMigration/manifestUtils';

/**
 * Downloads a project from a remote Git repository by cloning it to a local directory.
 *
 * @param {string} url - The Git repository URL to clone from (e.g., HTTPS or SSH URL)
 * @param {string} importPath - The local file system path where the repository should be cloned
 * @param {Function} translate - Translation function for localizing error messages
 * @return {Promise<void>} Resolves when the clone operation completes successfully
 * @throws {string} Localized error message if the clone operation fails
 */
async function downloadProject(url, importPath, translate) {
  try {
    await Repo.clone(url, importPath);
  } catch (e) {
    console.error('downloadProject() error', e);
    const message = getLocalizedErrorPrompt(e, url, translate);
    throw message;
  }
}

/**
 * Imports and overwrites an existing local project with an online project from DCS by converting its USFM file.
 * This function handles the complete workflow for overwriting a project that already exists locally by:
 * 1. Verifying the USFM file exists at the expected location
 * 2. Moving the import folder to a temporary location to prevent it from being overwritten during conversion
 * 3. Converting the USFM file to tCore project format
 * 4. Migrating the project to the latest version
 * 5. Validating the converted project
 * 6. Merging the old project's .apps folder with the new project to preserve user data
 * 7. Replacing the old project with the new one
 * 8. Opening the newly imported project
 *
 * @param {Function} dispatch - Redux dispatch function for triggering actions
 * @param {string} importPath - Path to the temporary import directory containing the USFM file
 * @param {string} destProjectName - Name of the destination project (without extension)
 * @param {string} destinationPath - Full path where the project will be saved in the PROJECTS folder (currently unused)
 * @param {Function} translate - Translation function for localizing user-facing messages
 * @param {Function} getState - Redux getState function for accessing current application state
 * @return {Promise<void>} Resolves when the import workflow has been completed and project is opened
 * @throws {Error} If the USFM file does not exist at the expected path, or if any step in the import
 *                 process fails (rethrows the original error after cleanup)
 */
async function overwriteProjectUsfmFromDCS(
  dispatch,
  importPath,
  destProjectName,
  destinationPath,
  translate,
  getState,
) {
  console.log('overwriteProjectUsfmFromDCS - Overwriting project USFM from DCS');
  let usfmFilePath = path.join(importPath, destProjectName + '.usfm');

  if (!fs.existsSync(usfmFilePath)) {
    throw new Error('overwriteProjectUsfmFromDCS - USFM file not found at destination path: ' + usfmFilePath);
  }

  await delay(100);

  try {
    // move the folder to temp spot so it doesn't get clobbered
    const tempFolder = path.join(importPath, '..', 'temp_' + destProjectName);
    fs.moveSync(importPath, tempFolder);
    usfmFilePath = path.join(tempFolder, destProjectName + '.usfm');

    console.log('overwriteProjectUsfmFromDCS() - converting project');
    dispatch(AlertModalActions.openAlertDialog(translate('projects.loading_ellipsis'), true));
    const projectInfo = await FileConversionHelpers.convert(usfmFilePath, destProjectName);
    console.log('overwriteProjectUsfmFromDCS() - converting project', projectInfo);
    const initialBibleDataFolderName = ProjectDetailsHelpers.getInitialBibleDataFolderName(destProjectName, importPath);
    console.log('overwriteProjectUsfmFromDCS() - converting project', initialBibleDataFolderName);
    await migrateProject(importPath, null, getUsername(getState()));

    dispatch({ type: consts.UPDATE_SOURCE_PROJECT_PATH, sourceProjectPath: usfmFilePath });
    dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename: destProjectName });
    await delay(200);

    console.log('overwriteProjectUsfmFromDCS() - doing overwrite/merge - new bible data into existing project');
    const oldProjectPath = path.join(PROJECTS_PATH, destProjectName);
    const sourceManifest = getManifestFromPath(oldProjectPath); // get a copy of the manifest
    ProjectOverwriteHelpers.mergeOldProjectToNewProject(oldProjectPath, importPath, getUsername(getState()), dispatch);
    manifestUtils.saveProjectManifest(oldProjectPath, sourceManifest); // restore the manifest to overwrite the breakage caused by manifest merge in mergeOldProjectToNewProject()
    ProjectOverwriteHelpers.mergeOldProjectToNewProjectExtra(oldProjectPath, importPath);
    const finalProjectPath = oldProjectPath;

    await delay(100);

    console.log('overwriteProjectUsfmFromDCS() - replacing old project with merged project: ' + oldProjectPath + ' with ' + importPath + '');
    fs.removeSync(oldProjectPath); // don't need the oldProjectPath any more now that .apps was merged in
    fs.moveSync(importPath, oldProjectPath); // replace it with new project
    dispatch(AlertModalActions.closeAlertDialog());
    await delay(100);

    dispatch(MyProjectsActions.getMyProjects());
    await delay(100);

    console.log('overwriteProjectUsfmFromDCS() - project import complete: ' + finalProjectPath);
    dispatch(ProjectDetailsActions.setSaveLocation(oldProjectPath));
    await delay(100);

    await dispatch(openProject(path.basename(finalProjectPath), true));
    await delay(100);
    const newMergedManifest = getManifestFromPath(oldProjectPath); // get a copy of the manifest

    if (newMergedManifest !== sourceManifest) {
      console.warn('overwriteProjectUsfmFromDCS - newMergedManifest changed', newMergedManifest, sourceManifest);
    }

    return;
  } catch (error) {
    console.log('overwriteProjectUsfmFromDCS() - ERROR:', error);
    const oldProjectPath = path.join(PROJECTS_PATH, destProjectName);
    const errorMessage = FileConversionHelpers.getSafeErrorMessage(error, translate('projects.local_import_error', {
      fromPath: usfmFilePath,
      toPath: oldProjectPath,
    }));
    console.log('overwriteProjectUsfmFromDCS() - ERROR:', errorMessage);
    dispatch(AlertModalActions.closeAlertDialog());
    await delay(100);
    throw error;
  }
}

/**
 * convert error message to localized message and determine if known or unknown
 * @param {String|Object} error
 * @param {String} projectUrl
 * @param {Function} translate
 * @return {String} message
 */
export function getLocalizedErrorPrompt(error, projectUrl, translate) {
  let { message, isUnknown } = FileConversionHelpers.getLocalizedErrorMessage(error, translate, null);

  if (isUnknown) {
    message = translate('projects.unknown_download_networking_error',
      {
        actions: translate('actions'),
        user_feedback: translate('user_feedback'),
        project_url: projectUrl,
        app_name: translate('_.app_name'),
      });
  } else { // wrap error message with project detail
    message = translate('projects.known_download_networking_error',
      {
        error_message: message,
        project_url: projectUrl,
      });
  }
  return message;
}

/**
 * Action that dispatches other actions to wrap up online importing
 */
export const onlineImport = () => (dispatch, getState) => new Promise((resolve, reject) => {
  const translate = getTranslate(getState());

  dispatch(OnlineModeConfirmActions.confirmOnlineAction(async () => {
    let importProjectPath = '';
    let link = '';

    try {
      await deleteImportsFolder();
      // Must allow online action before starting actions that access the internet
      link = getState().importOnlineReducer.importLink.trim();
      console.log('onlineImport() - link=' + link);

      dispatch(clearLink());
      // or at least we could pass in the locale key here.
      dispatch(AlertModalActions.openAlertDialog(translate('projects.importing_project_alert', { project_url: link }), true));

      const importPath = await generateImportPath(link);
      console.log('onlineImport() - import to: ' + importPath);

      await fs.ensureDir(importPath);
      console.log('onlineImport() - cloning repo into file system');
      await downloadProject(link, importPath, translate);
      const selectedProjectFilename = Repo.parseRemoteUrl(Repo.sanitizeRemoteUrl(link)).name;
      console.log('onlineImport() - selectedProjectFilename= ' + selectedProjectFilename);

      dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename });
      importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename);

      // check if we can import the project
      console.log('onlineImport() - check if we can import the project');
      const isValid = verifyThisIsTCoreOrTStudioProject(importProjectPath);

      if (!isValid) {
        const errorMessage = translate('projects.online_import_error', { project_url: link, toPath: importProjectPath });
        console.warn('This is not a valid tStudio or tCore project we can migrate: ', errorMessage);
        throw errorMessage;
      }

      await isProjectSupported(importProjectPath, translate);
      const initialBibleDataFolderName = ProjectDetailsHelpers.getInitialBibleDataFolderName(selectedProjectFilename, importProjectPath);
      await migrateProject(importProjectPath, link, getUsername(getState()));

      const renamingResults = {};
      await dispatch(ProjectDetailsActions.updateProjectNameIfNecessary(renamingResults));
      const { projectDetailsReducer: { projectSaveLocation } } = getState();
      const destProjectName = renamingResults.repoRenamed ? renamingResults.newRepoName : selectedProjectFilename;
      const destinationPath = path.join(PROJECTS_PATH, destProjectName);
      const projectExists = fs.existsSync(destinationPath);

      if (projectExists) {
        console.log('onlineImport() - project already exists at destination path: ' + destinationPath);
        let success = await dispatch(ProjectDetailsActions.handleOverwriteWarning(projectSaveLocation, destProjectName, null, true));
        await delay(200);

        if (success === 'rename') {
          console.log('onlineImport() - user selected rename project');
          // continue workflow
        } else if (success === true) {
          console.log('onlineImport() - user selected overwrite project');
          await overwriteProjectUsfmFromDCS(dispatch, importPath, destProjectName, destinationPath, translate, getState);
          return resolve();
        } else {
          console.log('onlineImport() - user canceled import');
          throw new Error('User canceled import');
        }
      }

      // assign CC BY-SA license to projects imported from door43
      await CopyrightCheckHelpers.assignLicenseToOnlineImportedProject(importProjectPath);
      console.log('onlineImport() - start project validation');
      dispatch(ProjectValidationActions.initializeReducersForProjectImportValidation(false));
      await dispatch(ProjectValidationActions.validateProject(importProjectPath));
      const manifest = getProjectManifest(getState());
      const updatedImportPath = getProjectSaveLocation(getState());
      ProjectDetailsHelpers.fixBibleDataFolderName(manifest, initialBibleDataFolderName, updatedImportPath);

      if (!TargetLanguageHelpers.targetBibleExists(updatedImportPath, manifest)) {
        dispatch(AlertModalActions.openAlertDialog(translate('projects.loading_ellipsis'), true));
        console.log('onlineImport() - generate target bible');
        TargetLanguageHelpers.generateTargetBibleFromTstudioProjectPath(updatedImportPath, manifest);
        dispatch(ProjectInformationCheckActions.setSkipProjectNameCheckInProjectInformationCheckReducer(true));
        await delay(200);
        dispatch(AlertModalActions.closeAlertDialog());
        console.log('onlineImport() - validate project');
        await dispatch(ProjectValidationActions.validateProject(updatedImportPath));
      }

      if (renamingResults.repoRenamed) {
        dispatch({ type: consts.UPDATE_SOURCE_PROJECT_PATH, sourceProjectPath: projectSaveLocation });
        dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename: renamingResults.newRepoName });
        await delay(200);
      }
      await dispatch(ProjectImportFilesystemActions.move());

      if (renamingResults.repoRenamed) {
        await dispatch(ProjectDetailsActions.doRenamePrompting());
        const message = translate('projects.preparing_project_alert');
        dispatch(showStatus(message)); // reshow  busy dialog after rename prompting
        await delay(300);
      }

      dispatch(MyProjectsActions.getMyProjects());

      // TODO: refactor this onlineImport method to remove project opening logic so we are not duplicating logic.

      const finalProjectPath = getProjectSaveLocation(getState());
      console.log('onlineImport() - project import complete: ' + finalProjectPath);
      await dispatch(openProject(path.basename(finalProjectPath), true));
      dispatch(AlertModalActions.closeAlertDialog());
      return resolve();
    } catch (error) { // Catch all errors in nested functions above
      console.log('onlineImport() - import error:');

      try { // tricky - sometimes see an exception on production build
        console.log(error);
        // eslint-disable-next-line no-empty
      } catch {}

      const errorMessage = FileConversionHelpers.getSafeErrorMessage(error, translate('projects.online_import_error', { project_url: link, toPath: importProjectPath }));
      dispatch(recoverFailedOnlineImport(errorMessage));
      reject(errorMessage);
    }
  }));
});

/**
 * Performs recovery actions to cleanup after a failed online import
 * @param {string} errorMessage - A localized error message to show the user.
 * @returns {Function}
 */
export const recoverFailedOnlineImport = (errorMessage) => (dispatch) => {
  // TRICKY: clear last project first to avoid triggering autos-saving.
  dispatch(closeProject());

  if (errorMessage === tc_MIN_VERSION_ERROR) {
    dispatch(showInvalidVersionError());
  } else {
    dispatch(AlertModalActions.openAlertDialog(errorMessage));
  }
  dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
  dispatch({ type: 'LOADED_ONLINE_FAILED' });
  dispatch(deleteImportProjectForLink());
};

/**
 * Redux thunk action that deletes an imported project folder from the imports directory.
 * Retrieves the import link from the Redux state, parses it to extract the project name,
 * and deletes the corresponding project folder from the imports directory.
 *
 * @description - delete project (for link) from import folder
 * @returns {Function} A Redux thunk function that accepts (dispatch, getState) parameters
 */
export function deleteImportProjectForLink() {
  return ((dispatch, getState) => {
    const link = getState().importOnlineReducer.importLink;

    if (link) {
      const gitUrl = Repo.sanitizeRemoteUrl(link);
      let project = Repo.parseRemoteUrl(gitUrl);

      if (project) {
        deleteProjectFromImportsFolder(project.name);
      }
    }
  });
}

/**
 * Redux action creator that clears the import link from the application state.
 * Dispatches an action to reset the importLink to an empty string.
 *
 * @returns {{type: string, importLink: string}} Redux action object with IMPORT_LINK type and empty importLink
 */
export function clearLink() {
  return {
    type: consts.IMPORT_LINK,
    importLink: '',
  };
}

/**
 * Redux action creator that sets the import link in the application state.
 * Dispatches an action to update the importLink with the provided URL.
 *
 * @param {string} importLink - The Git repository URL to store for importing (e.g., DCS or Door43 URL)
 * @returns {{type: string, importLink: string}} Redux action object with IMPORT_LINK type and the provided importLink
 */
export function getLink(importLink) {
  return {
    type: consts.IMPORT_LINK,
    importLink,
  };
}
