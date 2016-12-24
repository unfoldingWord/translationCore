var consts = require('./CoreActionConsts');
/**
How to use the actions:
Just require this file in your component, call
one of the functions and the event will automatically
be dispatched to all of the stores that have registered
listener
(See ExampleComponent.js)
*/

module.exports.login = function login(user) {
  return {
    type: consts.ACCOUNT_LOGIN,
    user: user
  };
},

  module.exports.updateOpenView = function updateOpenView(boolean) {
    return {
      type: consts.OPEN_VIEW,
      openView: boolean
    };
  },

  module.exports.updateModProg = function updateModProg(boolean) {
    return {
      type: consts.MOD_PROGRESS_VIEW,
      modProgressView: boolean
    };
  },

  module.exports.updateModal = function (boolean) {
    return {
      type: consts.CHANGE_UPLOAD_MODAL_VISIBILITY,
      uploadModalVisibility: boolean

    };
  },

  module.exports.updateLoginModal = function (boolean) {
    return {
      type: consts.CHANGE_LOGIN_MODAL_VISIBILITY,
      loginModalVisibility: boolean

    };
  },

  module.exports.updateSettings = function (boolean) {
    return {
      type: consts.SETTINGS_VIEW,
      settingsView: boolean

    };
  },

  module.exports.showOpenModal = function (boolean) {
    return {
      type: consts.OPEN_CREATED_PROJECT,
      openProjectModalVisibility: boolean
    };
  },

  module.exports.updateOnlineStatus = function (boolean) {
    return {
      type: consts.CHANGE_ONLINE_STATUS,
      onlineStatus: boolean

    };
  },

  module.exports.showCreateProject = function (type) {
    return {
      type: consts.CREATE_PROJECT,
      createProjectModal: type

    };
  },

  module.exports.changeCreateProjectText = function (text) {
    return {
      type: consts.CHANGE_CREATE_PROJECT_TEXT,
      createProjectText: text
    }
  },

  module.exports.getFetchData = function (fetchDataArray) {
    return {
      type: consts.SEND_FETCH_DATA,
      fetchDataArray: fetchDataArray

    };
  },

  module.exports.sendProgressForKey = function (progressKeyObj) {
    return {
      type: consts.SEND_PROGRESS_FOR_KEY,
      progressKeyObj: progressKeyObj

    };
  },

  module.exports.doneLoadingFetchData = function () {
    return {
      type: consts.DONE_LOADING
    };
  },

  module.exports.newProject = function () {
    return {
      type: consts.NEW_PROJECT,
      reportViews: []
    };
  },

  module.exports.updateProfileVisibility = function (boolean) {
    return {
      type: consts.CHANGE_PROFILE_VISIBILITY,
      profileOption: boolean

    };
  },

  module.exports.updateCheckModal = function (boolean) {
    return {
      type: consts.CHANGE_CHECK_MODAL_VISIBILITY,
      checkModalOption: boolean

    };
  },

  module.exports.sendAlert = function (alertObj) {
    return {
      type: consts.ALERT_MODAL,
      alert: alertObj
    };
  },

  module.exports.sendNotificationToast = function (visible, toastParamsObj) {
    return {
      type: consts.SHOW_TOAST_PARAMS,
      toastOption: visible,
      toastParams: toastParamsObj

    };
  },

  module.exports.sendAlertResponse = function (alertResponseObj) {
    return {
      type: consts.ALERT_MODAL_RESPONSE,
      alertResponse: alertResponseObj

    };
  },

  module.exports.startLoading = function () {
    return {
      type: consts.START_LOADING
    };
  },

  module.exports.updatePopover = function (visibility, title, body, left, top) {
    return {
      type: consts.UPDATE_POPOVER,
      popoverVisibility,
      popoverTitle,
      popoverBody,
      popoverLeft,
      popoverTop
    }

  };
