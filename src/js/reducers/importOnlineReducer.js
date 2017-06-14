import consts from '../actions/ActionTypes';

const initialState = {
  showOnlineButton: true,
  showBack: false,
  importLink: "",
  repos: null,
  onlineProjects: null,
  loggedIn: false,
  showLoadingCircle: false,
  err: null
};

const importOnlineReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.CHANGED_IMPORT_VIEW:
      return { ...state, showOnlineButton: action.view }
    case consts.IMPORT_LINK:
      return { ...state, importLink: action.importLink }
    case consts.RECIEVE_REPOS:
      return { ...state, repos: action.repos }
    case consts.RECEIVE_LOGIN:
      return { ...state, loggedIn: action.val ? true : false }
    case consts.GOGS_SERVER_ERROR:
      return { ...state, err: action.err }
    case consts.SHOW_LOADING_CIRCLE:
      return {
        ...state,
        showLoadingCircle: true
      };
    case consts.HIDE_LOADING_CIRCLE:
      return {
        ...state,
        showLoadingCircle: false
      };
    default:
      return state;
  }
};

export default importOnlineReducer;