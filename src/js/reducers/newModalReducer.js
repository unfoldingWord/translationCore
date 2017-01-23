var consts = require('../actions/CoreActionConsts');
const merge = require('lodash.merge');

initialState = {
    visible: false,
    currentTab: "",
    currentSection: "",
    application: {
    },
    load: {
    },
    tools: {
    }
}
module.exports = (state = initialState, action) => {
    switch (action.type) {
        case consts.SHOW_MODAL_CONTAINER:
            return merge({}, state, {
                visible:action.val
            });
            break;
        default:
            return state;
    }
}