import consts from '../../actions/ActionTypes';
import path from 'path-extra';
import ospath from 'ospath';
// actions
import * as ProjectMigrationActions from '../Import/ProjectMigrationActions';
import * as ProjectValidationActions from '../Import/ProjectValidationActions';
import * as ProjectImportFilesystemActions from './ProjectImportFilesystemActions';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as OnlineModeConfirmActions from '../../actions/OnlineModeConfirmActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import * as MyProjectsActions from '../MyProjects/MyProjectsActions';
import * as ProjectLoadingActions from '../MyProjects/ProjectLoadingActions';
// helpers
import * as OnlineImportWorkflowHelpers from '../../helpers/Import/OnlineImportWorkflowHelpers';
import * as CopyrightCheckHelpers from '../../helpers/CopyrightCheckHelpers';
//consts
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');

/**
 * @description Action that dispatches other actions to wrap up online importing
 */
export const onlineImport = () => {
  return ((dispatch, getState) => {
    dispatch(OnlineModeConfirmActions.confirmOnlineAction(async () => {
      try {
        // Must allow online action before starting actions that access the internet
        const link = getState().importOnlineReducer.importLink;
        dispatch(clearLink());
        // TODO: the text should not be set here. It should instead be loaded from the react component.
        // or at least we could pass in the locale key here.
        dispatch(AlertModalActions.openAlertDialog(`Importing ${link} Please wait...`, true));
        const selectedProjectFilename = await OnlineImportWorkflowHelpers.clone(link);
        dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename });
        const importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename);
        ProjectMigrationActions.migrate(importProjectPath, link);
        // assign CC BY-SA license to projects imported from door43
        await CopyrightCheckHelpers.assignLicenseToOnlineImportedProject(importProjectPath);
        await dispatch(ProjectValidationActions.validate(importProjectPath));
        await dispatch(ProjectImportFilesystemActions.move());
        dispatch(MyProjectsActions.getMyProjects());
        await dispatch(ProjectLoadingActions.displayTools());
      } catch (error) {
        // Catch all errors in nested functions above
        if (error.type !== 'div') console.warn(error);
        // clear last project must be called before any other action.
        // to avoid troggering autosaving.
        dispatch(ProjectLoadingActions.clearLastProject());
        dispatch(AlertModalActions.openAlertDialog(error));
        dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
        dispatch({ type: "LOADED_ONLINE_FAILED" });
        // remove failed project import
        dispatch(deleteImportProjectForLink());
      }
    }));
  });
};

/**
 * @description - delete project (for link) from import folder
 * @param {string} link
 */
export function deleteImportProjectForLink() {
  return ((dispatch, getState) => {
    const link = getState().importOnlineReducer.importLink;
    if (link) {
      const gitUrl = OnlineImportWorkflowHelpers.getValidGitUrl(link); // gets a valid git URL for git.door43.org if possible, null if not
      let projectName = OnlineImportWorkflowHelpers.getProjectName(gitUrl);
      if (projectName) {
        dispatch(ProjectImportFilesystemActions.deleteProjectFromImportsFolder(projectName));
      }
    }
  });
}

export function clearLink() {
  return {
    type: consts.IMPORT_LINK,
    importLink: ""
  };
}

export function getLink(importLink) {
  return {
    type: consts.IMPORT_LINK,
    importLink
  };
}
