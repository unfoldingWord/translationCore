import consts from './CoreActionConsts';
import sync from '../components/core/SideBar/GitSync';
import fs from 'fs-extra';
import path from 'path-extra';
import gogs from '../components/core/login/GogsApi';
// actions
import * as getDataActions from './GetDataActions';
import * as AlertModalActions from './AlertModalActions';
// contant declarations
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');

export function onLoad(filePath) {
  return (dispatch => {
    dispatch(getDataActions.openProject(filePath));
  });
}

export function syncProject(projectPath, manifest, lastUser) {
  return (dispatch => {
    var Token = api.getAuthToken('gogs');
    gogs(Token).login(lastUser).then(authenticatedUser => {
      const showAlert = message => {
        dispatch(AlertModalActions.openAlertDialog(message));
      };
      sync(projectPath, manifest, authenticatedUser, showAlert);
      dispatch({
        type: consts.SYNC_PROJECT
      });
    }).catch(reason => {
      if (reason.status === 401) {
        dispatch(
          AlertModalActions.openAlertDialog('Error Uploading: \n Incorrect username or password')
        );
      } else if (reason.hasOwnProperty('message')) {
        dispatch(
          AlertModalActions.openAlertDialog('Error Uploading' + reason.message)
        );
      } else if (reason.hasOwnProperty('data') && reason.data) {
        let errorMessage = reason.data;
        dispatch(
          AlertModalActions.openAlertDialog('Error Uploading' + errorMessage)
        );
      } else if (reason.hasOwnProperty('data') && typeof reason.data === "string") {
        dispatch(
          AlertModalActions.openAlertDialog('Error Uploading: \n Please verify your are logged into your door43 account.')
        );
      } else {
        dispatch(
          AlertModalActions.openAlertDialog('Error Uploading: \n Unknown error')
        );
      }
    });
  });
}

export function getProjectsFromFolder() {
  const recentProjects = fs.readdirSync(DEFAULT_SAVE);
  return {
    type: consts.GET_RECENT_PROJECTS,
    recentProjects: recentProjects
  }
}
