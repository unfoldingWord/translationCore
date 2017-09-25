import consts from './ActionTypes';

/**
 * @description This action expands/collapses the submenu in the group menu
 * @param {bool} isSubMenuExpanded - true or false
 */

export const expandSubMenu = (isSubMenuExpanded) => {
  return {
    type: consts.GROUP_MENU_EXPAND_SUBMENU,
    isSubMenuExpanded
  };
};
