import types from '../actions/ActionTypes';

const initialState = {
  loggedInUser: false,
  userdata: {},
};

const loginReducer = (state = initialState, action) => {
  switch (action.type) {
  case types.LOGIN_USER:
    return {
      ...state,
      userdata: {
        ...action.userdata,
        localUser: action.localUser,
      },
      loggedInUser: true,
    };
  case types.LOGOUT_USER:
    return {
      ...state,
      userdata: {},
      loggedInUser: false,
    };
  default:
    return state;
  }
};

export default loginReducer;

/**
 * Checks if the user is logged in
 * @param {object} state the login slice the state object
 */
export const getIsLoggedIn = (state) => state.loggedInUser;

/**
 * Returns the username of the user
 * @param {object} state the login slice of the state object
 * @return {string}
 */
export const getUsername = (state) => {
  const { username } = state.userdata;
  return username;
};

/**
 * Returns the email of the user
 * @param {object} state the login slice of the state object
 * @return {string}
 */
export const getEmail = (state) => {
  const { email } = state.userdata;
  return email;
};
