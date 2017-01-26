const consts = require('../actions/CoreActionConsts');
const api = window.ModuleApi;
const merge = require('lodash.merge');

var initialState = {
    recentProjects: null,
};

module.exports = (state = initialState, action) => {
    switch (action.type) {
        case consts.CHANGE_SETTINGS:
            return merge({}, state, {
                currentSettings: action.val
            });
            break;
        case consts.CHANGE_SETTINGS:
            return merge({}, state, {
                currentSettings: action.val
            });
            break;
        case consts.GET_RECENT_PROJECTS:
            return merge({}, state, {
                recentProjects: action.recentProjects
            });
            break;
        default:
            return state;
    }
}