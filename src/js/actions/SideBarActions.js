const api = window.ModuleApi;
const CheckStoreActions = require('./CheckStoreActions.js');

module.exports.toggleSubmenu = function (id) {
  return {
    type: "TOGGLE_SUBMENU",
    openCheck: id,
  }
};

module.exports.menuHeaderClicked = function (currentToolNamespace, currentGroupIndex, currentCheckIndex) {
  return ((dispatch) => {
      dispatch(CheckStoreActions.goToCheck(currentToolNamespace, currentGroupIndex, currentCheckIndex));
      dispatch(this.toggleSubmenu(currentGroupIndex));
  })
};
