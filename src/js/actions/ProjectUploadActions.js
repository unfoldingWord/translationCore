import React from 'react';
import path from 'path-extra';
import open from 'open';
import git from '../helpers/GitApi.js';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as OnlineModeConfirmActions from './OnlineModeConfirmActions';
// helpers
import * as GogsApiHelpers from '../helpers/GogsApiHelpers';

/**
 * Upload project to door 43, based on currently logged in user.
 * @param {String} projectPath - Path to the project to upload
 * @param {Object} user - currently logged in user
 */
export function uploadProject(projectPath, user, onLine = navigator.onLine) {
  return (dispatch => {
    // if no Internet connection is found then alert the user and stop upload process
    if (!onLine) {
      dispatch(AlertModalActions.openAlertDialog(
        'Unable to connect to the server. Please check your Internet connection.'
      ));
    } else if (!user.localUser) {
      dispatch(OnlineModeConfirmActions.confirmOnlineAction(() => {
        const projectName = projectPath.split(path.sep).pop();
        const message = "Uploading " + projectName + " to Door43. Please wait...";
        dispatch(AlertModalActions.openAlertDialog(message, true));
        if (!user.token) {
          const message = "Your login has become invalid. Please log out and log back in.";
          return dispatch(AlertModalActions.openAlertDialog(message, false));
        }
        GogsApiHelpers.createRepo(user, projectName).then(repo => {
          const newRemote = 'https://' + user.token + '@git.door43.org/' + repo.full_name + '.git';

          git(projectPath).save(user, 'Commit before upload', projectPath, err => {
            if (err) {
              dispatch(AlertModalActions.openAlertDialog("Error saving project: " + err));
            } else {
              git(projectPath).push(newRemote, "master", err => {
                if (err) {
                  if (err.status === 401 || err.code === "ENOTFOUND" || err.toString().includes("connect ETIMEDOUT") || err.toString().includes("INTERNET_DISCONNECTED") || err.toString().includes("unable to access") || err.toString().includes("The remote end hung up")) {
                    const message = "Unable to connect to the server. Please check your Internet connection.";
                    dispatch(AlertModalActions.openAlertDialog(message));
                  } else if (err.toString().includes("rejected because the remote contains work")) {
                    const message = projectName + ' cannot be uploaded because there have been changes to the translation of that project on your Door43 account.';
                    dispatch(AlertModalActions.openAlertDialog(message));
                  } else if (err.hasOwnProperty('message')) {
                    dispatch(AlertModalActions.openAlertDialog('Error Uploading: ' + err.message));
                  } else if (err.hasOwnProperty('data') && err.data) {
                    dispatch(AlertModalActions.openAlertDialog('Error Uploading: ' + err.data));
                  } else {
                    dispatch(AlertModalActions.openAlertDialog('Error Uploading: Unknown error'));
                  }
                } else {
                  dispatch(
                    AlertModalActions.openAlertDialog(
                      <div>
                        <span>
                          <span style={{ fontWeight: 'bold' }}>{user.username + ", "}</span>
                          {"your project was uploaded successfully to: "}
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
      const message = "You must be logged in with a Door43 account to upload projects. Please log out and then back in with a Door43 user account.";
      return dispatch(AlertModalActions.openAlertDialog(message));
    }
  });
}
