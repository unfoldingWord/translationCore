/* eslint-disable no-async-promise-executor */
/* eslint-disable require-await */
import React from 'react';
import path from 'path-extra';
import fs from 'fs-extra';
import open from 'open';
// actions
import { getTranslate, getUsername } from '../selectors';
import * as AlertModalActions from '../actions/AlertModalActions';
import * as OnlineModeConfirmActions from '../actions/OnlineModeConfirmActions';
import * as WordAlignmentActions from '../actions/WordAlignmentActions';
// helpers
import Repo, {
  convertGitErrorMessage, GIT_ERROR_PUSH_NOT_FF, GIT_ERROR_PUSH_DENIED,
} from '../helpers/Repo.js';
import migrateProject from '../helpers/ProjectMigration';
import {
  getSavedRemote,
  getRemoteRepoHead,
  isCommitInHistory,
  pushRepo,
} from '../helpers/GitApi';
import { mergeLocalIntoRemoteClone } from '../helpers/ProjectSyncHelpers';
import { verifyThisIsTCoreOrTStudioProject } from '../helpers/Import/OnlineImportWorkflowHelpers';
import { isProjectSupported } from '../helpers/ProjectValidation/ProjectStructureValidationHelpers';
import { deleteProjectFromImportsFolder } from '../helpers/Import/ProjectImportFilesystemHelpers';
import { delay } from '../common/utils';
import { IMPORTS_PATH } from '../common/constants';
import * as ProjectLoadingActions from './MyProjects/ProjectLoadingActions';
import * as ProjectDetailsActions from './ProjectDetailsActions';
import * as MyProjectsActions from './MyProjects/MyProjectsActions';
import {
  uploadProject,
  gitErrorToLocalizedPrompt,
  makeSureProjectUnlocked,
  saveChangesInOldProjects,
  showStatus,
} from './ProjectUploadActions';

/**
 * gets the parsed origin remote info for the project
 * @param {String} projectPath
 * @return {Promise<Object|null>} parsed remote info ({owner, name, full_name, host, url}) or null if no origin remote
 */
export async function getProjectRemoteInfo(projectPath) {
  let remote = null;

  try {
    remote = await getSavedRemote(projectPath, 'origin');
  } catch (e) {
    console.warn('getProjectRemoteInfo() - could not read remotes', e);
  }

  const url = remote && remote.refs && (remote.refs.push || remote.refs.fetch);
  const info = Repo.parseRemoteUrl(Repo.sanitizeRemoteUrl(url));

  // TRICKY: the remote url comes from the project's local git config, which is not trusted.
  // Only accept DCS owner/name made of safe characters so they cannot be used to inject shell
  // arguments when later passed to git commands (clone, ls-remote, push).
  const safeName = /^[A-Za-z0-9._-]+$/;

  if (info && (!safeName.test(info.owner) || !safeName.test(info.name))) {
    console.warn('getProjectRemoteInfo() - ignoring remote with unsafe owner/name', info.full_name);
    return null;
  }
  return info;
}

/**
 * shows an option dialog and resolves true if the user picks the confirm option
 * @param {String|Object} message - the dialog message
 * @param {String} confirmText - localized confirm button text
 * @param {String} cancelText - localized cancel button text
 * @return {Function} thunk resolving to boolean
 */
export const confirmSyncPrompt = (message, confirmText, cancelText) => (dispatch) => new Promise((resolve) => {
  dispatch(AlertModalActions.openOptionDialog(message,
    (result) => {
      dispatch(AlertModalActions.closeAlertDialog());
      resolve(result === confirmText);
    },
    confirmText,
    cancelText));
});

/**
 * Sync project with Door43: pulls down the latest changes from the project's Door43 repo,
 * merges them with the local work, and pushes the combined result back.
 * @param {String} projectPath - Path to the project to sync
 * @param {Object} user - currently logged in user
 * @param {Boolean} onLine - if undefined in function call it will equal to
 * navigator.onLine. This is useful to unit test.
 */
