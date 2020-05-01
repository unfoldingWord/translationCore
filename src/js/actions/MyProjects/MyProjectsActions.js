import path from 'path-extra';
import env from 'tc-electron-env';
import fs from 'fs-extra';
import consts from '../ActionTypes';
// helpers
import * as myProjectsHelpers from '../../helpers/myProjectsHelpers';
import { getProjectSaveLocation, getTranslate } from '../../selectors';
import { confirmAction } from '../../middleware/confirmation/confirmationMiddleware';
import { openAlertDialog } from '../AlertModalActions';
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
  const archiveDir = path.join(env.home(), 'translationCore', '.archive');

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
