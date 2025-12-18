import path from 'path-extra';
import env from 'tc-electron-env';
import fs from 'fs-extra';
import zipFolder from 'zip-folder';
import consts from '../ActionTypes';
// helpers
import * as myProjectsHelpers from '../../helpers/myProjectsHelpers';
import { getProjectSaveLocation, getTranslate } from '../../selectors';
import { confirmAction } from '../../middleware/confirmation/confirmationMiddleware';
import { openAlertDialog } from '../AlertModalActions';
import { TC_PATH } from '../../common/constants';
import { loadSettings } from '../../localStorage/loadMethods';
import * as manifestHelpers from '../../helpers/manifestHelpers';
import { getAlignedUsfm } from '../WordAlignmentActions';
import * as WordAlignmentHelpers from '../../helpers/WordAlignmentHelpers';
import { closeProject } from './ProjectLoadingActions';

/**
 * With the list of project directories, generates an array of project detail objects
 * @returns {array} List of projects
 */
export function getMyProjects() {
  return ((dispatch, getState) => {
    myProjectsHelpers.migrateResourcesFolder();
    const state = getState();
    const { projectDetailsReducer: { projectSaveLocation } } = state;
    let projects = myProjectsHelpers.getProjectsFromFS(projectSaveLocation, null);

    dispatch({
      type: consts.GET_MY_PROJECTS,
      projects: projects,
    });
  });
}

/**
 * Moves a project into the archive after the user confirms.
 * Archived projects can be restored at a later time.
 * @param projectPath {string} the path to the project that will be archived.
 */
export const archiveProject = (projectPath) => (dispatch, getState) => {
  const translate = getTranslate(getState());

  // Display confirmation
  dispatch(confirmAction({
    message: translate('projects.confirm_archive'),
    confirmButtonText: translate('projects.archive_project'),
  }, executeArchive(projectPath)));
};

/**
 * Immediately archives a project and removes it from the project list.
 */
const executeArchive = (projectPath) => async (dispatch, getState) => {
  const translate = getTranslate(getState());
  const archiveDir = path.join(env.home(), TC_PATH, '.archive');

  // Close project
  const openedProjectPath = getProjectSaveLocation(getState());

  if (projectPath === openedProjectPath) {
    dispatch(closeProject());
  }

  // Archive project
  try {
    // TRICKY: macOS does not support `:` in file names, so convert them and the macOS `/` to `-`.
    const timestamp = (new Date()).toISOString().replace(/[:/]/g, '_');
    await fs.ensureDir(archiveDir);
    await fs.copy(projectPath, path.join(archiveDir, `${path.basename(projectPath)} (${timestamp})`));
    await fs.remove(projectPath);
  } catch (e) {
    console.error(`Could not archive ${projectPath}`, e);
    dispatch(openAlertDialog(translate('projects.archive_failed')));
    return;
  }

  // Update reducers
  dispatch({
    type: consts.ARCHIVE_PROJECT,
    path: projectPath,
  });

  // Success alert
  dispatch(openAlertDialog(translate('projects.archive_complete')));
};

/**
 * Export the project after the user confirms.
 * Archived projects can be restored at a later time.
 * @param projectPath {string} the path to the project that will be archived.
 */
export const exportProject = (projectPath) => (dispatch, getState) => {
  const translate = getTranslate(getState());

  // Display confirmation
  dispatch(confirmAction({
    message: translate('projects.confirm_export'),
    confirmButtonText: translate('projects.export_project'),
  }, executeExport(projectPath)));
};

/**
 * @description - Zip a folder to zipPath
 * @param {string} folderToZip - path of the project
 * @param {string} zipPath - Path to save the zip file
 */
export const zipFolderToFile = (folderToZip, zipPath) => new Promise((resolve, reject) => {
  zipFolder(folderToZip, zipPath, (err) => {
    if (err) {
      reject('zipFolderToFile() - Could not create zip file.');
    } else {
      resolve(true);
    }
  });
});

/**
 * Immediately archives a project and removes it from the project list.
 */
const executeExport = (projectPath) => async (dispatch, getState) => {
  const translate = getTranslate(getState());
  const archiveDir = path.join(env.home(), TC_PATH, 'export');
  let destinationPath = '';
  const openedProjectPath = getProjectSaveLocation(getState());
  const resources = [];

  // Close project
  if (projectPath === openedProjectPath) {
    dispatch(closeProject());
  }

  // Archive project
  try {
    // TRICKY: macOS does not support `:` in file names, so convert them and the macOS `/` to `-`.
    const timestamp = (new Date()).toISOString().replace(/[:/]/g, '_');
    await fs.ensureDir(archiveDir);
    const projectName = path.basename(projectPath);
    const exportProjectName = `${projectName}-${timestamp}`;
    const exportProjectPath = path.join(archiveDir, exportProjectName);
    await fs.copy(projectPath, exportProjectPath);
    const manifest = manifestHelpers.getProjectManifest(projectPath);

    // add settings to manifest
    const settings = loadSettings();
    manifest.settings = settings;

    // add resources to manifest
    manifest.externalResources = resources;

    // save updated
    const usfm = await getAlignedUsfm(projectPath, manifest);
    const toolsProjectPath = path.join(projectPath, 'tools');
    const usfmFilePath = path.join(toolsProjectPath, projectName + '.usfm');
    WordAlignmentHelpers.writeToFS(usfmFilePath, usfm);

    manifestHelpers.setUpManifest(exportProjectPath, manifest); // save updated manifest

    // zip exported project
    const zipFileName = path.join(archiveDir, exportProjectName + '.zip');
    await zipFolderToFile(exportProjectPath, zipFileName);
    destinationPath = zipFileName;
    await fs.remove(exportProjectPath);
  } catch (e) {
    console.error(`Could not archive ${projectPath}`, e);
    dispatch(openAlertDialog(translate('projects.exportfailed')));
    return;
  }

  // Success alert
  dispatch(openAlertDialog(translate('projects.export_complete', { path: destinationPath })));
};
