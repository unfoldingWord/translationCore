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
  nextCheck: function(newVerse) {
    Dispatcher.handleAction({
      type: consts.NEXT_VERSE,
      newVerse: newVerse
    });
  },
  addCheck: function(newCheck) {
    Dispatcher.handleAction({
      type: consts.ADD_CHECK,
      newCheck: newCheck
    });
  },

  addToExampleComponentText: function() {
    Dispatcher.handleAction({
      type: consts.ADD_TO_TEXT
    });
  },

  login: function(user) {
    Dispatcher.handleAction({
      type: consts.ACCOUNT_LOGIN,
      user: user
    });
  },

  updateOriginalLanguage: function(book) {
    Dispatcher.handleAction({
      type: consts.UPDATE_ORIGINAL_LANGUAGE,
      bookOl: book
    });
  },

  updateTargetLanguage: function(book) {
    Dispatcher.handleAction({
      type: consts.UPDATE_TARGET_LANGUAGE,
      bookTl: book
    });
  },

  updateGatewayLanguage: function(book) {
    Dispatcher.handleAction({
      type: consts.UPDATE_GATEWAY_LANGUAGE,
      bookGl: book
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
  }

};
