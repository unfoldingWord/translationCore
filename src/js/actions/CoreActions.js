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

  updateButtonStatus: function(boolean) {
    Dispatcher.handleAction({
      type: consts.CHANGE_BUTTTON_STATUS,
      buttonStatus: boolean
    });
  },

};
