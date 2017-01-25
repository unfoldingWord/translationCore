var consts = require('../actions/CoreActionConsts');
const gogs = require('../components/core/login/GogsApi.js');
const {dialog} = remote;
const merge = require('lodash.merge');

const initialState = {
  userdata: {
    username: "",
    full_name: "",
    password: "",
    email: "",
    avatar_url: "",
  },
  loggedInUser: false,
  displayLogin: true,
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.SET_USER_NAME:
      return merge({}, state, {
        userdata: {
          username: action.val
        }
      });
      break;
    case consts.SET_USER_PASSWORD:
      return merge({}, state, {
        userdata: {
          password: action.val
        }
      });
      break;
    case consts.TOGGLE_ACOUNT_VIEW_TO_LOGIN:
      return merge({}, state, {
        displayLogin: action.val
      });
      break;
    case consts.RECEIVE_LOGIN:
      return merge({}, state, {
        userdata: action.val,
        loggedInUser: true
      });
      break;
    case consts.LOGOUT_USER:
      localStorage.removeItem('user');
      return merge({}, state, {
        userdata: {
          username: "",
          full_name: "",
          password: "",
          email: "",
          avatar_url: "",
        },
        loggedInUser: false
      });
      break;
    default:
      return state;
  }
}
