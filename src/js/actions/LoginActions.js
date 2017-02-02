const api = window.ModuleApi;
const consts = require('./CoreActionConsts');
const CoreActions = require('./CoreActions.js');
const gogs = require('../components/core/login/GogsApi.js');
const remote = require('electron').remote;
const { dialog } = remote;

module.exports.setUserName = function (val) {
  return {
    type: consts.SET_USER_NAME,
    val: val
  }
}

module.exports.setUserPassword = function (val) {
  return {
    type: consts.SET_USER_PASSWORD,
    val: val
  }
}

module.exports.displayLogin = function (val) {
  return {
    type: consts.TOGGLE_ACOUNT_VIEW_TO_LOGIN,
    val: val
  }
}

module.exports.loginUser = function (newUserdata) {
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

module.exports.logoutUser = function (val) {
  return {
    type: consts.LOGOUT_USER,
  }
}

module.exports.feedbackChange = function (e) {
  return {
    type: consts.FEEDBACK_CHANGE,
    val: e
  }
}

module.exports.subjectChange = function (subject) {
  return {
    type: 'FEEDBACK_SUBJECT_CHANGE',
    val: subject
  }
}

module.exports.submitFeedback = function () {
  return {
    type: consts.SUBMIT_FEEDBACK,
  }
}
