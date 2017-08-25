import consts from './ActionTypes';
// helpers
import gogs from '../components/login/GogsApi.js';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as ProjectSelectionActions from './ProjectSelectionActions';
import * as BodyUIActions from './BodyUIActions';
import * as OnlineModeActions from './OnlineModeActions';

export function loginUser(newUserdata, local = false) {
  return (dispatch => {
    if (local) {
      dispatch({
        type: consts.RECEIVE_LOGIN,
        userdata: newUserdata,
        localUser: local
      });
    } else {
      dispatch(OnlineModeActions.confirmOnlineAction(() => {
        gogs().login(newUserdata).then(newUserdata => {
          dispatch({
            type: consts.RECEIVE_LOGIN,
            userdata: newUserdata
          });
        }).catch(function (err) {
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
      }));
    }
  });
}

export function logoutUser() {
  return ((dispatch) => {
    dispatch({
      type: consts.LOGOUT_USER
    });
    dispatch(ProjectSelectionActions.clearLastProject());
    dispatch(BodyUIActions.toggleHomeView(true));
    dispatch({ type: consts.RESET_ONLINE_MODE_WARNING_ALERT })
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
  return ((dispatch) => {
    dispatch(OnlineModeActions.confirmOnlineAction(() => {
      dispatch({
        type: consts.SUBMIT_FEEDBACK
      });
    }));
  });
}
