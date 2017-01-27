const consts = require('../actions/CoreActionConsts');
const merge = require('lodash.merge');

const initialState = {
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
          id:"",
          full_name: "",
          password: "",
          email: "",
          avatar_url: "",
          token: "",
        },
        loggedInUser: false
      });
      break;
    default:
      return state;
  }
}
