const consts = require('../actions/CoreActionConsts');

const initialState = {
  menuVisibility: true,
  subMenuOpen: true,
  openCheck:0
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_SUBMENU:
      return {
        ...state,
        subMenuOpen: (action.newGroup || state.openCheck != action.openCheck) ? true: !state.subMenuOpen,
        openCheck: action.openCheck,
      }
    case consts.TOGGLE_MENU_DRAWER:
      return { ...state, menuVisibility: !state.menuVisibility }
    default:
      return state;
  }
}
