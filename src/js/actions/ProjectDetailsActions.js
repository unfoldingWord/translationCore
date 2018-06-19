import consts from './ActionTypes';
import path from 'path-extra';
import fs from 'fs-extra';
import * as bibleHelpers from '../helpers/bibleHelpers';
import * as ProjectDetailsHelpers from '../helpers/ProjectDetailsHelpers';
import * as AlertModalActions from "./AlertModalActions";
import {getTranslate} from "../selectors";
import * as GogsApiHelpers from "../helpers/GogsApiHelpers";
import {cancelProjectValidationStepper} from "./ProjectImportStepperActions";
import * as ProjectInformationCheckActions from "./ProjectInformationCheckActions";
import {openAlertDialog} from "./AlertModalActions";
import * as OnlineModeConfirmActions from "./OnlineModeConfirmActions";
import git from "../helpers/GitApi";
// constants
const INDEX_FOLDER_PATH = path.join('.apps', 'translationCore', 'index');
const TC_OLD_ORIGIN_KEY = 'tc_oldOrigin';

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
 * returns true if project name needs to be updated to match spec
 * @param {Object} manifest
 * @param {String} projectSaveLocation
 * @return {Object} - {Boolean} repoNeedsRenaming, {Boolean} newRepoExists, {String} newProjectName
 */
