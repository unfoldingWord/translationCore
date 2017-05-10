import consts from './CoreActionConsts';
import * as CoreActions from './CoreActions.js';
import * as AlertModalActions from './AlertModalActions';
import * as GetDataActions from './GetDataActions';
import * as BodyUIActions from './BodyUIActions';
import gogs from '../components/core/login/GogsApi.js';
import { remote } from 'electron';
// const delclarations
const { dialog } = remote;
const api = window.ModuleApi;

export function setUserName(val) {
  return {
    type: consts.SET_USER_NAME,
    val: val
  }
}

export function setUserPassword(val) {
  return {
    type: consts.SET_USER_PASSWORD,
    val: val
  }
}

export function displayLogin(val) {
  return {
    type: consts.TOGGLE_ACOUNT_VIEW_TO_LOGIN,
    val: val
  }
}

export function loginLocalUser() {
  return ((dispatch, getState) => {
    let username = getState().loginReducer.userdata.username;
    dispatch({
      type: consts.LOGIN_LOCAL_USER,
      username
    });
  });
}

export function loginUser(newUserdata) {
  return ((dispatch) => {
    var Token = api.getAuthToken('gogs');
    gogs(Token).login(newUserdata).then((newUserdata) => {
      CoreActions.login(newUserdata);
      dispatch({
        type: consts.RECEIVE_LOGIN,
        val: newUserdata
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
  })
}

export function logoutUser(val) {
  return ((dispatch) => {
    dispatch({
      type: consts.LOGOUT_USER
    });
    dispatch(GetDataActions.clearPreviousData());
    dispatch(BodyUIActions.toggleHomeView(true));
  });
}

export function feedbackChange(e) {
  return {
    type: consts.FEEDBACK_CHANGE,
    val: e
  }
}

export function subjectChange(subject) {
  return {
    type: 'FEEDBACK_SUBJECT_CHANGE',
    val: subject
  }
}

export function submitFeedback() {
  return {
    type: consts.SUBMIT_FEEDBACK
  }
}
