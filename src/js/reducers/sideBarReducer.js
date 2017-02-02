const merge = require('lodash.merge');

const initialState = {
  subMenuOpen: true,
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case "TOGGLE_SUBMENU":
      return merge({}, state, {
        subMenuOpen: action.val
      });
      break;
    default:
      return state;
  }
}
