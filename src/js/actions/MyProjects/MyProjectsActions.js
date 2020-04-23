import consts from '../ActionTypes';
// helpers
import * as myProjectsHelpers from '../../helpers/myProjectsHelpers';
import { getTranslate } from '../../selectors';

/**
 * @description With the list of project directories, generates an array of project detail objects
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
 * Moves a project into the archive.
 * Archived projects can be restored at a later time.
 * @param projectPath {string} the path to the project that will be archived.
 */
export const archiveProject = (projectPath) => (dispatch, getState) => {
  const translate = getTranslate(getState());

  dispatch({
    type: 'ARCHIVE_PROJECT',
    path: projectPath,
    meta: {
      shouldConfirm: true,
      message: translate('projects.confirm_archive'),
      confirmButtonText: translate('projects.archive_project'),
    },
  });
};
