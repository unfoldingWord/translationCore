/* eslint-disable no-async-promise-executor */
/* eslint-disable require-await */
import React from 'react';
import path from 'path-extra';
import fs from 'fs-extra';
import open from 'open';
// actions
import { getTranslate } from '../selectors';
import * as AlertModalActions from '../actions/AlertModalActions';
import * as OnlineModeConfirmActions from '../actions/OnlineModeConfirmActions';
import * as WordAlignmentActions from '../actions/WordAlignmentActions';
// helpers
import Repo from '../helpers/Repo.js';
import migrateSaveChangesInOldProjects from '../helpers/ProjectMigration/migrateSaveChangesInOldProjects';
import * as GogsApiHelpers from '../helpers/GogsApiHelpers';
import * as FileConversionHelpers from '../helpers/FileConversionHelpers';
import { delay } from '../common/utils';
import * as ProjectLoadingActions from './MyProjects/ProjectLoadingActions';
import * as ProjectDetailsActions from './ProjectDetailsActions';
import * as MyProjectsActions from './MyProjects/MyProjectsActions';

export const GIT_INDEX_LOCK = 'Could not remove git index.lock from repo';

/**
 * makes sure that repo does not have a git index.lock.  If so it tries to remove it.  Throws exception if cannot be removed.
 * @param {string} projectPath
 */
function makeSureRepoUnlocked(projectPath) {
  // check for git index.lock file
  const lockPath = path.join(projectPath, '.git/index.lock');
  let lockExists = false;

  if (fs.existsSync(lockPath)) {
    lockExists = true;
    console.info(`uploadProject: Repo lock file exists: ${lockPath}`);

    try {
      fs.removeSync(lockPath);

      if (!fs.existsSync(lockPath)) { // make sure removed
        lockExists = false;
      }
    } catch (e) {
      console.error(`uploadProject: Error removing lock file: ${lockPath}`, e);
    }
  }

  if (lockExists) {
    console.error(`uploadProject: could not remove lock file: ${lockPath}`);
    // eslint-disable-next-line no-throw-literal
    throw `${GIT_INDEX_LOCK}: ${lockPath}`;
  }
}

/**
 * prepare project for upload. Initialize git if necessary and then commit changes to git
 * @param {String} user
 * @param {String} projectName
 * @param {String} projectPath
 * @return {Promise<Repo>}
 */
export async function prepareProjectRepo(user, projectName, projectPath) {
  let repo;
  makeSureRepoUnlocked(projectPath);

  try {
    console.info('uploadProject: Creating Repo');
    const remoteRepo = await GogsApiHelpers.createRepo(user,
      projectName);
    console.info('uploadProject: Creating Repo Owner URL');
    const remoteUrl = GogsApiHelpers.getRepoOwnerUrl(user,
      remoteRepo.name);
    console.info('uploadProject: Found remote Repo: ' + (remoteRepo.name || 'FAILED'));

    repo = await Repo.open(projectPath, user);
    await repo.addRemote(remoteUrl, 'origin');
    console.info('uploadProject: saving changes to git');
    await repo.save('Commit before upload');
  } catch (err) {
    console.error('Error Preparing Repo', err);
    throw (err);
  }
  return repo;
}

/**
 * push repo to Door43 and catch errors
 * @param {Repo} repo
 * @return {Promise<*>}
 */
export async function pushProjectRepo(repo) {
  console.info('uploadProject: pushing git changes to remote');
  let response = {};

  try {
    await repo.push('origin');
  } catch (err) {
    console.error('push ERROR', err);

    if (err.errors) { // expected upload error type
      response = err; // will handle
    } else {
      throw (err); // don't handle unexpected error here
    }
  }
  return response;
}

/**
 * make sure old project changes are saved to git before modifying
 * @param {String} projectPath - Path to the project to upload
 * @return {Promise<void>}
 */
async function saveChangesInOldProjects(projectPath) {
  try {
    await migrateSaveChangesInOldProjects(projectPath);
  } catch (e) {
    console.error('uploadProject: migrateSaveChangesInOldProjects() - migration error', e);
  }
}

