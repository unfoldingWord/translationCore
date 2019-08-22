import React from 'react';
import consts from './ActionTypes';
import path from 'path-extra';
import fs from 'fs-extra';
// actions
import * as AlertModalActions from "./AlertModalActions";
import {
  getTranslate,
  getUsername,
  getProjectSaveLocation,
  getToolCategories,
  getToolsByKey
} from "../selectors";
import {cancelProjectValidationStepper} from "./ProjectImportStepperActions";
import * as ResourcesActions from './ResourcesActions';
// helpers
import * as bibleHelpers from '../helpers/bibleHelpers';
import * as ProjectDetailsHelpers from '../helpers/ProjectDetailsHelpers';
import * as ProjectOverwriteHelpers from "../helpers/ProjectOverwriteHelpers";
import * as GogsApiHelpers from "../helpers/GogsApiHelpers";
import * as ResourcesHelpers from "../helpers/ResourcesHelpers";
import {delay} from "../common/utils";
//reducers
import Repo from '../helpers/Repo.js';
import ProjectAPI from "../helpers/ProjectAPI";
// constants
import {
  PROJECTS_PATH,
  PROJECT_INDEX_FOLDER_PATH,
  WORD_ALIGNMENT,
  TRANSLATION_NOTES
} from '../common/constants';

/**
 * @description Gets the check categories from the filesystem for the project and
 * sets them in the reducer
 * @param {String} toolName - The name of the tool to load check categories from
 * @param {String} projectSaveLocation - The project location to load from
 *                      i.e. ~/translationCore/projects/en_tit_reg
 * @param {String} currentGatewayLanguage
 */
export const loadCurrentCheckCategories = (toolName, projectSaveLocation, currentGatewayLanguage = 'en') => {
  return (dispatch) => {
    const project = new ProjectAPI(projectSaveLocation);
    const availableCheckCategoriesObject = ResourcesHelpers.getAvailableCategories(currentGatewayLanguage, toolName, projectSaveLocation);
    let availableCheckCategories = [];
    Object.keys(availableCheckCategoriesObject)
      .forEach((parentCategory) => {
        availableCheckCategories.push(...availableCheckCategoriesObject[parentCategory]);
      });
    let subCategories = project.getSelectedCategories(toolName);
    subCategories = subCategories.filter((category) => availableCheckCategories.includes(category));
    dispatch(setCategories(subCategories, toolName));
  };
};

/**
 * Sets the categories to be loaded for the tool (parent category only).
 * Note: The categories selections are persisted on a project basis.
 * @param {String} toolName - The tool name.
 * @param {Boolean} isChecked - Is the category checkbox checked or uncheked.
 * @param {array} subcategories - Array of subcategories.
 */
export const updateCategorySelection = (toolName, isChecked, subcategories) => {
  return (dispatch, getState) => {
    const state = getState();
    let previousSelectedSubcategories = getToolCategories(state, toolName);
    // filter out duplicate items from previousSelectedSubcategories
    previousSelectedSubcategories = previousSelectedSubcategories.filter(subcat => !subcategories.includes(subcat));
    const selectedSubcategories = isChecked ? [...subcategories, ...previousSelectedSubcategories] :
      previousSelectedSubcategories.filter(subcategory => !subcategories.includes(subcategory));
    const project = new ProjectAPI(getProjectSaveLocation(state));
    project.setSelectedCategories(toolName, selectedSubcategories);
    dispatch(setCategories(selectedSubcategories, toolName));
    dispatch(getProjectProgressForTools(toolName));
  };
};

/**
 * Sets the subcategories to be loaded for the tool.
 * @param {object} subcategory - subcategory object with id & name fields.
 * e.g. { id: 'figs-apostrophe', name: 'Apostrophe' }
 * @param {string} toolName - The tool name.
 * @param {bool} isChecked - Is the subcategory checkbox checked or uncheked.
 */
export const updateSubcategorySelection = (subcategory, toolName, isChecked) => {
  return (dispatch, getState) => {
    let selectedSubcategories = [];
    const state = getState();
    const previousSelectedSubcategories = getToolCategories(state, toolName);
    if (isChecked) {
      const isAlreadyIncluded = previousSelectedSubcategories.includes(subcategory.id);
      if (!isAlreadyIncluded) {
        selectedSubcategories = [...previousSelectedSubcategories];
        selectedSubcategories.push(subcategory.id);
      }
    } else {
      selectedSubcategories = previousSelectedSubcategories.filter(prevSubcategory => prevSubcategory !== subcategory.id);
    }
    const project = new ProjectAPI(getProjectSaveLocation(state));
    project.setSelectedCategories(toolName, selectedSubcategories);
    dispatch(setCategories(selectedSubcategories, toolName));
    dispatch(getProjectProgressForTools(toolName));
  };
};

