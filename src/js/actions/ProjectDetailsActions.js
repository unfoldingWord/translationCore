/* eslint-disable no-async-promise-executor */
/* eslint-disable require-await */
import React from 'react';
import path from 'path-extra';
import fs from 'fs-extra';
import { batchActions } from 'redux-batched-actions';
// actions
import {
  getTranslate,
  getUsername,
  getProjectSaveLocation,
  getToolCategories,
  getToolsByKey,
  getToolsSelectedGLs,
  getProjectBookId,
  getToolGlOwner,
} from '../selectors';
import * as HomeScreenActions from '../actions/HomeScreenActions';
import * as OnlineModeConfirmActions from '../actions/OnlineModeConfirmActions';
import { showStatus } from '../actions/ProjectUploadActions';
import * as ProjectInformationCheckActions from '../actions/ProjectInformationCheckActions';
import * as ResourcesActions from '../actions/ResourcesActions';
import { cancelProjectValidationStepper } from '../actions/ProjectImportStepperActions';
import * as AlertModalActions from '../actions/AlertModalActions';
import { prepareToolForLoading } from '../actions/ToolActions';
// helpers
import * as bibleHelpers from '../helpers/bibleHelpers';
import * as ProjectDetailsHelpers from '../helpers/ProjectDetailsHelpers';
import * as ProjectOverwriteHelpers from '../helpers/ProjectOverwriteHelpers';
import * as GogsApiHelpers from '../helpers/GogsApiHelpers';
import * as ResourcesHelpers from '../helpers/ResourcesHelpers';
import { delay } from '../common/utils';
//reducers
import Repo from '../helpers/Repo.js';
import ProjectAPI from '../helpers/ProjectAPI';
// constants
import {
  DEFAULT_OWNER,
  PROJECTS_PATH,
  TRANSLATION_NOTES,
  TRANSLATION_WORDS,
} from '../common/constants';
import consts from './ActionTypes';
import { connectToolApi } from './MyProjects/ProjectLoadingActions';
const CONTINUE = 'CONTINUE';
const RETRY = 'RETRY';
const RESHOW_ERROR = 'RESHOW_ERROR';
const RESHOW_DCS_CHOICE = 'RESHOW_DCS_CHOICE';

/**
 * @description Gets the check categories from the filesystem for the project and
 * sets them in the reducer
 * @param {String} toolName - The name of the tool to load check categories from
 * @param {String} projectSaveLocation - The project location to load from
 *                      i.e. ~/translationCore/projects/en_tit_reg
 * @param {String} currentGatewayLanguage
 * @param {String} owner
 */
export const loadCurrentCheckCategories = (toolName, projectSaveLocation, currentGatewayLanguage = 'en', owner = DEFAULT_OWNER) => (dispatch) => {
  const project = new ProjectAPI(projectSaveLocation);
  const availableCheckCategoriesObject = ResourcesHelpers.getAvailableCategories(currentGatewayLanguage, toolName, projectSaveLocation, {}, owner);
  let availableCheckCategories = [];

  Object.keys(availableCheckCategoriesObject)
    .forEach((parentCategory) => {
      availableCheckCategories.push(...availableCheckCategoriesObject[parentCategory]);
    });

  let subCategories = project.getSelectedCategories(toolName);
  subCategories = subCategories.filter((category) => availableCheckCategories.includes(category));
  dispatch(setCategories(subCategories, toolName));
};

/**
 * Sets the categories to be loaded for the tool (parent category only).
 * Note: The categories selections are persisted on a project basis.
 * @param {String} toolName - The tool name.
 * @param {Boolean} isChecked - Is the category checkbox checked or uncheked.
 * @param {array} subcategories - Array of subcategories.
 */
