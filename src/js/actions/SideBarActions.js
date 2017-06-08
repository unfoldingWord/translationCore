import consts from './ActionTypes';
// actions
import * as CheckStoreActions from './CheckStoreActions';

export function toggleSubmenu(id) {
  return {
    type: consts.TOGGLE_SUBMENU,
    openCheck: id
  }
}

export function toggleMenu() {
  return {
    type: consts.TOGGLE_MENU_DRAWER
  }
}

export function menuHeaderClicked(currentGroupIndex, currentCheckIndex) {
  return ((dispatch) => {
    dispatch(CheckStoreActions.goToCheck(currentGroupIndex, currentCheckIndex));
    dispatch(this.toggleSubmenu(currentGroupIndex));
  })
}
