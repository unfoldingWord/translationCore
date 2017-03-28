const consts = require('../actions/CoreActionConsts');

const initialState = {
  loggedInUser: false,
  displayLogin: true,
  userdata: {},
  feedback: '',
  subject: 'Bug Report'
};

export default (state = initialState, action) => {
  switch (action.type) {
    case consts.SET_USER_NAME:
      return {
        ...state,
        userdata: {
          ...state.userdata,
          username: action.val
        }
      };
    case consts.SET_USER_PASSWORD:
      return {
        ...state,
        userdata: {
          ...state.userdata,
          password: action.val
        }
      };
    case consts.TOGGLE_ACOUNT_VIEW_TO_LOGIN:
      return {...state, displayLogin: action.val};
    case consts.RECEIVE_LOGIN:
      return {
        ...state,
        userdata: action.val,
        loggedInUser: true
      };
    case consts.LOGOUT_USER:
      localStorage.removeItem('user');
      return {
        ...state,
        userdata: {},
        loggedInUser: false
      };
    case consts.FEEDBACK_CHANGE:
      return {...state, feedback: action.val};
    case consts.FEEDBACK_SUBJECT_CHANGE:
      return {...state, subject: action.val};
    case consts.SUBMIT_FEEDBACK:
      if (!Rollbar) return {...state, feedback: 'Rollbar is not available'};
      Rollbar.configure({
        payload: {
          person: {
            username: state.userdata.username
          }
        }
      });
      Rollbar.info(state.subject + ':\n' + state.feedback);
      return {...state, feedback: 'Feedback Submitted!'};
    default:
      return state;
  }
};
