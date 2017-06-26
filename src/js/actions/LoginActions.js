import consts from './ActionTypes';
import * as AlertModalActions from './AlertModalActions';
import * as GetDataActions from './GetDataActions';
import * as BodyUIActions from './BodyUIActions';
import gogs from '../components/login/GogsApi.js';
import { remote } from 'electron';
// const delclarations
const { dialog } = remote;

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
    gogs().login(newUserdata).then(newUserdata => {
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
