var consts = require('./CoreActionConsts');
module.exports.setUserName = function(val) {
  return {
    type: consts.SET_USER_NAME,
    val:val
  }
}

module.exports.setUserPassword = function(val) {
  return {
    type: consts.SET_USER_PASSWORD,
    val: val
  }
}

module.exports.displayLogin = function(val) {
  return {
    type: consts.TOGGLE_ACOUNT_VIEW_TO_LOGIN,
    val: val
  }
}

module.exports.loginUser = function(val) {
  return {
    type: consts.LOGIN_USER,
    val: val
  }
}

module.exports.logoutUser = function(val) {
  return {
    type: consts.LOGOUT_USER,
  }
}
