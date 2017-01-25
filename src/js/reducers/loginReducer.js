var consts = require('../actions/CoreActionConsts');
const gogs = require('../components/core/login/GogsApi.js');
const {dialog} = remote;
const merge = require('lodash.merge');

initialState = {
    userdata: {
      username: "royalsix",
      full_name: "",
      password: "4thenations",
      email: "",
      avatar_url: "",
    },
    loggedInUser: false,
    displayLogin: true,
};

const login = (newUserdata) => {
  //The code below needs to be change in order to be 100% redux
  var Token = api.getAuthToken('gogs');
  var newuser = gogs(Token).login(newUserdata).then((newUserdata) => {
    return newUserdata;
  }).catch(function (reason) {
    console.log(reason);
    if (reason.status === 401) {
      dialog.showErrorBox('Login Failed', 'Incorrect username or password. This could be caused by using an email address instead of a username.');
    } else if (reason.message) {
      dialog.showErrorBox('Login Failed', reason.message);
    } else if (reason.data) {
      dialog.showErrorBox('Login Failed', reason.data);
    } else {
      dialog.showErrorBox('Login Failed', 'Unknown Error');
    }
  });
  return;
}

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
        case consts.LOGIN_USER:
            //TODO: still need to get this to work
            return merge({}, state, {
              userdata: login(action.val),
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
