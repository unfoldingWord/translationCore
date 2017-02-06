const merge = require('lodash.merge');

const initialState = {
    visible: false,
    currentTab: 1,
    currentSection: 0
}
module.exports = (state = initialState, action) => {
    switch (action.type) {
        case 'SHOW_MODAL_CONTAINER':
            return merge({}, state, {
                visible:action.val,
                currentSection:1
            });
            break;
        case 'SELECT_MODAL_TAB':
            return merge({}, state, {
                currentTab:action.tab,
                currentSection:action.section,
                visible:action.visible
            });
            break;
        case 'SELECT_MODAL_SECTION':
            return merge({}, state, {
                currentTab:action.tab,
                currentSection:action.section
            });
            break;
        default:
            return state;
    }
}
