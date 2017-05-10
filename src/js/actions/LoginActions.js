import consts from './CoreActionConsts';
import * as CoreActions from './CoreActions.js';
import * as AlertModalActions from './AlertModalActions';
import gogs from '../components/core/login/GogsApi.js';
import { remote } from 'electron';
// const delclarations
const { dialog } = remote;
const api = window.ModuleApi;


export function displayLogin(val) {
  return {
    type: consts.TOGGLE_ACOUNT_VIEW_TO_LOGIN,
    val: val
  };
}

export function loginLocalUser(localUsername) {
  return ((dispatch, getState) => {
    dispatch({
      type: consts.LOGIN_LOCAL_USER,
      username: localUsername
    });
  });
}

export function loginUser(newUserdata) {
  return (dispatch => {
    var Token = api.getAuthToken('gogs');
    gogs(Token).login(newUserdata).then(newUserdata => {
      CoreActions.login(newUserdata);
      dispatch({
        type: consts.RECEIVE_LOGIN,
        userdata: newUserdata
      });
    }).catch(function(err) {
      var errmessage = "An error occurred while trying to login";
      if (err.syscall === "getaddrinfo") {
        errmessage = "Unable to connect to server";
      } else if (err.status === 404) {
        errmessage = "Incorrect Username";
      } else if (err.status === 401) {
        errmessage = "Incorrect Password";
      }
      dispatch(AlertModalActions.openAlertDialog(errmessage));
    });
  });
}

export function logoutUser(val) {
  return {
    type: consts.LOGOUT_USER
  };
}

export function feedbackChange(e) {
  return {
    type: consts.FEEDBACK_CHANGE,
    val: e
  };
}

export function subjectChange(subject) {
  return {
    type: 'FEEDBACK_SUBJECT_CHANGE',
    val: subject
  };
}

export function submitFeedback() {
  return {
    type: consts.SUBMIT_FEEDBACK
  };
}
