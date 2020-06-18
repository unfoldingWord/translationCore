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
import { tc_MIN_VERSION_ERROR, IMPORTS_PATH } from '../../common/constants';

/**
 * try to download project by doing git clone into directory
 * @param {String} url
 * @param {String} importPath
 * @param {Function} translate
 * @return {Promise<void>}
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

      const renamingResults = {};
      await dispatch(ProjectDetailsActions.updateProjectNameIfNecessary(renamingResults));
      const { projectDetailsReducer: { projectSaveLocation } } = getState();

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
      resolve();
    } catch (error) { // Catch all errors in nested functions above
      console.log('onlineImport() - import error:', error);
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
 * TODO: this does not need to be an action.
 * @description - delete project (for link) from import folder
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

export function clearLink() {
  return {
    type: consts.IMPORT_LINK,
    importLink: '',
  };
}

export function getLink(importLink) {
  return {
    type: consts.IMPORT_LINK,
    importLink,
  };
}