export const setCategories = (selectedSubcategories, toolName) => ({
  type: consts.SET_CHECK_CATEGORIES,
  selectedSubcategories,
  toolName
});

/**
 * @description sets the project save location in the projectDetailReducer.
 * @param {String} pathLocation - project save location and/or directory.
 * @return {object} action object.
 */
export const setSaveLocation = pathLocation => ({
  type: consts.SET_SAVE_PATH_LOCATION,
  pathLocation
});

export const resetProjectDetail = () => {
  return {
    type: consts.RESET_PROJECT_DETAIL
  };
};

export function setProjectToolGL(toolName, selectedGL) {
  return (dispatch) => {
    if (typeof toolName !== 'string') {
      return Promise.reject(`Expected "toolName" to be a string but received ${typeof toolName} instead`);
    }

    dispatch(ResourcesActions.loadBiblesByLanguageId(selectedGL));
    if (toolName === TRANSLATION_NOTES) { // checks on tN are based on GL, but tW is based on OrigLang so don't need to be updated on GL change
      dispatch(ResourcesHelpers.updateGroupIndexForGl(toolName, selectedGL));
    }

    dispatch({
      type: consts.SET_GL_FOR_TOOL,
      toolName,
      selectedGL
    });
  };
}

/**
 * calculate project progress for specific tool and save results
 * @param {String} toolName
 * @param {Object} results - optional object to return progress calculation
 * @return {Function}
 */
