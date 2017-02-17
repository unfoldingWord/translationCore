const consts = require('../actions/CoreActionConsts');
const merge = require('lodash.merge');

const initialState = {
  loggedInUser: false,
  displayLogin: true,
  userdata: null,
  feedback: '',
  subject: 'Bug Report'
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
        userdata: null,
        loggedInUser: false
      });
      break;
    case consts.FEEDBACK_CHANGE:
      return merge({}, state, {
        feedback: action.val
      });
      break;
    case 'FEEDBACK_SUBJECT_CHANGE':
      return merge({}, state, {
        subject: action.val
      });
      break;
    case consts.SUBMIT_FEEDBACK:
      Rollbar.configure({
        payload: {
          person: {
            username: state.userdata.username,
          }
        }
      });
      Rollbar.info(state.subject+ ':\n' + state.feedback);
      return merge({}, state, {
        feedback: 'Feedback Submitted!'
      });
      break;
    default:
      return state;
  }
}
