var consts = require('./CoreActionConsts');
/**
How to use the actions:
Just require this file in your component, call
one of the functions and the event will automatically
be dispatched to all of the stores that have registered
listener
(See ExampleComponent.js)
*/
module.exports.showCreateProject = function (type) {
  return {
    type: consts.CREATE_PROJECT,
    createProjectModal: type
  };
}

module.exports.updateLoginModal = function (val) {
  return {
    type: consts.CHANGE_LOGIN_MODAL_VISIBILITY,
    val: val
  };
}

module.exports.updateProfileModal = function (val) {
  return {
    type: consts.CHANGE_PROFILE_MODAL_VISIBILITY,
    val: val
  };
}

module.exports.showLoginProfileModal = function (val) {
  return {
    type: consts.SHOW_PROFILE_LOGIN_MODAL,
    val: val
  };
}

module.exports.showMainView = function(val) {
  return {
    type: consts.SHOW_APPS,
    val:val
  }
}

module.exports.showSwitchCheckModal = function(val){
  return {
    type: consts.SHOW_SWITCH_CHECK_MODAL,
    val:val
  }
}

module.exports.showModalContainer = function(val) {
  return {
    type: consts.SHOW_MODAL_CONTAINER,
    val:val
  }
}