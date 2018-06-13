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
import * as TargetLanguageHelpers from '../../helpers/TargetLanguageHelpers';
import * as OnlineImportWorkflowHelpers from '../../helpers/Import/OnlineImportWorkflowHelpers';
import * as CopyrightCheckHelpers from '../../helpers/CopyrightCheckHelpers';
import { getTranslate, getProjectManifest, getProjectSaveLocation } from '../../selectors';
import * as ProjectStructureValidationHelpers from "../../helpers/ProjectValidation/ProjectStructureValidationHelpers";
import * as FileConversionHelpers from '../../helpers/FileConversionHelpers';
//consts
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');

/**
 * @description Action that dispatches other actions to wrap up online importing
 */
export const onlineImport = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
console.log( "onlineImport");
      const translate = getTranslate(getState());
      dispatch(OnlineModeConfirmActions.confirmOnlineAction(async () => {
        let importProjectPath = '';
        let link = '';
        try {
          // Must allow online action before starting actions that access the internet
          link = getState().importOnlineReducer.importLink;
          await dispatch(deleteImportProjectForLink()); 
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
console.log( "onlineImport: about to validate: importP... " + importProjectPath );
          await dispatch(ProjectValidationActions.validate(importProjectPath));
          const manifest = getProjectManifest(getState());
          const updatedImportPath = getProjectSaveLocation(getState());
console.log( "onlineImport: after validate: updatedI..." + updatedImportPath );
          if (!TargetLanguageHelpers.targetBibleExists(updatedImportPath, manifest)) {
            TargetLanguageHelpers.generateTargetBibleFromTstudioProjectPath(updatedImportPath, manifest);
            await delay(200);
            await dispatch(ProjectValidationActions.validate(updatedImportPath));
          }
          await dispatch(ProjectImportFilesystemActions.move());
          dispatch(MyProjectsActions.getMyProjects());
          await dispatch(ProjectLoadingActions.displayTools());
          resolve();
        } catch (error) { // Catch all errors in nested functions above
          const errorMessage = FileConversionHelpers.getSafeErrorMessage(error, translate('projects.import_error', {fromPath: link, toPath: importProjectPath}));
          // clear last project must be called before any other action.
          // to avoid troggering autosaving.
          dispatch(ProjectLoadingActions.clearLastProject());
          dispatch(AlertModalActions.openAlertDialog(errorMessage));
          dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
          dispatch({ type: "LOADED_ONLINE_FAILED" });
          // remove failed project import
          dispatch(deleteImportProjectForLink());
          reject(errorMessage);
        }
      }));
    });
  };
};

/**
 * @description - delete project (for link) from import folder
 */
export const deleteImportProjectForLink = () => {
  return ((dispatch, getState ) => { 
    return new Promise( async(resolve) => {
      try {
        const link = getState().importOnlineReducer.importLink;
console.log( "deleteI...: link: " + link );
        if (link) {
          console.log( "deleteI...: link still there: " + link );
          const gitUrl = OnlineImportWorkflowHelpers.getValidGitUrl(link); // gets a valid git URL for git.door43.org if possible, null if not
          let projectName = OnlineImportWorkflowHelpers.getProjectName(gitUrl);
          if (projectName) {
            await dispatch(ProjectImportFilesystemActions.deleteProjectFromImportsFolder(projectName));
          }
        }
        resolve();
      } catch (e) {
        resolve(e);
      }
    });
  });
};

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
