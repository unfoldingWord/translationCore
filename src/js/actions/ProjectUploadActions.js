/* eslint-disable no-async-promise-executor */
/* eslint-disable require-await */
import React from 'react';
import path from 'path-extra';
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
import { delay } from '../common/utils';
import * as ProjectLoadingActions from './MyProjects/ProjectLoadingActions';
import * as ProjectDetailsActions from './ProjectDetailsActions';
import * as MyProjectsActions from './MyProjects/MyProjectsActions';

/**
 * prepare project for upload. Initialize git if necessary and then commit changes to git
 * @param {String} user
 * @param {String} projectName
 * @param {String} projectPath
 * @return {Promise<Repo>}
 */
export async function prepareProjectRepo(user, projectName, projectPath) {
  let repo;

  try {
    console.log('uploadProject: Creating Repo');
    const remoteRepo = await GogsApiHelpers.createRepo(user,
      projectName);
    console.log('uploadProject: Creating Repo Owner URL');
    const remoteUrl = GogsApiHelpers.getRepoOwnerUrl(user,
      remoteRepo.name);
    console.log('uploadProject: Found remote Repo: ' + (remoteRepo.name || 'FAILED'));

    repo = await Repo.open(projectPath, user);
    await repo.addRemote(remoteUrl, 'origin');
    console.log('uploadProject: saving changes to git');
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
  console.log('uploadProject: pushing git changes to remote');
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
 * Upload project to door 43, based on currently logged in user.
 * @param {String} projectPath - Path to the project to upload
 * @param {Object} user - currently logged in user
 * @param {Boolean} onLine - if undefined in function call it will equal to
 * navigator.onLine. This is useful to unit test.
 */
export function uploadProject(projectPath, user, onLine = navigator.onLine) {
  return (dispatch, getState) => new Promise(async (resolve) => {
    const translate = getTranslate(getState());
    console.log('uploadProject: attempting to upload: ' + projectPath);
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
          console.log('uploadProject: saving alignments');
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
            console.log('uploadProject: upload success');
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
                </div>
              )
            );
          }
        } catch (err) {
          // handle server and networking errors
          console.error('uploadProject ERROR', err);

          if (err.status === 401) {
            return dispatch(
              AlertModalActions.openAlertDialog(translate('users.session_invalid'), false));
          } else if (err.code === 'ENOTFOUND' ||
              err.toString().includes('connect ETIMEDOUT') ||
              err.toString().includes('INTERNET_DISCONNECTED') ||
              err.toString().includes('unable to access') ||
              err.toString().includes('The remote end hung up')) {
            const message = translate('no_internet');
            dispatch(AlertModalActions.openAlertDialog(message));
          } else if (err.toString().includes(
            'not a simple fast-forward')) {
            const message = translate('projects.upload_modified_error',
              { project_name: projectName, door43: translate('_.door43') });
            dispatch(AlertModalActions.openAlertDialog(message));
          } else if (err.hasOwnProperty('message')) {
            dispatch(AlertModalActions.openAlertDialog(
              translate('projects.uploading_error',
                { error: err.message })));
          } else if (err.hasOwnProperty('data') && err.data) {
            dispatch(AlertModalActions.openAlertDialog(
              translate('projects.uploading_error', { error: err.data })));
          } else {
            dispatch(
              AlertModalActions.openAlertDialog(err.message || err, false));
          }
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
