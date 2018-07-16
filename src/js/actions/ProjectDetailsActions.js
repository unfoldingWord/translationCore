import React from 'react';
import consts from './ActionTypes';
import path from 'path-extra';
import fs from 'fs-extra';
import ospath from 'ospath';
import * as bibleHelpers from '../helpers/bibleHelpers';
import * as ProjectDetailsHelpers from '../helpers/ProjectDetailsHelpers';
import * as AlertModalActions from "./AlertModalActions";
import {getTranslate} from "../selectors";
import {cancelProjectValidationStepper} from "./ProjectImportStepperActions";
import * as ProjectOverwriteHelpers from "../helpers/ProjectOverwriteHelpers";
import * as ProjectImportFilesystemActions from "./Import/ProjectImportFilesystemActions";
// constants
const INDEX_FOLDER_PATH = path.join('.apps', 'translationCore', 'index');
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

/**
 * @description sets the project save location in the projectDetailReducer.
 * @param {String} pathLocation - project save location and/or directory.
 * @return {object} action object.
 */
export const setSaveLocation = pathLocation => {
  return((dispatch) => {
    dispatch({
      type: consts.SET_SAVE_PATH_LOCATION,
      pathLocation
    });
  });
};

export const resetProjectDetail = () => {
  return {
    type: consts.RESET_PROJECT_DETAIL
  };
};

export function setProjectToolGL(toolName, selectedGL) {
  return (dispatch) => {
    if(typeof toolName !== 'string') {
      return Promise.reject(`Expected "toolName" to be a string but received ${typeof toolName} instead`);
    }
    dispatch({
      type: consts.SET_GL_FOR_TOOL,
      toolName,
      selectedGL
    });
  };
}

export function getProjectProgressForTools(toolName) {
  return (dispatch, getState) => {
    const {
      projectDetailsReducer: {
        projectSaveLocation,
        manifest
      }
    } = getState();
    const bookId = manifest.project.id;
    let progress = 0;
    if(typeof toolName !== 'string') {
      return Promise.reject(`Expected "toolName" to be a string but received ${typeof toolName} instead`);
    }
    const pathToCheckDataFiles = path.join(projectSaveLocation, INDEX_FOLDER_PATH, toolName, bookId);
    if (toolName === 'wordAlignment') {
      const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);
      progress = ProjectDetailsHelpers.getWordAlignmentProgress(pathToWordAlignmentData, bookId);
    } else {
      progress = ProjectDetailsHelpers.getToolProgress(pathToCheckDataFiles);
    }

    dispatch({
      type: consts.SET_PROJECT_PROGRESS_FOR_TOOL,
      toolName,
      progress
    });
  };
}

/**
 * @description Sends project manifest to the store
 * @param {object} manifest - manifest file of a project.
 * @return {object} action object.
 */
export function setProjectManifest(manifest) {
  return {
    type: consts.STORE_MANIFEST,
    manifest: manifest
  };
}

/**
 * @description adds a new key name to the manifest object
 * @param {String} propertyName - key string name.
 * ex.
 * manifest {
 *  ...,
 *  [propertyName]: 'value',
 *  ...
 * }
 * @param {*} value - value to be saved in the propertyName
 */
export function addObjectPropertyToManifest(propertyName, value) {
  return {
    type: consts.ADD_MANIFEST_PROPERTY,
    propertyName,
    value
  };
}

export function setProjectBookIdAndBookName() {
  return ((dispatch, getState) => {
    const { bookId } = getState().projectInformationCheckReducer;
    const bookName = bibleHelpers.convertToFullBookName(bookId);
    dispatch({
      type: consts.SAVE_BOOK_ID_AND_BOOK_NAME_IN_MANIFEST,
      bookId,
      bookName
    });
  });
}

export function setProjectResourceId() {
  return ((dispatch, getState) => {
    const { resourceId } = getState().projectInformationCheckReducer;
    dispatch({
      type: consts.SAVE_RESOURCE_ID_IN_MANIFEST,
      resourceId
    });
  });
}

export function setProjectNickname() {
  return ((dispatch, getState) => {
    const { nickname } = getState().projectInformationCheckReducer;
    dispatch({
      type: consts.SAVE_NICKNAME_IN_MANIFEST,
      nickname
    });
  });
}

export function setLanguageDetails() {
  return ((dispatch, getState) => {
    const { languageDirection, languageId, languageName } = getState().projectInformationCheckReducer;
    dispatch({
      type: consts.SAVE_LANGUAGE_DETAILS_IN_MANIFEST,
      languageDirection,
      languageId,
      languageName
    });
  });
}

export function updateContributors() {
  return ((dispatch, getState) => {
    const { contributors } = getState().projectInformationCheckReducer;
    dispatch({
      type: consts.SAVE_TRANSLATORS_LIST_IN_MANIFEST,
      translators: contributors
    });
  });
}

export function updateCheckers() {
  return ((dispatch, getState) => {
    const { checkers } = getState().projectInformationCheckReducer;
    dispatch({
      type: consts.SAVE_CHECKERS_LIST_IN_MANIFEST,
      checkers
    });
  });
}

/**
 * Change project name to match spec and handle overwrite warnings
 * @param {String} projectSaveLocation
 * @param {String} newProjectName
 * @return {Promise} - Returns a promise
 */
