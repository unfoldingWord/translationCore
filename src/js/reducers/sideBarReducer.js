const merge = require('lodash.merge');

const initialState = {
  menuVisibility: true,
  subMenuOpen: true,
  openCheck:0
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case "TOGGLE_SUBMENU":
      return merge({}, state, {
      subMenuOpen: (action.newGroup || state.openCheck != action.openCheck) ? true: !state.subMenuOpen,
        openCheck: action.openCheck,
      });
      break;
    case "TOGGLE_MENU_DRAWER":
      return merge({}, state, {
        menuVisibility: !state.menuVisibility
      });
    break;
    default:
      return state;
  }
}
