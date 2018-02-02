import types from '../actions/ActionTypes';

const initialState = {
  loggedInUser: false,
  userdata: {},
  feedback: '',
  subject: 'Bug Report',
  placeholder: 'Leave us your feedback!'
};

const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.LOGIN_USER:
      return {
        ...state,
        userdata:  {
          ...action.userdata,
          localUser: action.localUser
        },
        loggedInUser: true
      };
    case types.LOGOUT_USER:
      return {
        ...state,
        userdata: {},
        loggedInUser: false
      };
    case types.FEEDBACK_CHANGE:
      return { ...state, feedback: action.val };
    case types.FEEDBACK_SUBJECT_CHANGE:
      return { ...state, subject: action.val };
    case types.SUBMIT_FEEDBACK:
      // Rollbar.configure({
      //   payload: {
      //     person: {
      //       username: state.userdata.username
      //     }
      //   }
      // });
      // Rollbar.info(state.subject+ ':\n' + state.feedback);
      return { ...state, placeholder: "Feedback Submitted!", feedback: "" };
    default:
      return state;
  }
};

export default loginReducer;

/**
 * Checks if the user is logged in
 * @param {object} state the login slice the state object
 */
export const getIsLoggedIn = (state) => {
  return state.loggedInUser;
};

/**
 * Returns the username of the user
 * @param {object} state the login slice of the state object
 * @return {string}
 */
export const getUsername = (state) => {
  const {username} = state.userdata;
  return username;
};