export function renameProject(projectSaveLocation, newProjectName) {
  return ((dispatch, getState) => {
    return new Promise(async (resolve) => {
      const projectPath = path.dirname(projectSaveLocation);
      const currentProjectName = path.basename(projectSaveLocation);
      const newProjectPath = path.join(projectPath, newProjectName);
      if (!fs.existsSync(newProjectPath)) {
        ProjectDetailsHelpers.updateProjectFolderName(newProjectName, projectPath, currentProjectName);
        dispatch(setSaveLocation(newProjectPath));
        resolve();
      }
      else { // project name already exists
        const translate = getTranslate(getState());
        const cancelText = translate('buttons.cancel_import_button');
        const continueText = translate('buttons.continue_import_button');
        dispatch(
          AlertModalActions.openOptionDialog(translate('projects.cancel_import_alert'),
            (result) => {
              if (result === cancelText) {
                // if 'cancel import' then close
                // alert and cancel import process.
                dispatch(AlertModalActions.closeAlertDialog());
                dispatch(cancelProjectValidationStepper());
              } else {
                // if 'Continue Import' then just close alert
                dispatch(AlertModalActions.closeAlertDialog());
              }
              resolve();
            },
            continueText,
            cancelText
          )
        );
      }
    });
  });
}

/**
 * handle rename prompting
 * @return {function(*, *): Promise<any>}
 */
export function doRenamePrompting() {
  return (async (dispatch, getState) => {
    const { projectDetailsReducer: {projectSaveLocation} } = getState();
    const hasGitRepo = fs.pathExistsSync(path.join(projectSaveLocation, '.git'));
    if (hasGitRepo) {
      // TODO: implement this in DCS renaming PR
      const newProjectName = path.basename(projectSaveLocation);
      dispatch(AlertModalActions.openOptionDialog("Your local project has been named\n  '" + newProjectName + "'.  \nPardon our mess, but DCS renaming to be implemented in future PR", () => {
        dispatch(AlertModalActions.closeAlertDialog());
      } ));
    } else { // no dcs
      dispatch(ProjectDetailsHelpers.showRenamedDialog());
    }
  });
}

/**
 * if project name needs to be updated to match spec, then project is renamed
 * @param {object} results of the renaming
 * @return {function(*, *): Promise<any>}
 */
export function updateProjectNameIfNecessary(results) {
  return (async (dispatch, getState) => {
    results.repoRenamed = false;
    results.repoExists = false;
    results.newRepoName = null;
    const {
      projectDetailsReducer: {manifest, projectSaveLocation}
    } = getState();
    const { repoNeedsRenaming, newRepoExists, newProjectName } = ProjectDetailsHelpers.shouldProjectNameBeUpdated(manifest, projectSaveLocation);
    results.newRepoName = newProjectName;
    if (repoNeedsRenaming) {
      if (newRepoExists) {
        results.repoExists = true;
      } else {
        results.repoRenamed = true;
        await dispatch(renameProject(projectSaveLocation, newProjectName));
      }
    }
  });
}

/**
 * if project name needs to be updated to match spec, then project is renamed
 * @return {function(*, *): Promise<any>}
 */
export function updateProjectNameIfNecessaryAndDoPrompting() {
  return (async (dispatch) => {
    const renamingResults = {};
    await dispatch(updateProjectNameIfNecessary(renamingResults));
    if (renamingResults.repoRenamed) {
      dispatch(doRenamePrompting());
    }
  });
}

/**
 * handles the prompting for overwrite/merge of project
 * @return {Promise} - Returns a promise
 */
export function handleOverwriteWarning(newProjectPath, projectName) {
  return ((dispatch, getState) => {
    return new Promise(async (resolve) => {
      const translate = getTranslate(getState());
      const confirmText = translate('buttons.overwrite_project');
      const cancelText = translate('buttons.cancel_import_button');
      let overwriteMessage = translate('projects.project_overwrite_has_alignment_message');
      if (! fs.existsSync(path.join(newProjectPath, '.apps'))) {
        overwriteMessage = (
          <div>
            <p>{translate('projects.project_already_exists', {'project_name': projectName})}</p>
            <p>{translate('projects.project_overwrite_no_alignment_message', {over_write: confirmText})}</p>
          </div>
        );
      }
      dispatch(
        AlertModalActions.openOptionDialog(overwriteMessage,
          (result) => {
            if (result === confirmText) {
              dispatch(AlertModalActions.closeAlertDialog());
              const oldProjectPath = path.join(PROJECTS_PATH, projectName);
              ProjectOverwriteHelpers.mergeOldProjectToNewProject(oldProjectPath, newProjectPath);
              fs.removeSync(oldProjectPath); // don't need the oldProjectPath any more now that .apps was merged in
              fs.move(newProjectPath, oldProjectPath); // replace it with new project
              resolve(true);
            } else { // if cancel
              dispatch(AlertModalActions.closeAlertDialog());
              resolve(false);
            }
          },
          cancelText,
          confirmText
        )
      );
    });
  });
}

export function updateProjectTargetLanguageBookFolderName() {
  return ((dispatch, getState) => {
    const {
      projectInformationCheckReducer: { bookId },
      projectDetailsReducer: { projectSaveLocation },
      localImportReducer: { oldSelectedProjectFileName }
    } = getState();
    if (!oldSelectedProjectFileName) {
      console.log("no old selected project File Name");
    } else {
      ProjectDetailsHelpers.updateProjectFolderName(bookId, projectSaveLocation, oldSelectedProjectFileName);
    }
  });
}