export function syncProject(projectPath, user, onLine = navigator.onLine) {
  return (dispatch, getState) => new Promise(async (resolve) => {
    const translate = getTranslate(getState());
    const door43 = translate('_.door43');
    console.info('syncProject: attempting to sync: ' + projectPath);
    dispatch(ProjectLoadingActions.closeProject()); // close any open projects first

    // if no Internet connection is found then alert the user and stop sync process
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
            dispatch(AlertModalActions.openAlertDialog(message, false));
            return resolve();
          }

          // prompts the user to upload the project (as a fallback) and does so if confirmed
          const promptUploadThenResolve = async (messageKey) => {
            const doUpload = await dispatch(confirmSyncPrompt(
              translate(messageKey, { project_name: projectName, door43 }),
              translate('buttons.upload_button'),
              translate('buttons.cancel_button')));

            if (doUpload) {
              await dispatch(uploadProject(projectPath, user, onLine));
            }
            return resolve();
          };

          const remoteInfo = await getProjectRemoteInfo(projectPath);

          if (!remoteInfo) { // project has never been uploaded to Door43
            return promptUploadThenResolve('projects.sync_no_remote_prompt');
          }

          const remoteUrl = remoteInfo.url;

          if (!await Repo.doesRemoteRepoExist(remoteUrl)) { // remote repo was deleted or renamed
            return promptUploadThenResolve('projects.sync_remote_missing_prompt');
          }

          await delay(500);
          dispatch(showStatus(translate('projects.loading_project_alert')));
          // commit local state, same steps as upload
          makeSureProjectUnlocked(projectPath);
          await saveChangesInOldProjects(projectPath);
          console.info('syncProject: saving alignments');
          const usfmPath = path.join(projectPath, projectName + '.usfm');
          await dispatch(WordAlignmentActions.getUsfm3ExportFile(projectPath, usfmPath));
          const repo = await Repo.openSafe(projectPath, user);
          await repo.save('Commit before sync');

          // fast path: if the remote has nothing we don't have, we can just push.
          // An empty remote (no commits) also has nothing to merge, so treat it as an ancestor.
          const remoteHead = await getRemoteRepoHead(remoteUrl);
          const remoteHeadSha = (remoteHead || '').trim().split(/\s+/)[0];
          const remoteIsAncestor = !remoteHeadSha || await isCommitInHistory(projectPath, remoteHeadSha);

          if (!remoteIsAncestor) { // remote has changes we don't have - merge them in
            const confirmed = await dispatch(confirmSyncPrompt(
              translate('projects.sync_merge_confirmation', { project_name: projectName, door43 }),
              translate('buttons.continue_button'),
              translate('buttons.cancel_button')));

            if (!confirmed) {
              console.info('syncProject: sync canceled by user');
              return resolve();
            }

            dispatch(showStatus(translate('projects.syncing_project_alert', { project_name: projectName, door43 })));
            console.info('syncProject: cloning remote project');
            const clonePath = path.join(IMPORTS_PATH, remoteInfo.name);
            deleteProjectFromImportsFolder(remoteInfo.name);
            await fs.ensureDir(IMPORTS_PATH);
            await Repo.clone(remoteUrl, clonePath);

            if (!verifyThisIsTCoreOrTStudioProject(clonePath)) {
              deleteProjectFromImportsFolder(remoteInfo.name);
              // eslint-disable-next-line no-throw-literal
              throw translate('projects.online_import_error', { project_url: remoteUrl, toPath: clonePath });
            }

            await isProjectSupported(clonePath, translate);
            await migrateProject(clonePath, remoteUrl, getUsername(getState()));
            console.info('syncProject: merging local work into remote clone');
            mergeLocalIntoRemoteClone(projectPath, clonePath, getUsername(getState()), dispatch);

            // swap the merged clone into place, keeping a backup of the local project until the swap succeeds
            const backupPath = projectPath + '.sync_backup';

            if (fs.existsSync(backupPath)) {
              fs.removeSync(backupPath);
            }
            fs.moveSync(projectPath, backupPath);

            try {
              fs.moveSync(clonePath, projectPath);
              const mergedRepo = await Repo.openSafe(projectPath, user);
              await mergedRepo.save('Merge with Door43 during sync');
            } catch (e) { // restore the original project on failure
              console.error('syncProject: merge failed, restoring project from backup', e);

              if (fs.existsSync(projectPath)) {
                fs.removeSync(projectPath);
              }
              fs.moveSync(backupPath, projectPath);
              throw e;
            }
            fs.removeSync(backupPath);
          }

          const message = translate('projects.syncing_project_alert', { project_name: projectName, door43 });
          dispatch(showStatus(message));
          console.info('syncProject: pushing to ' + remoteInfo.full_name);
          const response = await pushRepo(projectPath, user, remoteInfo.full_name);

          if (response) { // TRICKY: we get a response if there was an error
            throw convertGitErrorMessage(response, remoteUrl);
          }

          console.info('syncProject: sync success');
          const repoDcsUrl = remoteInfo.host + remoteInfo.full_name;

          dispatch(
            AlertModalActions.openAlertDialog(
              <div>
                <span>
                  {translate('projects.sync_successful_alert', { project_name: projectName, door43 })}&nbsp;
                  <a style={{ cursor: 'pointer' }} onClick={() => {
                    dispatch(
                      OnlineModeConfirmActions.confirmOnlineAction(() => {
                        open(repoDcsUrl);
                      }));
                  }}>
                    {repoDcsUrl}
                  </a>
                </span>
              </div>,
            ),
          );
        } catch (err) {
          console.error('syncProject ERROR', err);
          const errStr = (typeof err === 'string') ? err : (err && err.toString());
          let message = null;

          if (errStr && errStr.includes(GIT_ERROR_PUSH_NOT_FF)) {
            // the remote changed between our merge and our push - the local project now holds
            // the merged state, so running sync again will converge
            message = translate('projects.sync_conflict_retry', { project_name: projectName, door43 });
          } else if (errStr && errStr.includes(GIT_ERROR_PUSH_DENIED)) {
            message = translate('projects.sync_permission_denied', { door43, upload: translate('projects.upload_to_d43', { door43 }) });
          } else {
            message = gitErrorToLocalizedPrompt(err, translate, projectName);
          }
          dispatch(AlertModalActions.openAlertDialog(message, false));
          resolve();
        }
        dispatch(MyProjectsActions.getMyProjects()); // update list and deselect this project
        resolve();
      }));
    } else {
      console.warn('syncProject: User not logged in');
      const message = translate('projects.must_be_logged_in_to_sync_alert', { door43 });
      dispatch(AlertModalActions.openAlertDialog(message));
      resolve();
    }
  });
}
