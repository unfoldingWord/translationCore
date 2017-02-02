const api = window.ModuleApi;
const CheckStoreActions = require('./CheckStoreActions.js');

module.exports.toggleSubmenu = function () {
  return {
    type: "TOGGLE_SUBMENU",
    val: bool
  }
};

module.exports.menuHeaderClicked = function (currentToolNamespace, currentGroupIndex, currentCheckIndex, bool) {
  return ((dispatch) => {
      dispatch(CheckStoreActions.goToCheck(currentToolNamespace, currentGroupIndex, currentCheckIndex));
      dispatch({
        type: "TOGGLE_SUBMENU",
        val: bool
      });
  })
};
