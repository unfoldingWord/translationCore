var consts = require('../actions/CoreActionConsts');
const merge = require('lodash.merge');

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
            return merge({}, state, {
                showOnlineButton: action.view
            })
            break;
        case consts.IMPORT_LINK:
            return merge({}, state, {
                importLink: action.importLink
            })
            break;
        case consts.RECIEVE_REPOS:
            return merge({}, state, {
                repos: action.repos
            })
            break;
        case consts.RECEIVE_LOGIN:
            return merge({}, state, {
                loggedIn: action.val ? true : false
            })
            break;
        default:
            return state;
    }
}
