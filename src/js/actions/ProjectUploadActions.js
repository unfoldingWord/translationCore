import React from 'react';
import path from 'path-extra';
import open from 'open';
import git from '../helpers/GitApi.js';
import {getTranslate} from '../selectors';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as OnlineModeConfirmActions from './OnlineModeConfirmActions';
import * as WordAlignmentActions from './WordAlignmentActions';
// helpers
import * as GogsApiHelpers from '../helpers/GogsApiHelpers';

/**
 * Upload project to door 43, based on currently logged in user.
 * @param {String} projectPath - Path to the project to upload
 * @param {Object} user - currently logged in user
 * @param {Boolean} onLine - if undefined in function call it will equal to
 * navigator.onLine. This is useful to unit test.
 */
export function uploadProject(projectPath, user, onLine = navigator.onLine) {
  return (dispatch, getState) => {
    const translate = getTranslate(getState());
    // if no Internet connection is found then alert the user and stop upload process
    if (!onLine) {
      dispatch(AlertModalActions.openAlertDialog(translate('no_internet')));
    } else if (!user.localUser) {
      dispatch(OnlineModeConfirmActions.confirmOnlineAction(async () => {
        //export word alignments
        const projectName = projectPath.split(path.sep).pop();
        const message = translate('projects.uploading_alert', {project_name: projectName, door43: translate('_.door43')});
        dispatch(AlertModalActions.openAlertDialog(message, true));
        if (!user.token) {
          const message = translate('users.session_invalid');
          return dispatch(AlertModalActions.openAlertDialog(message, false));
        }
        await dispatch(WordAlignmentActions.exportWordAlignmentData(projectPath, true));
        GogsApiHelpers.createRepo(user, projectName).then(repo => {
          const newRemote = 'https://' + user.token + '@git.door43.org/' + repo.full_name + '.git';

          git(projectPath).save(user, 'Commit before upload', projectPath, err => {
            if (err) {
              dispatch(AlertModalActions.openAlertDialog(translate('projects.uploading_error', {error: err})));
            } else {
              git(projectPath).push(newRemote, "master", err => {
                if (err) {
                  if (err.status === 401 || err.code === "ENOTFOUND" || err.toString().includes("connect ETIMEDOUT") || err.toString().includes("INTERNET_DISCONNECTED") || err.toString().includes("unable to access") || err.toString().includes("The remote end hung up")) {
                    const message = translate('no_internet');
                    dispatch(AlertModalActions.openAlertDialog(message));
                  } else if (err.toString().includes("rejected because the remote contains work")) {
                    const message = translate('projects.upload_modified_error', {project_name: projectName});
                    dispatch(AlertModalActions.openAlertDialog(message));
                  } else if (err.hasOwnProperty('message')) {
                    dispatch(AlertModalActions.openAlertDialog(translate('projects.uploading_error', {error: err.message})));
                  } else if (err.hasOwnProperty('data') && err.data) {
                    dispatch(AlertModalActions.openAlertDialog(translate('projects.uploading_error', {error: err.data})));
                  } else {
                    dispatch(AlertModalActions.openAlertDialog(translate('projects.uploading_unknown_error')));
                  }
                } else {
                  dispatch(
                    AlertModalActions.openAlertDialog(
                      <div>
                        <span>
                          <span style={{ fontWeight: 'bold' }}>{user.username + ", "}</span>
                          {translate('projects.upload_successful_alert')}&nbsp;
                          <a style={{ cursor: 'pointer' }} onClick={() => {
                            dispatch(OnlineModeConfirmActions.confirmOnlineAction(() => {
                              open('https://git.door43.org/' + user.username + '/' + projectName);
                            }));
                          }}>
                            {"https://git.door43.org/" + user.username + '/' + projectName}
                          </a>
                        </span>
                      </div>
                    )
                  );
                }
              });
            }
          });
        });
      }));
    } else {
      const message = translate('projects.must_be_logged_in_alert', {door43: translate('_.door43')});
      return dispatch(AlertModalActions.openAlertDialog(message));
    }
  };
}
