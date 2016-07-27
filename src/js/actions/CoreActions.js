var Dispatcher = require('../dispatchers/Dispatcher');
var consts = require('./CoreActionConsts');
var FileModule = require('../components/core/FileModule');
/**
How to use the actions:
Just require this file in your component, call
one of the functions and the event will automatically
be dispatched to all of the stores that have registered
listener
(See ExampleComponent.js)
*/
module.exports = {
  login: function(user) {
    Dispatcher.handleAction({
      type: consts.ACCOUNT_LOGIN,
      user: user
    });
  },

  updateModal: function(boolean) {
    Dispatcher.handleAction({
      type: consts.CHANGE_UPLOAD_MODAL_VISIBILITY,
      modalOption: boolean
    });
  },

  updateLoginModal: function(boolean) {
    Dispatcher.handleAction({
      type: consts.CHANGE_LOGIN_MODAL_VISIBILITY,
      loginModalOption: boolean
    });
  },

  updateSettings: function(boolean) {
    Dispatcher.handleAction({
      type: consts.SETTINGS_VIEW,
      settingsView: boolean
    });
  },

  showOpenModal: function(boolean) {
    Dispatcher.handleAction({
      type: consts.OPEN_CREATED_PROJECT,
      visible: boolean
    });
  },

  updateButtonStatus: function(boolean) {
    Dispatcher.handleAction({
      type: consts.CHANGE_BUTTTON_STATUS,
      buttonStatus: boolean
    });
  },

  showCreateProject: function(boolean) {
      Dispatcher.handleAction({
        type: consts.CREATE_PROJECT,
        createProjectModal: boolean
      });
  },

  changeCreateProjectText: function(string) {
    Dispatcher.handleAction({
      type:  consts.CHANGE_CREATE_PROJECT_TEXT,
      modalValue: string
    })
  },

  getFetchData: function(FetchDataArray) {
    Dispatcher.handleAction({
      type: consts.SEND_FETCH_DATA,
      array: FetchDataArray
    });
  },

  sendProgressForKey: function(progressKeyObj) {
    Dispatcher.handleAction({
      type: consts.SEND_PROGRESS_FOR_KEY,
      progressRecieved: progressKeyObj
    });
  },

  doneLoadingFetchData: function(data) {
    Dispatcher.handleAction({
      type: consts.DONE_LOADING,
      reportViews:data
    });
  },

  newProject: function(){
    Dispatcher.handleAction({
    type: consts.NEW_PROJECT,
    reportViews:[]
  });
},

  updateLogoutButton: function(boolean) {
    Dispatcher.handleAction({
      type: consts.CHANGE_LOGOUT_VISIBILITY,
      logoutOption: boolean
    });
  },

  updateProfileVisibility: function(boolean) {
    Dispatcher.handleAction({
      type: consts.CHANGE_PROFILE_VISIBILITY,
      profileOption: boolean
    });
  },

  sendAlert: function(alertObj) {
    Dispatcher.handleAction({
      type: consts.ALERT_MODAL,
      alert: alertObj
    });
  },

    sendAlertResponse: function(alertResponseObj) {
      Dispatcher.handleAction({
        type: consts.ALERT_MODAL_RESPONSE,
        alertResponse: alertResponseObj
      });
    }

};
