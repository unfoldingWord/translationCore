/**
 * @module Actions/GroupMenu
 */

import consts from './ActionTypes';
import { changeCurrentContextId } from './ContextIdActions';

/**
 * @description This action expands/collapses the submenu in the group menu
 * @param {bool} isSubMenuExpanded - true or false
 */

export const expandSubMenu = isSubMenuExpanded => ({
  type: consts.GROUP_MENU_EXPAND_SUBMENU,
  isSubMenuExpanded,
});

/**
 * Changes the group in the group menu
 * @param contextId
 * @return {Function}
 */
export const changeGroup = contextId => dispatch => {
  dispatch(changeCurrentContextId(contextId));
  dispatch(expandSubMenu(true));
};

/**
 * @description Sets filter for what items to show.
 * @param {string} name - name of filter to toggle.
 */
export const setFilter = (name, value) => ({
  type: consts.GROUP_MENU_SET_FILTER,
  name,
  value,
});
