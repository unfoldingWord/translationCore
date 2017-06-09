import consts from './ActionTypes';

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