export function shouldProjectNameBeUpdated(manifest, projectSaveLocation) {
  let repoNeedsRenaming = false;
  let newRepoExists = false;
  let newProjectName = null;
  if (projectSaveLocation) {
    newProjectName = ProjectDetailsHelpers.generateNewProjectName(manifest);
    const currentProjectName = path.basename(projectSaveLocation);
    repoNeedsRenaming = currentProjectName !== newProjectName;
    const newProjectPath = path.join(path.dirname(projectSaveLocation), newProjectName);
    newRepoExists = fs.existsSync(newProjectPath);
  }
  return { repoNeedsRenaming, newRepoExists, newProjectName };
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
        ProjectDetailsHelpers.updateProjectTargetLanguageBookFolderName(newProjectName, projectPath, currentProjectName);
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
 * handles the renaming on DCS
 * @return {Promise} - Returns a promise
 */
function doDcsRenamePrompting(projectSaveLocation, userdata, manifest) {
  return ((dispatch, getState) => {
    const { projectSaveLocation } = getState().projectDetailsReducer;
    return new Promise(async (resolve) => {
      const translate = getTranslate(getState());
      const renameText = translate('buttons.rename_repo');
      const createNewText = translate('buttons.create_new_repo');
      const projectName = path.basename(projectSaveLocation);
      dispatch(
        AlertModalActions.openOptionDialog(translate('projects.dcs_rename_project', {project:projectName}),
          (result) => {
            const createNew = result === createNewText;
            dispatch(AlertModalActions.closeAlertDialog());
            const {userdata} = getState().loginReducer;
            changeGitToPointToNewRepo(projectSaveLocation, userdata).then(() => {
              dispatch(OnlineModeConfirmActions.confirmOnlineAction(
                () => { // on confirmed
                  const {userdata} = getState().loginReducer;
                  doesDcsProjectNameAlreadyExist(projectSaveLocation, userdata, manifest).then((repoExists) => {
                    if (repoExists) {
                      dispatch(handleDcsRenameCollision()).next(resolve());
                    } else {
                      if (createNew) {

                        // TODO: create new??
                        resolve();
                      } else { // if rename
                        dispatch(AlertModalActions.closeAlertDialog());

                        // TODO: API rename
                        resolve();
                      }
                    }
                  });
                },
                () => { // on cancel
                  resolve();
                }
              ));
            });
          },
          renameText,
          createNewText
        )
      );
    });
  });
}

/**
 * display prompt that project as been renamed
 * @param {String} projectSaveLocation
 * @param {Object} userdata
 * @return {Promise} - Returns a promise
 */
export function changeGitToPointToNewRepo(projectSaveLocation, userdata ) {
  return new Promise((resolve) => {
    const projectGit = git(projectSaveLocation);
    try {
      let oldOrigin = '';
      projectGit.getRemotes(true, (err, remotes) => {
        console.log(remotes && remotes.length.toString());
        if (!err) {
          // no old remote
          let foundRemote = remotes.find((remote) => (remote.name === 'origin'));
          if (!foundRemote) { // if origin not found, try to preserve old
            foundRemote = remotes.find((remote) => (remote.name === TC_OLD_ORIGIN_KEY));
          }
          if (foundRemote && foundRemote.refs) {
            oldOrigin = foundRemote.refs.push || foundRemote.refs.fetch;
          }
          updateGitRemotes(projectSaveLocation, userdata, oldOrigin, projectGit);
        }
        resolve();
      });
    } catch(e) {
      resolve(); // nothing to do - no remotes
    }
  });
}

/**
 * change remote pointers to point to new DCS location
 * @param projectSaveLocation
 * @param userdata
 * @param oldOrigin
 * @param projectGit
 */
export function updateGitRemotes(projectSaveLocation, userdata, oldOrigin, projectGit) {
  const projectName = path.basename(projectSaveLocation);
  const newOrigin = ProjectDetailsHelpers.getUserDoor43GitUrl(userdata.token, projectName);
  if (oldOrigin) {
    projectGit.addRemote(TC_OLD_ORIGIN_KEY, oldOrigin);
  }

  projectGit.addRemote('origin', newOrigin);
}

/**
 * if project name needs to be updated to match spec, then project is renamed
 * @return {Promise} - Returns a promise
 */
export function updateProjectNameIfNecessary() {
  return ((dispatch, getState) => {
    return new Promise(async (resolve) => {
      const {
        projectDetailsReducer: {manifest, projectSaveLocation}
      } = getState();
      const { repoNeedsRenaming, newRepoExists, newProjectName } = shouldProjectNameBeUpdated(manifest, projectSaveLocation);
      if (repoNeedsRenaming) {
        if (newRepoExists) {
          dispatch(handleOverwriteWarning()).then(resolve());
        } else {
          dispatch(renameProject(projectSaveLocation, newProjectName)).then( () => {
            const {
              projectDetailsReducer: { projectSaveLocation },
              loginReducer: userdata } = getState();
            const hasGitRepo = fs.pathExistsSync(path.join(projectSaveLocation,'.git'));
            if (hasGitRepo) {
              dispatch(doDcsRenamePrompting(projectSaveLocation, userdata, manifest)).then(resolve());
            } else { // no dcs
              dispatch(ProjectDetailsHelpers.showRenamedDialog()).then(resolve());
            }
          });
        }
      } else {
        resolve();
      }
    });
  });
}

/**
 * handles the prompting for overwrite/merge of project
 * @return {Promise} - Returns a promise
 */
export function handleDcsRenameCollision() {
  return ((dispatch, getState) => {
    const { projectSaveLocation } = getState().projectDetailsReducer;
    return new Promise(async (resolve) => {
      const translate = getTranslate(getState());
      const renameText = translate('buttons.rename_local');
      const continueText = translate('buttons.continue_button');
      const projectName = path.basename(projectSaveLocation);
      dispatch(
        AlertModalActions.openOptionDialog(translate('projects.dcs_rename_conflict', {project:projectName}),
          (result) => {
            dispatch(AlertModalActions.closeAlertDialog());
            if (result === renameText) {
              dispatch(ProjectInformationCheckActions.openOnlyProjectDetailsScreen(projectSaveLocation));
            }
            resolve();
          },
          continueText,
          renameText
        )
      );
    });
  });
}

/**
 * handles the prompting for overwrite/merge of project
 * @return {Promise} - Returns a promise
 */
export function handleOverwriteWarning() {
  return ((dispatch, getState) => {
    const { projectSaveLocation } = getState().projectDetailsReducer;
    return new Promise(async (resolve) => {
      const translate = getTranslate(getState());
      const cancelText = translate('buttons.cancel_import_button');
      const overwriteText = translate('buttons.project_overwrite');
      const projectName = path.basename(projectSaveLocation);
      dispatch(
        AlertModalActions.openOptionDialog(translate('projects.project_already_exists', {over_write: overwriteText, project:projectName}),
          (result) => {
            if (result === overwriteText) {
              dispatch(AlertModalActions.closeAlertDialog());
              dispatch(openAlertDialog("Pardon our mess, overwrite is to be fixed in future PR", false)); // TODO: replace with overwrite merge
              resolve();
            } else { // if cancel
              dispatch(AlertModalActions.closeAlertDialog());
              dispatch(ProjectInformationCheckActions.openOnlyProjectDetailsScreen(projectSaveLocation));
              resolve();
            }
          },
          cancelText,
          overwriteText
        )
      );
    });
  });
}

/**
 *
 * @param projectSaveLocation
 * @param userdata
 * @param manifest
 * @return {Promise<any>} - resolve returns boolean that file exists
 */
export function doesDcsProjectNameAlreadyExist(projectSaveLocation, userdata, manifest) {
  return new Promise((resolve) => {
    const newFilename = ProjectDetailsHelpers.generateNewProjectName(manifest);
    GogsApiHelpers.findRepo(userdata, newFilename).then(repo => {
      const repoExists = !!repo;
      resolve(repoExists);
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
      ProjectDetailsHelpers.updateProjectTargetLanguageBookFolderName(bookId, projectSaveLocation, oldSelectedProjectFileName);
    }
  });
}
