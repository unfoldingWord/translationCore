const CheckStoreActions = require('./CheckStoreActions.js');
const consts = require('./CoreActionConsts');

module.exports.toggleSubmenu = function (id) {
  return {
    type: consts.TOGGLE_SUBMENU,
    openCheck: id
  }
};

module.exports.toggleMenu = function () {
  return {
    type: consts.TOGGLE_MENU_DRAWER
  }
};

module.exports.menuHeaderClicked = function (currentToolNamespace, currentGroupIndex, currentCheckIndex) {
  return ((dispatch) => {
      dispatch(CheckStoreActions.goToCheck(currentToolNamespace, currentGroupIndex, currentCheckIndex));
      dispatch(this.toggleSubmenu(currentGroupIndex));
  })
};