export const updateCategorySelection = (toolName, isChecked, subcategories) => (dispatch, getState) => {
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

/**
 * Sets the subcategories to be loaded for the tool.
 * @param {object} subcategory - subcategory object with id & name fields.
 * e.g. { id: 'figs-apostrophe', name: 'Apostrophe' }
 * @param {string} toolName - The tool name.
 * @param {bool} isChecked - Is the subcategory checkbox checked or uncheked.
 */
export const updateSubcategorySelection = (subcategory, toolName, isChecked) => (dispatch, getState) => {
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

export const setCategories = (selectedSubcategories, toolName) => ({
  type: consts.SET_CHECK_CATEGORIES,
  selectedSubcategories,
  toolName,
});

/**
 * @description sets the project save location in the projectDetailReducer.
 * @param {String} pathLocation - project save location and/or directory.
 * @return {object} action object.
 */
export const setSaveLocation = pathLocation => ({
  type: consts.SET_SAVE_PATH_LOCATION,
  pathLocation,
});

export const resetProjectDetail = () => ({ type: consts.RESET_PROJECT_DETAIL });

/**
 * updates tool properties
 * @param {string} toolName
 * @return {Promise}
 */
export const updateToolProperties = (toolName) => (dispatch, getState) => {
  console.log(`updateToolProperties(${toolName})`);
  const state = getState();
  const projectSaveLocation = getProjectSaveLocation(state);
  const bookId = getProjectBookId(state);
  const toolApi = getToolsByKey(state);
  const currentToolApi = toolApi[toolName];

  if (currentToolApi) {
    dispatch(connectToolApi(projectSaveLocation, bookId, currentToolApi));
  }
};

/**
 * change GL for tool
 * @param {string} toolName
 * @param {string} selectedGL
 * @param {string} owner
 * @return {(function(*, *): Promise<undefined>)|*}
 */
export function setProjectToolGL(toolName, selectedGL, owner = null) {
  return async (dispatch, getState) => {
    if (typeof toolName !== 'string') {
      return Promise.reject(`Expected "toolName" to be a string but received ${typeof toolName} instead`);
    }

    const state = getState();
    dispatch(ResourcesActions.makeSureBiblesLoadedForTool(null, toolName, selectedGL, owner));
    dispatch(ResourcesActions.loadBiblesByLanguageId(selectedGL, owner));
    const toolsGLs = getToolsSelectedGLs(state);
    const previousGLForTool = toolsGLs[toolName];
    const previousOwnerForTool = getToolGlOwner(state, toolName) || DEFAULT_OWNER;

    if (!owner) {
      owner = previousOwnerForTool;
    }

    const ifGlChanged = (selectedGL !== previousGLForTool) ||
                        (owner !== previousOwnerForTool);

    dispatch({
      type: consts.SET_GL_FOR_TOOL,
      toolName,
      selectedGL,
      selectedOwner: owner,
    });

    if (toolName === TRANSLATION_NOTES && ifGlChanged) { // checks on tN are based on GL, but tW is based on OrigLang so don't need to be updated on GL change
      dispatch(ResourcesHelpers.updateGroupIndexForGl(toolName, selectedGL, owner));
      await dispatch(prepareToolForLoading(toolName));
      dispatch(batchActions([
        { type: consts.OPEN_TOOL, name: null },
      ]));
    } else if (toolName === TRANSLATION_WORDS && (owner !== previousOwnerForTool)) {
      const projectDir = getProjectSaveLocation(state);
      ResourcesHelpers.copyGroupDataToProject(selectedGL, toolName, projectDir, dispatch, true, owner); // copy group data for GL
      await dispatch(prepareToolForLoading(toolName));
      dispatch(batchActions([
        { type: consts.OPEN_TOOL, name: null },
      ]));
    }

    if (ifGlChanged) { // if GL has been changed
      dispatch(updateToolProperties(toolName));
    }
  };
}

/**
 * calculate project progress for specific tool and save results
 * @param {String} toolName
 * @param {Object} results - optional object to return progress calculation
 * @return {Function}
 */
export function getProjectProgressForTools(toolName, results = null) {
  return (dispatch, getState) => {
    let progress = 0;

    if (typeof toolName !== 'string') {
      return Promise.reject(`Expected "toolName" to be a string but received ${typeof toolName} instead`);
    }

    try {
      const toolApi = getToolsByKey(getState());
      const currentToolApi = toolApi[toolName];

      if (currentToolApi && currentToolApi.api) {
        progress = currentToolApi.api.trigger('getProgress') || 0;
      }
    } catch (e) {
      console.error(`getProjectProgressForTools(${toolName} - error getting progress`, e);
      progress = 0;
    }

    if (results) {
      // TODO: This is an antipattern. Should update the state and use the prop coming from the state instead of assigning the result to an argument.
      results.progress = progress;
    }

    dispatch({
      type: consts.SET_PROJECT_PROGRESS_FOR_TOOL,
      toolName,
      progress,
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
    manifest: manifest,
  };
}

/**
 * Adds a new key name to the manifest object
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
    value,
  };
}

export function setProjectBookIdAndBookName() {
  return (async (dispatch, getState) => {
    const { bookId } = getState().projectInformationCheckReducer;
    const { manifest: { project: { id: originalBookId } }, projectSaveLocation } = getState().projectDetailsReducer;
    const { userdata } = getState().loginReducer;
    const bookName = bibleHelpers.convertToFullBookName(bookId);

    dispatch({
      type: consts.SAVE_BOOK_ID_AND_BOOK_NAME_IN_MANIFEST,
      bookId,
      bookName,
    });

    if (bookId !== originalBookId) {
      const repo = await Repo.open(projectSaveLocation, userdata);
      await repo.save('Saving new book id');
    }
  });
}

export function setProjectResourceId() {
  return ((dispatch, getState) => {
    const { resourceId } = getState().projectInformationCheckReducer;

    dispatch({
      type: consts.SAVE_RESOURCE_ID_IN_MANIFEST,
      resourceId,
    });
  });
}

export function setProjectNickname() {
  return ((dispatch, getState) => {
    const { nickname } = getState().projectInformationCheckReducer;

    dispatch({
      type: consts.SAVE_NICKNAME_IN_MANIFEST,
      nickname,
    });
  });
}

export function setLanguageDetails() {
  return ((dispatch, getState) => {
    const {
      languageDirection, languageId, languageName,
    } = getState().projectInformationCheckReducer;

    dispatch({
      type: consts.SAVE_LANGUAGE_DETAILS_IN_MANIFEST,
      languageDirection,
      languageId,
      languageName,
    });
  });
}

export function updateContributors() {
  return ((dispatch, getState) => {
    const { contributors } = getState().projectInformationCheckReducer;

    dispatch({
      type: consts.SAVE_TRANSLATORS_LIST_IN_MANIFEST,
      translators: contributors,
    });
  });
}

export function updateCheckers() {
  return ((dispatch, getState) => {
    const { checkers } = getState().projectInformationCheckReducer;

    dispatch({
      type: consts.SAVE_CHECKERS_LIST_IN_MANIFEST,
      checkers,
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
  return (dispatch, getState) => new Promise(async (resolve) => {
    const projectPath = path.dirname(projectSaveLocation);
    const currentProjectName = path.basename(projectSaveLocation);
    const newProjectPath = path.join(projectPath, newProjectName);

    if (!fs.existsSync(newProjectPath)) {
      ProjectDetailsHelpers.updateProjectFolderName(newProjectName, projectPath, currentProjectName);
      dispatch(setSaveLocation(newProjectPath));
      resolve();
    } else { // project name already exists
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
          cancelText,
        ),
      );
    }
  });
}

/**
 * display prompt that project as been renamed
 * @return {Promise} - Returns a promise
 */
export function showRenamedDialog() {
  return ((dispatch, getState) => {
    const { projectDetailsReducer: { projectSaveLocation } } = getState();
    return new Promise((resolve) => {
      const translate = getTranslate(getState());
      const projectName = path.basename(projectSaveLocation);

      dispatch(AlertModalActions.openOptionDialog(
        translate('projects.renamed_project', { project: projectName }),
        () => {
          dispatch(AlertModalActions.closeAlertDialog());
          resolve();
        },
        translate('buttons.ok_button'),
      ));
    });
  });
}

/**
 * handle rename prompting
 * @return {function(*, *): Promise<any>}
 */
export function doRenamePrompting() {
  return (async (dispatch, getState) => {
    const { projectDetailsReducer: { projectSaveLocation }, loginReducer: login } = getState();
    const pointsToCurrentUsersRepo = await GogsApiHelpers.hasGitHistoryForCurrentUser(projectSaveLocation, login);

    if (pointsToCurrentUsersRepo) {
      let retry = false;

      do {
        const results = await dispatch(doDcsRenamePrompting()); // eslint-disable-line no-await-in-loop
        console.log(`doRenamePrompting() = doDcsRenamePrompting() returned ${results}`);
        retry = (results === RESHOW_DCS_CHOICE);
      } while (retry);
    } else { // just show user their new repo name
      await dispatch(showRenamedDialog());
    }
    await delay(300); // allow UI to update
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
    const { projectDetailsReducer: { manifest, projectSaveLocation } } = getState();
    const {
      repoNeedsRenaming, newRepoExists, newProjectName,
    } = ProjectDetailsHelpers.shouldProjectNameBeUpdated(manifest, projectSaveLocation);
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
  return (dispatch, getState) => new Promise(async (resolve) => {
    const translate = getTranslate(getState());
    const confirmText = translate('buttons.overwrite_project');
    const cancelText = translate('buttons.cancel_import_button');
    let overwriteMessage = translate('projects.project_overwrite_has_alignment_message');

    if (!fs.existsSync(path.join(newProjectPath, '.apps'))) {
      overwriteMessage = (
        <div>
          <p>{translate('projects.project_already_exists', { 'project_name': projectName })}</p>
          <p>{translate('projects.project_overwrite_no_alignment_message', { over_write: confirmText })}</p>
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
        confirmText,
      ),
    );
  });
}

export function updateProjectTargetLanguageBookFolderName() {
  return ((dispatch, getState) => {
    const {
      projectInformationCheckReducer: { bookId },
      projectDetailsReducer: { projectSaveLocation },
      localImportReducer: { oldSelectedProjectFileName },
    } = getState();

    if (!oldSelectedProjectFileName) {
      console.log('no old selected project File Name');
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
    settings: settings,
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
    value,
  };
}

/**
 * handles the renaming on DCS
 * @return {Promise} - Returns a promise that resolves to results
 */
export function doDcsRenamePrompting() {
  return ((dispatch, getState) => {
    const { projectSaveLocation } = getState().projectDetailsReducer;
    console.log(`doDcsRenamePrompting() - start path: ${projectSaveLocation}`);
    return new Promise((resolve, reject) => {
      const translate = getTranslate(getState());
      const renameText = translate('buttons.rename_repo');
      const createNewText = translate('buttons.create_new_repo');
      const projectName = path.basename(projectSaveLocation);

      dispatch(
        AlertModalActions.openOptionDialog(
          translate('projects.dcs_rename_project', { project:projectName, door43: translate('_.door43') }),
          async (result) => {
            const createNew = (result === createNewText);
            dispatch(AlertModalActions.closeAlertDialog());
            await delay(300); // delay for dialog to close

            try {
              const results = await dispatch(handleDcsOperation(createNew));
              console.log(`doDcsRenamePrompting() - handleDcsOperation returned: ${results}`);
              resolve(results);
            } catch (e) {
              console.error('doDcsRenamePrompting() - error');
              console.error(e);
              reject(e);
            }
          },
          renameText,
          createNewText,
          null,
          null,
          true,// making the alert not closeable
        ),
      );
    });
  });
}

/**
 * show user that DCS rename failed, give options.  TRICKY: Loops until user has made final choice. Needed because user
 *    can select to send feedback, which clobbers the dialog shown and when that is resolved we need to reshow dialog
 * @param {String} projectSaveLocation
 * @param {Boolean} createNew - flag that we were doing a create new repo on DCS vs. a rename of the reo
 * @param {Function} showErrorFeedbackDialog_ - for testing
 * @return {Function} - Promise resolves to CONTINUE or RETRY
 */
export function showDcsRenameFailure(projectSaveLocation, createNew, showErrorFeedbackDialog_ = showErrorFeedbackDialog) {
  return ( async (dispatch) => {
    let reShowErrorDialog;
    let results;

    do {
      console.log(`showDcsRenameFailure() - showing alert`);
      reShowErrorDialog = false;
      // eslint-disable-next-line no-await-in-loop
      results = await dispatch(showDcsRenameFailurePromise(projectSaveLocation, createNew, showErrorFeedbackDialog_));
      reShowErrorDialog = (results === RESHOW_ERROR); //TRICKY: if user selected to send feedback, it clobbers the error dialog shown.  Then when that is resolved we need to reshow error dialog
      console.log(`showDcsRenameFailure() - reShowErrorDialog: ${reShowErrorDialog}`);
    } while (reShowErrorDialog);
    console.log(`showDcsRenameFailure() - done`);
    return results;
  });
}

/**
 * core of showDcsRenameFailure - this wraps methods with callbacks into a Promise that we can wait on.
 * @param {String} projectSaveLocation
 * @param {Boolean} createNew - flag that we were doing a create new repo on DCS vs. a rename of the reo
 * @param {Function} showErrorFeedbackDialog_ - for testing
 * @return {Promise<String>} - Promise resolves to CONTINUE, RETRY, or RESHOW_ERROR
 */
function showDcsRenameFailurePromise(projectSaveLocation, createNew, showErrorFeedbackDialog_) {
  return ( (dispatch, getState) => {
    const translate = getTranslate(getState());
    const retryText = translate('buttons.retry');
    const continueText = translate('buttons.continue_button');
    const contactHelpDeskText = translate('buttons.contact_helpdesk');
    const projectName = path.basename(projectSaveLocation);

    return new Promise((resolve) => {
      dispatch(
        AlertModalActions.openOptionDialog(translate(createNew ? 'projects.dcs_create_new_failed' : 'projects.dcs_rename_failed', {
          project: projectName,
          door43: translate('_.door43'),
        }),
        (result) => {
          dispatch(AlertModalActions.closeAlertDialog());

          switch (result) {
          case retryText:
            console.log(`showDcsRenameFailure() - RETRY`);
            resolve(RETRY);
            break;

          case contactHelpDeskText:
            console.log(`showDcsRenameFailure() - showErrorFeedbackDialog`);
            dispatch(showErrorFeedbackDialog_(createNew ? '_.support_dcs_create_new_failed' : '_.support_dcs_rename_failed', () => {
              console.log(`showDcsRenameFailure() - showErrorFeedbackDialog done`);
              resolve(RESHOW_ERROR);
            }));
            break;

          default:
            console.log(`showDcsRenameFailure() - CONTINUE`);
            resolve(CONTINUE);
            break;
          }
        }, retryText, continueText, contactHelpDeskText));
    });
  });
}

/**
 * display the feedback dialog
 * @param {string} translateKey - key of string to use for help desk
 * @param {function} doneCB - callback when feedback dialog closes
 * @return {Function}
 */
export function showErrorFeedbackDialog(translateKey, doneCB = null) {
  return (async (dispatch) => {
    const message = await dispatch(ProjectDetailsHelpers.getFeedbackDetailsForHelpDesk(translateKey));
    dispatch(HomeScreenActions.setErrorFeedbackMessage(message)); // put up feedback dialog
    dispatch(HomeScreenActions.setFeedbackCloseCallback(doneCB));
  });
}

/**
 * perform selected action create new or rename project on DCS to match new name.  This wraps handleDcsOperationCore
 *  with online confirm
 * @param {boolean} createNew - if true then create new DCS project with current name
 * @return {Promise<String>} Promise that resolves to CONTINUE if DCS operation succeeds
 */
export function handleDcsOperation(createNew) {
  return ((dispatch) => new Promise((resolve) => {
    dispatch(OnlineModeConfirmActions.confirmOnlineAction(
      async () => { // on confirmed
        let retry;
        let renameResults;

        do {
          renameResults = await dispatch(handleDcsOperationCore(createNew)); // eslint-disable-line no-await-in-loop
          retry = (renameResults === RETRY);
        } while (retry);
        resolve(renameResults);
      },
      () => {
        console.log('cancelled');
        resolve();
      }, // on cancel
    ));
  }));
}

/***
 * Core of handleDcsOperationCore without the confirm online prompt
 * @param {boolean} createNew - if true then create new DCS project with current name
 * @return {Promise<String>} Promise that resolves to RETRY or anything else interpreted as finished
 */
function handleDcsOperationCore( createNew) {
  return (async (dispatch, getState) => {
    const { userdata } = getState().loginReducer;

    const { projectSaveLocation } = getState().projectDetailsReducer; // refetch since project may have been renamed
    const projectName = path.basename(projectSaveLocation);
    let renameResults = '';
    console.log(`handleDcsOperationCore() - handle DCS rename, createNew: ${createNew}`);

    try {
      const repoExists = await ProjectDetailsHelpers.doesDcsProjectNameAlreadyExist(projectName, userdata);
      console.log(`handleDcsOperationCore() - ${projectName}, repoExists: ${repoExists}`);

      if (repoExists) {
        renameResults = await dispatch(handleDcsRenameCollision(createNew));
      } else { // remote repo does not already exist
        try {
          const translate = getTranslate(getState());

          if (createNew) {
            const message = translate('projects.uploading_alert', { project_name: projectName, door43: translate('_.door43') });
            dispatch(showStatus(message));
            console.log(`handleDcsOperationCore() - creating new repo`);
            await GogsApiHelpers.createNewRepo(projectName, projectSaveLocation, userdata);
          } else { // if rename
            const message = translate('projects.renaming_alert', { project_name: projectName, door43: translate('_.door43') });
            dispatch(showStatus(message));
            console.log(`handleDcsOperationCore() - renaming repo`);
            await GogsApiHelpers.renameRepo(projectName, projectSaveLocation, userdata);
          }
          console.log(`handleDcsOperationCore() - repo operation success`);
          dispatch(AlertModalActions.closeAlertDialog());
          await delay(300); // delay to allow dialog to close
          return (CONTINUE);
        } catch (e) {
          renameResults = await dispatch(showDcsRenameFailure(projectSaveLocation, createNew));
          console.warn(e);
        }
      }
    } catch (e) {
      console.error('handleDcsOperationCore() - exists failure');
      console.error(e);
      renameResults = await dispatch(showDcsRenameFailure(projectSaveLocation, createNew));
    }
    console.log(`handleDcsOperationCore() - handle DCS rename results ${renameResults}`);
    return renameResults;
  });
}

/**
 * handles the prompting for overwrite/merge of project.  Loops until problem has been handled.
 * @param {boolean} createNew - if true then create new DCS project with current name
 * @param {Function} doLocalProjectRenamePrompting_ - for testing can optionally override prompt function
 * @return {Function} - Promise resolves to CONTINUE or RETRY
 */
export function handleDcsRenameCollision(createNew, doLocalProjectRenamePrompting_ = doLocalProjectRenamePrompting) {
  return (async (dispatch) => {
    let reShowErrorDialog;
    let results;

    do {
      results = await dispatch(handleDcsRenameCollisionPromise(createNew, doLocalProjectRenamePrompting_)); // eslint-disable-line no-await-in-loop
      reShowErrorDialog = (results === RESHOW_ERROR);
      console.log(`handleDcsRenameCollision() - reShowErrorDialog: ${reShowErrorDialog}`);
    } while (reShowErrorDialog);
    console.log(`handleDcsRenameCollision() - done`);
    return results;
  });
}

/**
 * display project details screen, then when it is done clean up and do callback
 * @param {String} projectSaveLocation
 * @param {String} projectName
 * @param {Function} callback
 * @return {Promise)
 */
export function doLocalProjectRenamePrompting(projectSaveLocation, projectName, callback) {
  return ((dispatch, getState) => new Promise((resolve) => {
    dispatch(ProjectInformationCheckActions.openOnlyProjectDetailsScreen(projectSaveLocation, false, async () => {
      await dispatch(updateProjectNameIfNecessary({}));
      const translate = getTranslate(getState());
      const message = translate('projects.renaming_alert', { project_name: projectName, door43: translate('_.door43') });
      dispatch(showStatus(message)); // reshow dialog
      await delay(300); // delay to allow UI to update

      if (callback) {
        callback(RESHOW_DCS_CHOICE);
      }
      resolve();
    }));
  }));
}

/**
 * core of handleDcsRenameCollision - wraps functions with callbacks in a Promise
 * @param {boolean} createNew - if true then create new DCS project with current name
 * @param {Function} doLocalProjectRenamePrompting - function to call for rename prompting
 * @return {Promise<String>} Promise resolves to CONTINUE, RETRY, or RESHOW_ERROR
 */
function handleDcsRenameCollisionPromise(createNew, doLocalProjectRenamePrompting) {
  return ((dispatch, getState) => new Promise((resolve) => {
    const translate = getTranslate(getState());
    const renameText = translate('buttons.rename_local');
    const continueText = translate('buttons.do_not_rename');
    const contactHelpDeskText = translate('buttons.contact_helpdesk');
    console.log(`handleDcsRenameCollision() - createNew: ${createNew}`);
    const { projectSaveLocation } = getState().projectDetailsReducer; // refetch since project may have been renamed
    const projectName = path.basename(projectSaveLocation);

    dispatch(
      AlertModalActions.openOptionDialog(translate(createNew ? 'projects.dcs_create_new_conflict' : 'projects.dcs_rename_conflict',
        { project: projectName, door43: translate('_.door43') },
      ),
      (result) => {
        dispatch(AlertModalActions.closeAlertDialog());
        console.log(`handleDcsRenameCollision() result: ${result}`);

        switch (result) {
        case renameText:
          dispatch(doLocalProjectRenamePrompting(projectSaveLocation, projectName, resolve));
          break;

        case contactHelpDeskText:
          dispatch(showErrorFeedbackDialog(createNew ? '_.support_dcs_create_new_conflict' : '_.support_dcs_rename_conflict',
            () => {
              resolve(RESHOW_ERROR);
            }));
          break;

        default:
          resolve(CONTINUE);
          break;
        }
        console.log(`handleDcsRenameCollision() done`);
      },
      renameText,
      continueText,
      contactHelpDeskText,
      ),
    );
  }));
}
