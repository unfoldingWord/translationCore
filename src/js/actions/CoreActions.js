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

  newProject: function(){
    Dispatcher.handleAction({
      type: consts.NEW_PROJECT,
      reportViews:[]
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
