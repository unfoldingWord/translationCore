const api = window.ModuleApi;
const CheckStoreActions = require('./CheckStoreActions.js');

module.exports.toggleSubmenu = function (currentToolNamespace, id, currentGroupIndex, bool) {
  return ((dispatch) => {
      dispatch(CheckStoreActions.goToCheck(currentToolNamespace, id, currentGroupIndex));
      dispatch({
        type: "TOGGLE_SUBMENU",
        val: bool
      });
  })
};
