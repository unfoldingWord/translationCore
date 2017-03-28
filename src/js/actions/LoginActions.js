import consts from './CoreActionConsts';
import CoreActions from './CoreActions.js';
import gogs from '../components/core/login/GogsApi.js';
import {remote} from 'electron';
const {dialog} = remote;
const api = window.ModuleApi;

export const setUserName = function(val) {
  return {
    type: consts.SET_USER_NAME,
    val: val
  };
};

export const setUserPassword = function(val) {
  return {
    type: consts.SET_USER_PASSWORD,
    val: val
  };
};

export const displayLogin = function(val) {
  return {
    type: consts.TOGGLE_ACOUNT_VIEW_TO_LOGIN,
    val: val
  };
};

export const loginUser = function(newUserdata) {
  return ((dispatch) => {
    var Token = api.getAuthToken('gogs');
    gogs(Token).login(newUserdata).then((newUserdata) => {
      CoreActions.login(newUserdata);
      dispatch({
        type: consts.RECEIVE_LOGIN,
        val: newUserdata
      });
    }).catch(function(reason) {
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
  });
};

export const logoutUser = function(val) {
  return {
    type: consts.LOGOUT_USER
  };
};

export const feedbackChange = function(e) {
  return {
    type: consts.FEEDBACK_CHANGE,
    val: e
  };
};

export const subjectChange = function(subject) {
  return {
    type: 'FEEDBACK_SUBJECT_CHANGE',
    val: subject
  };
};

export const submitFeedback = function() {
  return {
    type: consts.SUBMIT_FEEDBACK
  };
};