export function getProjectProgressForTools(toolName, results=null) {
  return (dispatch, getState) => {
    const {
      projectDetailsReducer: {
        projectSaveLocation,
        manifest,
        toolsCategories
      }
    } = getState();
    const bookId = manifest.project.id;
    let progress = 0;
    if (typeof toolName !== 'string') {
      return Promise.reject(`Expected "toolName" to be a string but received ${typeof toolName} instead`);
    }
    const pathToCheckDataFiles = path.join(projectSaveLocation, PROJECT_INDEX_FOLDER_PATH, toolName, bookId);
    try {
      if (toolName === WORD_ALIGNMENT) {
        const toolApi = getToolsByKey(getState());
        const currentToolApi = toolApi[toolName].api;
        //TODO: add progress fetch code to checking-tool-wrapper
        progress = currentToolApi.trigger('getProgress');
      } else {
         progress = ProjectDetailsHelpers.getToolProgress(pathToCheckDataFiles, toolName, toolsCategories[toolName], bookId);
      }
    } catch(e) {
      console.error(`getProjectProgressForTools(${toolName} - error getting progress`, e);
      progress = 0;
    }

    if (results) {
      results.progress = progress;
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
  return (async (dispatch, getState) => {
    const {bookId} = getState().projectInformationCheckReducer;
    const {manifest: {project: {id: originalBookId}}, projectSaveLocation} = getState().projectDetailsReducer;
    const {userdata} = getState().loginReducer;
    const bookName = bibleHelpers.convertToFullBookName(bookId);
    dispatch({
      type: consts.SAVE_BOOK_ID_AND_BOOK_NAME_IN_MANIFEST,
      bookId,
      bookName
    });
    if (bookId !== originalBookId) {
      const repo = await Repo.open(projectSaveLocation, userdata);
      await repo.save("Saving new book id");
    }
  });
}

export function setProjectResourceId() {
  return ((dispatch, getState) => {
    const {resourceId} = getState().projectInformationCheckReducer;
    dispatch({
      type: consts.SAVE_RESOURCE_ID_IN_MANIFEST,
      resourceId
    });
  });
}

export function setProjectNickname() {
  return ((dispatch, getState) => {
    const {nickname} = getState().projectInformationCheckReducer;
    dispatch({
      type: consts.SAVE_NICKNAME_IN_MANIFEST,
      nickname
    });
  });
}

export function setLanguageDetails() {
  return ((dispatch, getState) => {
    const {languageDirection, languageId, languageName} = getState().projectInformationCheckReducer;
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
    const {contributors} = getState().projectInformationCheckReducer;
    dispatch({
      type: consts.SAVE_TRANSLATORS_LIST_IN_MANIFEST,
      translators: contributors
    });
  });
}

export function updateCheckers() {
  return ((dispatch, getState) => {
    const {checkers} = getState().projectInformationCheckReducer;
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
  return (dispatch, getState) => {
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
  };
}

/**
 * handle rename prompting
 * @return {function(*, *): Promise<any>}
 */
export function doRenamePrompting() {
  return (async (dispatch, getState) => {
    const {projectDetailsReducer: {projectSaveLocation}, loginReducer: login} = getState();
    const pointsToCurrentUsersRepo = await GogsApiHelpers.hasGitHistoryForCurrentUser(projectSaveLocation, login);
    if (pointsToCurrentUsersRepo) {
      await dispatch(ProjectDetailsHelpers.doDcsRenamePrompting());
    } else { // do not rename on dcs
      await dispatch(ProjectDetailsHelpers.showRenamedDialog());
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
    const {repoNeedsRenaming, newRepoExists, newProjectName} = ProjectDetailsHelpers.shouldProjectNameBeUpdated(manifest, projectSaveLocation);
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
      await dispatch(doRenamePrompting());
    }
  });
}

/**
 * handles the prompting for overwrite/merge of project
 * @return {Promise} - Returns a promise
 */
export function handleOverwriteWarning(newProjectPath, projectName) {
  return (dispatch, getState) => {
    return new Promise(async (resolve) => {
      const translate = getTranslate(getState());
      const confirmText = translate('buttons.overwrite_project');
      const cancelText = translate('buttons.cancel_import_button');
      let overwriteMessage = translate('projects.project_overwrite_has_alignment_message');
      if (!fs.existsSync(path.join(newProjectPath, '.apps'))) {
        overwriteMessage = (
          <div>
            <p>{translate('projects.project_already_exists', {'project_name': projectName})}</p>
            <p>{translate('projects.project_overwrite_no_alignment_message', {over_write: confirmText})}</p>
          </div>
        );
      }
      let hasRunOnce = false; // to prevent multiple click responses
      dispatch(
        AlertModalActions.openOptionDialog(overwriteMessage,
          (result) => {
            if (result === confirmText) {
              dispatch(AlertModalActions.closeAlertDialog());
              if (!hasRunOnce) {
                hasRunOnce = true;
                delay(500).then(() => { // wait for UI to update and alert to close
                  const oldProjectPath = path.join(PROJECTS_PATH, projectName);
                  console.log('handleOverwriteWarning() - doing overwrite/merge');
                  ProjectOverwriteHelpers.mergeOldProjectToNewProject(oldProjectPath, newProjectPath, getUsername(getState()), dispatch);
                  fs.removeSync(oldProjectPath); // don't need the oldProjectPath any more now that .apps was merged in
                  fs.moveSync(newProjectPath, oldProjectPath); // replace it with new project
                  dispatch(setSaveLocation(oldProjectPath));
                });
                resolve(true);
              }
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
  };
}

export function updateProjectTargetLanguageBookFolderName() {
  return ((dispatch, getState) => {
    const {
      projectInformationCheckReducer: {bookId},
      projectDetailsReducer: {projectSaveLocation},
      localImportReducer: {oldSelectedProjectFileName}
    } = getState();
    if (!oldSelectedProjectFileName) {
      console.log("no old selected project File Name");
    } else {
      ProjectDetailsHelpers.updateProjectFolderName(bookId, projectSaveLocation, oldSelectedProjectFileName);
    }
  });
}

/**
 * @description Sends project settings to the store
 * @param {object} settings - settings file of a project.
 * @return {object} action object.
 */
export function setProjectSettings(settings) {
  return {
    type: consts.STORE_PROJECT_SETTINGS,
    settings: settings
  };
}

/**
 * @description adds a new key name to the settings object
 * @param {String} propertyName - key string name.
 * ex.
 * settings {
 *  ...,
 *  [propertyName]: 'value',
 *  ...
 * }
 * @param {*} value - value to be saved in the propertyName
 */
export function addObjectPropertyToSettings(propertyName, value) {
  return {
    type: consts.ADD_PROJECT_SETTINGS_PROPERTY,
    propertyName,
    value
  };
}
