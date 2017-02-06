const merge = require('lodash.merge');
const initialState = {
    path: "",
    currentCheckNamespace: "",
    newToolSelected: false,
    pressed: false
};

module.exports = (state = initialState, action) => {
    switch (action.type) {
        case "TOGGLE_SUBMENU":
            return merge({}, state, {
                subMenuOpen: (action.newGroup || state.openCheck != action.openCheck) ? true : !state.subMenuOpen,
                openCheck: action.openCheck,
            });
            break;
        default:
            return state;
    }
}