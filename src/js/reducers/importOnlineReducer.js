const consts = require('../actions/CoreActionConsts');

const initialState = {
    showOnlineButton: true,
    showBack: false,
    importLink: null,
    repos: null,
    onlineProjects: null,
    loggedIn: false
};

module.exports = (state = initialState, action) => {
    switch (action.type) {
      case consts.CHANGED_IMPORT_VIEW:
        return { ...state, showOnlineButton: action.view }
      case consts.IMPORT_LINK:
        return { ...state, importLink: action.importLink }
      case consts.RECIEVE_REPOS:
        return { ...state, repos: action.repos }
      case consts.RECEIVE_LOGIN:
        return { ...state, loggedIn: action.val ? true : false }
      default:
          return state;
    }
}
