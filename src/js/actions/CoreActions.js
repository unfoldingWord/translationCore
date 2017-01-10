var Dispatcher = require('../dispatchers/Dispatcher');
var consts = require('./CoreActionConsts');
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

  updateOpenView: function(boolean) {
    Dispatcher.handleAction({
      type: consts.OPEN_VIEW,
      view: boolean
    });
  },

  updateModProg: function(boolean) {
    Dispatcher.handleAction({
      type: consts.MOD_PROGRESS_VIEW,
      view: boolean
    });
  },

  // updateModal: function(boolean) {
  //   Dispatcher.handleAction({
  //     type: consts.CHANGE_UPLOAD_MODAL_VISIBILITY,
  //     modalOption: boolean
  //   });
  // },

  // updateLoginModal: function(boolean) {
  //   Dispatcher.handleAction({
  //     type: consts.CHANGE_LOGIN_MODAL_VISIBILITY,
  //     loginModalOption: boolean
  //   });
  // },

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

  updateOnlineStatus: function(boolean) {
    Dispatcher.handleAction({
      type: consts.CHANGE_ONLINE_STATUS,
      onlineStatus: boolean
    });
  },

  // showCreateProject: function(boolean) {
  //     Dispatcher.handleAction({
  //       type: consts.CREATE_PROJECT,
  //       createProjectModal: boolean
  //     });
  // },

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

  doneLoadingFetchData: function() {
    Dispatcher.handleAction({
      type: consts.DONE_LOADING
    });
  },

  newProject: function(){
    Dispatcher.handleAction({
      type: consts.NEW_PROJECT,
      reportViews:[]
    });
  },

  updateCheckModal: function(boolean) {
    Dispatcher.handleAction({
      type: consts.CHANGE_CHECK_MODAL_VISIBILITY,
      checkModalOption: boolean
    });
  },

  sendAlert: function(alertObj) {
    Dispatcher.handleAction({
      type: consts.ALERT_MODAL,
      alert: alertObj
    });
  },

    sendNotificationToast: function(visible, toastParamsObj) {
      Dispatcher.handleAction({
        type: consts.SHOW_TOAST_PARAMS,
        toastOption: visible,
        toastParams: toastParamsObj
      });
    },

  sendAlertResponse: function(alertResponseObj) {
    Dispatcher.handleAction({
      type: consts.ALERT_MODAL_RESPONSE,
      alertResponse: alertResponseObj
    });
  },

  startLoading: function() {
    Dispatcher.handleAction({
      type: consts.START_LOADING
    });
  },

  updatePopover: function(visibility, title, body, left, top) {
    Dispatcher.handleAction({
      type: consts.UPDATE_POPOVER,
      visibility,
      title,
      body,
      left,
      top
    })
  }

};