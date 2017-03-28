import CheckStoreActions from './CheckStoreActions.js';
import consts from './CoreActionConsts';

export const toggleSubmenu = function(id) {
  return {
    type: consts.TOGGLE_SUBMENU,
    openCheck: id
  };
};

export const toggleMenu = function() {
  return {
    type: consts.TOGGLE_MENU_DRAWER
  };
};

export const menuHeaderClicked = function(currentToolNamespace, currentGroupIndex, currentCheckIndex) {
  return ((dispatch) => {
    dispatch(CheckStoreActions.goToCheck(currentToolNamespace, currentGroupIndex, currentCheckIndex));
    dispatch(this.toggleSubmenu(currentGroupIndex));
  });
};
