import consts from '../../actions/ActionTypes';
import path from 'path-extra';
import ospath from 'ospath';
import fs from 'fs-extra';
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
import * as TargetLanguageHelpers from '../../helpers/TargetLanguageHelpers';
import * as OnlineImportWorkflowHelpers from '../../helpers/Import/OnlineImportWorkflowHelpers';
import * as CopyrightCheckHelpers from '../../helpers/CopyrightCheckHelpers';
import { getTranslate, getProjectManifest, getProjectSaveLocation } from '../../selectors';
import * as ProjectStructureValidationHelpers from "../../helpers/ProjectValidation/ProjectStructureValidationHelpers";
import * as FileConversionHelpers from '../../helpers/FileConversionHelpers';
import * as ProjectMergeActions from '../ProjectMergeActions';

//consts
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

/**
 * @description Action that dispatches other actions to wrap up online importing
 */
export const onlineImport = () => {
  return (dispatch, getState) => {
    return new Promise(resolve => {
      const translate = getTranslate(getState());
      dispatch(OnlineModeConfirmActions.confirmOnlineAction(async () => {
        let importProjectPath = '';
        let link = '';
        try {
          // Must allow online action before starting actions that access the internet
          link = getState().importOnlineReducer.importLink;
          dispatch(clearLink());
          // or at least we could pass in the locale key here.
          dispatch(AlertModalActions.openAlertDialog(translate('projects.importing_project_alert', {project_url: link}), true));
          const selectedProjectFilename = await OnlineImportWorkflowHelpers.clone(link);
          dispatch({ type: consts.UPDATE_SELECTED_PROJECT_FILENAME, selectedProjectFilename });
          importProjectPath = path.join(IMPORTS_PATH, selectedProjectFilename);
          await ProjectStructureValidationHelpers.ensureSupportedVersion(importProjectPath, translate);
          ProjectMigrationActions.migrate(importProjectPath, link);
          // assign CC BY-SA license to projects imported from door43
          await CopyrightCheckHelpers.assignLicenseToOnlineImportedProject(importProjectPath);
          await dispatch(ProjectValidationActions.validate(importProjectPath));
          const manifest = getProjectManifest(getState());
          const updatedImportPath = getProjectSaveLocation(getState());
          if (!TargetLanguageHelpers.targetBibleExists(updatedImportPath, manifest)) {
            TargetLanguageHelpers.generateTargetBibleFromTstudioProjectPath(updatedImportPath, manifest);
            await delay(200);
            await dispatch(ProjectValidationActions.validate(updatedImportPath));
          }
          const projectName = getState().localImportReducer.selectedProjectFilename;
          const projectPath = path.join(PROJECTS_PATH, projectName);
          if (fs.pathExistsSync(projectPath)) {
            // The project already exists so we handle merging the import data with existing project data,
            // then delete the project dir and then continue the import that copies the import dir to the projects dir
            dispatch(ProjectMergeActions.handleProjectMerge(projectPath, importProjectPath))
            .then(async () => {
              await dispatch(continueImport());
              resolve();
            })
            .catch(error => {
              dispatch(cancelImport(error));
              resolve();
            });
          } else {
            console.log("EHRE");
            await dispatch(continueImport());
            resolve();
          }
        } catch (error) { // Catch all errors in nested functions above
          const errorMessage = FileConversionHelpers.getSafeErrorMessage(error, translate('projects.import_error', {fromPath: link, toPath: importProjectPath}));
          cancelImport(errorMessage);
          resolve();
        }
      }));
    });
  };
};

const continueImport = () => {
  return async dispatch => {
    try {
      await dispatch(ProjectImportFilesystemActions.move());
      dispatch(MyProjectsActions.getMyProjects());
      dispatch(ProjectLoadingActions.displayTools());
    } catch(error) {
      dispatch(cancelImport(error));
    }
  };
};

const cancelImport = errorMessage => {
  return dispatch => {
    if (errorMessage) {
      dispatch({type: "LOADED_ONLINE_FAILED"});
      dispatch(AlertModalActions.openAlertDialog(errorMessage));
    }
    // clear last project must be called before any other action.
    // to avoid troggering autosaving.
    dispatch(ProjectLoadingActions.clearLastProject());
    dispatch(deleteImportProjectForLink());
    dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
  };
};

/**
 * @description - delete project (for link) from import folder
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

function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}
