import consts from '../ActionTypes';
// helpers
import * as myProjectsHelpers from '../../helpers/myProjectsHelpers';
import {getActiveLocaleLanguage} from "../../selectors";

/**
 * @description With the list of project directories, generates an array of project detail objects
 */
export function getMyProjects() {
  return ((dispatch, getState) => {
    myProjectsHelpers.migrateResourcesFolder();
    const state = getState();
    const { projectDetailsReducer: { projectSaveLocation } } = state;
    const currentLanguage = getActiveLocaleLanguage(state);
    const languageCode = currentLanguage ? currentLanguage.code : null;
    let projects = myProjectsHelpers.getProjectsFromFS(projectSaveLocation, null, languageCode);
    dispatch({
      type: consts.GET_MY_PROJECTS,
      projects: projects
    });
  });
}
