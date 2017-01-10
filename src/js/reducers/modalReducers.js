var consts = require('../actions/CoreActionConsts');
const merge = require('lodash.merge');

initialState = {
    project: {
        showModal: false,
        modalTitle: "Create Project",
        doneText: "Load",
        loadedChecks: [],
        currentChecks: [],
        modalValue: "Languages",
        backButton: 'hidden'
    },
    login_profile: {
        loginModalVisibility: false,
        profileModalVisibility: false
    }
}
module.exports = (state = initialState, action) => {
    switch (action.type) {
        case consts.CREATE_PROJECT:
            const visible = action.createProjectModal ? true : false;
            return merge({}, state, { createProjectModal: action.createProjectModal, showModal: visible });
            break;
        case consts.CHANGE_LOGIN_MODAL_VISIBILITY:
            return merge({}, state, {
                login_profile: {
                    loginModalVisibility: action.val,
                    profileModalVisibility: !action.val
                }
            });
            break;
        default:
            return state;
    }
}