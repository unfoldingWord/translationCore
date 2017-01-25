var consts = require('../actions/CoreActionConsts');
const merge = require('lodash.merge');

initialState = {
    visible: false,
    currentTab: 1,
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
        case consts.SELECT_MODAL_TAB:
            return merge({}, state, {
                currentTab:action.val
            });
            break;
        default:
            return state;
    }
}
