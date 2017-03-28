const api = window.ModuleApi;
const consts = require('./CoreActionConsts');
const CoreActions = require('./CoreActions.js');
import gogs from '../components/core/login/GogsApi.js';
const remote = require('electron').remote;
const { dialog } = remote;

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

export function loginUser(newUserdata) {
  return ((dispatch) => {
    var Token = api.getAuthToken('gogs');
    gogs(Token).login(newUserdata).then((newUserdata) => {
      CoreActions.login(newUserdata);
      dispatch({
        type: consts.RECEIVE_LOGIN,
        val: newUserdata
      });
    }).catch(function (reason) {
      console.log(reason);
      if (reason.status === 401) {
        dialog.showErrorBox('Login Failed', 'Incorrect username or password. This could be caused by using an email address instead of a username.');
      } else if (reason.message) {
        dialog.showErrorBox('Login Failed', reason.message);
      } else if (reason.data) {
        dialog.showErrorBox('Login Failed', reason.data);
      } else {
        dialog.showErrorBox('Login Failed', 'Unknown Error');
      }
    });
  })
}

export function logoutUser(val) {
  return {
    type: consts.LOGOUT_USER,
  }
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
    type: consts.SUBMIT_FEEDBACK,
  }
}