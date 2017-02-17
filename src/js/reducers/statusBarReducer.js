const merge = require('lodash.merge');
const initialState = {
    path: "",
    currentCheckNamespace: "",
    newToolSelected: false,
    pressed: false,
    online: true
};

module.exports = (state = initialState, action) => {
    switch (action.type) {
        case "TOGGLE_SUBMENU":
            return merge({}, state, {
                subMenuOpen: (action.newGroup || state.openCheck != action.openCheck) ? true : !state.subMenuOpen,
                openCheck: action.openCheck,
            });
            break;
        case "CHANGE_ONLINE_STATUS":
            return merge({}, state, {
                online: action.online
            });
            break;
        default:
            return state;
    }
}