/**
 * convert git error message to localized message and determine if known or unknown
 * @param {String|Object} error
 * @param {Function} translate
 * @param {String} projectName
 * @return {String} message
 */
export function gitErrorToLocalizedPrompt(error, translate, projectName) {
  let { message, isUnknown } = FileConversionHelpers.getLocalizedErrorMessage(error, translate, projectName);

  if (isUnknown) {
    message = translate('unknown_networking_error',
      {
        actions: translate('actions'),
        user_feedback: translate('user_feedback'),
        app_name: translate('_.app_name'),
      });
  }
  return message;
}

/**
 * Upload project to door 43, based on currently logged in user.
 * @param {String} projectPath - Path to the project to upload
 * @param {Object} user - currently logged in user
 * @param {Boolean} onLine - if undefined in function call it will equal to
 * navigator.onLine. This is useful to unit test.
 */
export function uploadProject(projectPath, user, onLine = navigator.onLine) {
  return (dispatch, getState) => new Promise(async (resolve) => {
    const translate = getTranslate(getState());
    console.info('uploadProject: attempting to upload: ' + projectPath);
    dispatch(ProjectLoadingActions.closeProject()); // close any open projects first

    // if no Internet connection is found then alert the user and stop upload process
    if (!onLine) {
      dispatch(AlertModalActions.openAlertDialog(translate('no_internet')));
      resolve();
    } else if (!user.localUser) {
      dispatch(OnlineModeConfirmActions.confirmOnlineAction(async () => {
        dispatch(ProjectDetailsActions.resetProjectDetail()); // clear current project selection
        dispatch(AlertModalActions.closeAlertDialog());
        await delay(500); // for screen to update
        const projectName = projectPath.split(path.sep).pop();

        try {
          if (!user.token) {
            const message = translate('users.session_invalid');
            return dispatch(
              AlertModalActions.openAlertDialog(message, false));
          }
          await delay(500);
          dispatch(showStatus(translate('projects.loading_project_alert')));
          await delay(500);
          await saveChangesInOldProjects(projectPath);
          console.info('uploadProject: saving alignments');
          const filePath = path.join(projectPath, projectName + '.usfm');

          await dispatch(
            WordAlignmentActions.getUsfm3ExportFile(projectPath, filePath));

          const repo = await prepareProjectRepo(user, projectName, projectPath);
          const message = translate('projects.uploading_alert',
            { project_name: projectName, door43: translate('_.door43') });
          dispatch(showStatus(message));
          let response = await pushProjectRepo(repo);

          if (response.errors && response.errors.length) {
            // Handle innocuous errors.
            console.error('uploadProject: push failed', response);
            dispatch(AlertModalActions.openAlertDialog(
              translate('projects.uploading_error',
                { error: response.errors })));
          } else {
            console.info('uploadProject: upload success');
            const userDcsUrl = GogsApiHelpers.getUserDoor43Url(user,
              projectName);

            dispatch(
              AlertModalActions.openAlertDialog(
                <div>
                  <span>
                    {translate('projects.upload_successful_alert', { username: user.username })}&nbsp;
                    <a style={{ cursor: 'pointer' }} onClick={() => {
                      dispatch(
                        OnlineModeConfirmActions.confirmOnlineAction(() => {
                          open(userDcsUrl);
                        }));
                    }}>
                      {userDcsUrl}
                    </a>
                  </span>
                </div>,
              ),
            );
          }
        } catch (err) {
          // handle server and networking errors
          console.error('uploadProject ERROR', err);
          const message = gitErrorToLocalizedPrompt(err, translate, projectName);
          dispatch(AlertModalActions.openAlertDialog(message, false));
          resolve();
        }
        dispatch(MyProjectsActions.getMyProjects()); // update list and deselect this project
      }));
    } else {
      console.warn('uploadProject: User not logged in');
      const message = translate('projects.must_be_logged_in_alert',
        { door43: translate('_.door43') });
      dispatch(AlertModalActions.openAlertDialog(message));
      resolve();
    }
  });
}

export const showStatus = (message) => (async (dispatch) => {
  dispatch(AlertModalActions.openAlertDialog(message, true));
  await delay(500);
});
